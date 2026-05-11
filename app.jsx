// app.jsx — GALM.AI main app

const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = {
  "palette": ["#4FB6D8", "#0A0A0B", "#F2EFE6"],
  "fontPair": "bricolage",
  "intensity": "balanced"
};

const PALETTES = {
  lime:    ["#4FB6D8", "#0A0A0B", "#F2EFE6"],
  orange:  ["#FF5A1F", "#0A0A0B", "#F2EFE6"],
  blue:    ["#5B5BFF", "#0A0A0B", "#F2EFE6"],
  ice:     ["#7DF9FF", "#06080A", "#EAF4F7"],
  paper:   ["#0A0A0B", "#F2EFE6", "#0A0A0B"],
};

function usePalette(palette) {
  useEffect(() => {
    const [accent, bg, fg] = palette;
    const root = document.documentElement;
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--bg', bg);
    root.style.setProperty('--fg', fg);
    // recompute derivatives
    root.style.setProperty('--bg-2', shade(bg, fg, 0.04));
    root.style.setProperty('--fg-2', `color-mix(in srgb, ${fg} 62%, transparent)`);
    root.style.setProperty('--fg-3', `color-mix(in srgb, ${fg} 38%, transparent)`);
    root.style.setProperty('--line', `color-mix(in srgb, ${fg} 10%, transparent)`);
    root.style.setProperty('--line-2', `color-mix(in srgb, ${fg} 18%, transparent)`);
    root.style.setProperty('--accent-ink', bg);
    document.body.style.background = bg;
  }, [palette.join('|')]);
}

function useFontPair(pair) {
  useEffect(() => {
    const root = document.documentElement;
    if (pair === 'bricolage') {
      root.style.setProperty('--display', '"Archivo", system-ui, sans-serif');
      root.style.setProperty('--body', '"Geist", system-ui, sans-serif');
    } else if (pair === 'instrument') {
      root.style.setProperty('--display', '"Instrument Serif", "Times New Roman", serif');
      root.style.setProperty('--body', '"Geist", system-ui, sans-serif');
    } else if (pair === 'mono') {
      root.style.setProperty('--display', '"Geist Mono", ui-monospace, monospace');
      root.style.setProperty('--body', '"Geist Mono", ui-monospace, monospace');
    }
  }, [pair]);
}

function shade(bg, fg, mix) {
  return `color-mix(in srgb, ${bg} ${(1 - mix) * 100}%, ${fg})`;
}

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useCursor() {
  useEffect(() => {
    if (!matchMedia('(hover: hover)').matches) return;
    const el = document.createElement('div');
    el.className = 'cursor';
    document.body.appendChild(el);
    let x = 0, y = 0, tx = 0, ty = 0;
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener('mousemove', move);
    let raf;
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      raf = requestAnimationFrame(loop);
    };
    loop();
    const targets = document.querySelectorAll('a, button, .product-card, .orb');
    const enter = () => el.classList.add('lg');
    const leave = () => el.classList.remove('lg');
    targets.forEach((t) => {
      t.addEventListener('mouseenter', enter);
      t.addEventListener('mouseleave', leave);
    });
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
      el.remove();
    };
  }, []);
}

// ─── Custom G ───
function GImg({ className = '' }) {
  return <img src="images/g.png" alt="G" className={`g-img ${className}`} draggable="false" />;
}

// ─── Logo ───
function Logo() {
  return (
    <a href="#top" className="logo" aria-label="GALM">
      <span className="logo-word"><GImg className="g-img--nav" />ALM</span>
    </a>
  );
}

// ─── Lang toggle ───
function Lang({ lang, setLang }) {
  const trackRef = useRef(null);
  const dragStartRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [previewLang, setPreviewLang] = useState(lang);

  useEffect(() => {
    if (!dragStartRef.current) setPreviewLang(lang);
  }, [lang]);

  const langFromPointer = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return lang;
    return clientX < rect.left + rect.width / 2 ? 'en' : 'pt';
  };

  const updateFromPointer = (event, commit = false) => {
    const next = langFromPointer(event.clientX);
    setPreviewLang(next);
    if (commit) setLang(next);
  };

  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateFromPointer(event);
  };

  const onPointerMove = (event) => {
    const start = dragStartRef.current;
    if (!start) return;
    if (Math.abs(event.clientX - start.x) > 3 || Math.abs(event.clientY - start.y) > 3) {
      suppressClickRef.current = true;
    }
    updateFromPointer(event);
  };

  const onPointerUp = (event) => {
    if (!dragStartRef.current) return;
    updateFromPointer(event, true);
    dragStartRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const chooseLang = (next) => {
    setPreviewLang(next);
    setLang(next);
  };

  const onClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      ref={trackRef}
      className={`lang ${previewLang === 'pt' ? 'is-pt' : 'is-en'}`}
      role="group"
      aria-label="Language"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
    >
      <span className="lang-thumb" aria-hidden="true" />
      <button type="button" className={previewLang === 'en' ? 'on' : ''} onClick={() => chooseLang('en')}>EN</button>
      <button type="button" className={previewLang === 'pt' ? 'on' : ''} onClick={() => chooseLang('pt')}>PT</button>
    </div>
  );
}

// ─── Nav ───
function Nav({ lang, setLang, t }) {
  return (
    <nav className="nav">
      <Logo />
      <div className="nav-r">
        <a href="#products">{t.nav.products}</a>
        <a href="#manifesto">{t.nav.manifesto}</a>
        <a href="#contact">{t.nav.contact}</a>
        <Lang lang={lang} setLang={setLang} />
      </div>
    </nav>
  );
}

// ─── Site intro ───
function SiteIntro() {
  const [leaving, setLeaving] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minDelay = reduceMotion ? 450 : 1800;
    const maxDelay = reduceMotion ? 1600 : 4500;
    let minDone = false;
    let heroReady = false;
    let leaveStarted = false;
    let hideTimer;

    document.body.classList.add('intro-lock');

    const beginLeave = () => {
      if (leaveStarted) return;
      leaveStarted = true;
      document.body.classList.remove('intro-lock');
      setLeaving(true);
      hideTimer = window.setTimeout(() => setHidden(true), reduceMotion ? 380 : 1050);
    };

    const maybeLeave = () => {
      if (minDone && heroReady) beginLeave();
    };

    const onHeroReady = () => {
      heroReady = true;
      maybeLeave();
    };

    const minTimer = window.setTimeout(() => {
      minDone = true;
      maybeLeave();
    }, minDelay);
    const maxTimer = window.setTimeout(beginLeave, maxDelay);

    window.addEventListener('galm:hero-ready', onHeroReady);

    return () => {
      window.removeEventListener('galm:hero-ready', onHeroReady);
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.clearTimeout(hideTimer);
      document.body.classList.remove('intro-lock');
    };
  }, []);

  if (hidden) return null;

  return (
    <div className={`site-intro${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="intro-half intro-half-top">
        <div className="intro-logo intro-logo-top">
          <div className="intro-wordmark">
            <span className="intro-mark-wrap"><GImg className="g-img--intro" /></span>
            <div className="intro-word-reveal">
              <span className="intro-alm">ALM</span><span className="intro-ai">.AI</span>
            </div>
          </div>
        </div>
      </div>
      <div className="intro-half intro-half-bottom">
        <div className="intro-logo intro-logo-bottom">
          <div className="intro-wordmark">
            <span className="intro-mark-wrap"><GImg className="g-img--intro" /></span>
            <div className="intro-word-reveal">
              <span className="intro-alm">ALM</span><span className="intro-ai">.AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ───
function Hero({ t }) {
  const canvasRef = React.useRef(null);
  const sectionRef = React.useRef(null);
  const targetRef = React.useRef(0);
  const currentRef = React.useRef(0);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const sec = sectionRef.current;
    if (!canvas || !sec) return;

    let raf;
    let running = false;
    let cancelled = false;
    // Sparse array: pre-allocated to FRAMES size, slots are null until extracted.
    // Non-sequential extraction fills slots out-of-order — findNearestFrame handles gaps.
    let frames = null;
    let totalFrames = 0;
    let vw = 0, vh = 0;
    let displayVid = null; // fallback display — never seeked during extraction (avoids jank)
    let extractVid = null; // extraction only — seeked aggressively, never drawn to canvas directly
    let lastDrawnIdx = -2; // skip redundant GPU draws when frame hasn't changed
    let heroReadyDispatched = false;

    const MAX_FRAME_W = 1280;
    const SCRUB_EASE = 0.075;
    const FRAME_BASE = 'media/hero-frames/';

    const ctx = canvas.getContext('2d', { alpha: false });

    const dispatchHeroReady = () => {
      if (cancelled || heroReadyDispatched) return;
      heroReadyDispatched = true;
      window.dispatchEvent(new CustomEvent('galm:hero-ready'));
    };

    // Walk outward from targetIdx to find the nearest already-extracted slot
    const findNearest = (targetIdx) => {
      if (!frames) return -1;
      if (frames[targetIdx] !== null) return targetIdx;
      for (let d = 1; d < totalFrames; d++) {
        if (targetIdx - d >= 0 && frames[targetIdx - d] !== null) return targetIdx - d;
        if (targetIdx + d < totalFrames && frames[targetIdx + d] !== null) return targetIdx + d;
      }
      return -1;
    };

    const drawFrame = (scrub) => {
      if (!vw || !vh) return;
      const cw = canvas.width, ch = canvas.height;
      const cr = cw / ch, ir = vw / vh;
      let dw, dh, dx, dy;
      if (ir > cr) { dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0; }
      else { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }

      const targetIdx = totalFrames > 0
        ? Math.max(0, Math.min(totalFrames - 1, Math.round(scrub * (totalFrames - 1))))
        : -1;

      const nearest = findNearest(targetIdx);
      if (nearest >= 0) {
        if (nearest === lastDrawnIdx) return; // same frame already on canvas — skip
        ctx.drawImage(frames[nearest], dx, dy, dw, dh);
        lastDrawnIdx = nearest;
      } else if (displayVid && displayVid.readyState >= 2) {
        // No cached frames yet. displayVid stays at time=0 (never seeked during extraction)
        // so this always shows the first video frame — stable, no jank.
        lastDrawnIdx = -2;
        ctx.drawImage(displayVid, dx, dy, dw, dh);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      lastDrawnIdx = -2;
      drawFrame(currentRef.current);
    };

const computeTarget = () => {
  const rect = sec.getBoundingClientRect();
  const total = sec.offsetHeight - window.innerHeight;
  const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
  const p = total > 0 ? scrolled / total : 0;

  const curtainStart =
    (sec.offsetHeight - 2 * window.innerHeight) /
    (sec.offsetHeight - window.innerHeight);

  const VIDEO_END_INTO_CURTAIN = 0.80;
  const videoEnd = curtainStart + (1 - curtainStart) * VIDEO_END_INTO_CURTAIN;

  targetRef.current = Math.min(1, p / videoEnd);

  if (!running) loop();
};

    const loop = () => {
      running = true;
      const next = currentRef.current + (targetRef.current - currentRef.current) * SCRUB_EASE;
      currentRef.current = next;
      drawFrame(next);
      if (Math.abs(targetRef.current - next) > 0.0005) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };

    // Yields main thread between extraction steps — pauses during active scroll, resumes on idle
    const yieldToMain = () => new Promise(resolve => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(resolve, { timeout: 50 });
      } else {
        setTimeout(resolve, 0);
      }
    });

    const buildOrder = (FRAMES) => {
      const seen = new Set();
      const order = [];
      for (const r of [0, 1, 0.5, 0.25, 0.75, 0.125, 0.375, 0.625, 0.875]) {
        const idx = Math.max(0, Math.min(FRAMES - 1, Math.round(r * (FRAMES - 1))));
        if (!seen.has(idx)) { order.push(idx); seen.add(idx); }
      }
      for (let i = 0; i < FRAMES; i++) {
        if (!seen.has(i)) order.push(i);
      }
      return order;
    };

    const criticalFrameIndexes = (FRAMES) => (
      [0, 0.25, 0.5, 0.75, 1].map((r) =>
        Math.max(0, Math.min(FRAMES - 1, Math.round(r * (FRAMES - 1))))
      )
    );

    const criticalFramesReady = (FRAMES) => (
      criticalFrameIndexes(FRAMES).every((idx) => frames && frames[idx])
    );

    const loadManifestFrame = async (fileNames, frameIdx) => {
      const response = await fetch(FRAME_BASE + fileNames[frameIdx]);
      if (!response.ok) throw new Error(`frame ${frameIdx} failed`);
      const blob = await response.blob();
      if (cancelled) return null;
      return createImageBitmap(blob);
    };

    const loadFromManifest = async (manifest) => {
      const fileNames = manifest.frames;
      const FRAMES = fileNames.length;
      if (FRAMES < 2) return;
      totalFrames = FRAMES;
      if (!frames || frames.length !== FRAMES) frames = new Array(FRAMES).fill(null);
      for (const frameIdx of buildOrder(FRAMES)) {
        if (cancelled) return;
        if (frames[frameIdx]) continue;
        try {
          const bitmap = await loadManifestFrame(fileNames, frameIdx);
          if (cancelled) return;
          frames[frameIdx] = bitmap;
          if (criticalFramesReady(FRAMES)) dispatchHeroReady();
        } catch (_) {}
        await yieldToMain();
      }
    };

    const loadFromVideo = async (dur) => {
      extractVid = document.createElement('video');
      extractVid.muted = true; extractVid.playsInline = true; extractVid.preload = 'auto';
      extractVid.src = 'media/hero.mp4';
      await new Promise((resolve, reject) => {
        if (extractVid.readyState >= 1) { resolve(); return; }
        extractVid.addEventListener('loadedmetadata', resolve, { once: true });
        extractVid.addEventListener('error', reject, { once: true });
      });
      if (cancelled) return;
      const FRAMES = Math.min(60, Math.max(20, Math.round(dur * 24)));
      totalFrames = FRAMES;
      frames = new Array(FRAMES).fill(null);
      const scale = Math.min(1, MAX_FRAME_W / vw);
      const fw = Math.round(vw * scale), fh = Math.round(vh * scale);
      for (const frameIdx of buildOrder(FRAMES)) {
        if (cancelled) return;
        const tt = (frameIdx / (FRAMES - 1)) * dur;
        await new Promise(resolve => {
          const onSeeked = () => { extractVid.removeEventListener('seeked', onSeeked); resolve(); };
          extractVid.addEventListener('seeked', onSeeked);
          try { extractVid.currentTime = Math.min(tt, dur - 0.001); }
          catch (e) { resolve(); }
        });
        if (cancelled) return;
        const c = document.createElement('canvas');
        c.width = fw; c.height = fh;
        c.getContext('2d').drawImage(extractVid, 0, 0, fw, fh);
        frames[frameIdx] = c;
        await yieldToMain();
      }
      if (extractVid) { try { extractVid.src = ''; } catch (_) {} extractVid = null; }
    };

    const preload = async () => {
      try {
        let manifest = null;
        await fetch('media/hero-frames/manifest.json')
          .then(r => r.ok ? r.json() : null)
          .then(m => { manifest = m; })
          .catch(() => {});
        if (cancelled) return;

        if (manifest && Array.isArray(manifest.frames) && manifest.frames.length >= 2) {
          totalFrames = manifest.frames.length;
          frames = new Array(totalFrames).fill(null);
          let firstFrame = null;
          try {
            firstFrame = await loadManifestFrame(manifest.frames, 0);
          } catch (_) {}
          if (cancelled) return;
          if (firstFrame) {
            frames[0] = firstFrame;
            vw = manifest.width || firstFrame.width;
            vh = manifest.height || firstFrame.height;
            setReady(true);
            resize();
            drawFrame(0);
            computeTarget();
            if (criticalFramesReady(totalFrames)) dispatchHeroReady();
            await loadFromManifest(manifest);
            return;
          }
        }

        displayVid = document.createElement('video');
        displayVid.muted = true; displayVid.playsInline = true; displayVid.preload = 'auto';
        displayVid.src = 'media/hero.mp4';
        await new Promise((resolve, reject) => {
          if (displayVid.readyState >= 1) { resolve(); return; }
          displayVid.addEventListener('loadedmetadata', resolve, { once: true });
          displayVid.addEventListener('error', reject, { once: true });
        });
        if (cancelled) return;
        vw = displayVid.videoWidth;
        vh = displayVid.videoHeight;
        setReady(true);
        resize();
        computeTarget();
        dispatchHeroReady();
        await loadFromVideo(displayVid.duration || 1);
      } catch (e) {
        console.warn('hero preload failed', e);
      }
    };

    preload();
    window.addEventListener('scroll', computeTarget, { passive: true });
    window.addEventListener('resize', resize);

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', computeTarget);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
      if (displayVid) { try { displayVid.src = ''; } catch (_) {} displayVid = null; }
      if (extractVid) { try { extractVid.src = ''; } catch (_) {} extractVid = null; }
    };
  }, []);

  return (
    <section className="hero" id="top" data-screen-label="01 Hero" ref={sectionRef}>
      <div className="hero-video-wrap" aria-hidden="true">
        <canvas ref={canvasRef} className="hero-video"></canvas>
        {!ready && (
          <div className="hero-loading">
            <span>LOADING…</span>
          </div>
        )}
        <div className="hero-video-vignette"></div>
        <div className="hero-inner">
          <div className="eyebrow">{t.hero.eyebrow}</div>
          <h1 className="hero-headline">
            <span className="word"><span style={{animationDelay: '.05s'}}>{t.hero.h1a}</span></span>
            <br />
            <span className="word"><span className="ital" style={{animationDelay: '.18s'}}>{t.hero.h1b}</span></span>
          </h1>
          <div className="hero-bottom">
            <p className="hero-sub reveal">{t.hero.sub}</p>
            <div className="hero-meta reveal">
              <div className="row"><span>↳</span><span>{t.hero.meta1}</span></div>
              <div className="row"><span>↳</span><span>{t.hero.meta2}</span></div>
              <div className="row"><span>●</span><span>{t.hero.meta3}</span></div>
            </div>
          </div>
          <div className="hero-scrollhint" aria-hidden="true">
            <span>SCROLL</span>
            <svg viewBox="0 0 12 24" width="10" height="20" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 2v18M2 16l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Ticker ───
function Ticker({ t, className = '' }) {
  const items = t.ticker;
  const repeated = [...items, ...items, ...items, ...items];
  const classes = ['ticker', className].filter(Boolean).join(' ');
  return (
    <div className={classes} aria-hidden="true">
      <div className="ticker-inner">
        {repeated.map((it, i) => (
          <span key={i}>
            <span className="dot"></span>
            <span className={i % 2 === 0 ? '' : 'ital'}>{it}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Card animations ───
function ImportAIAnim() {
  return (
    <div className="anim anim-import">
      <div className="doc-mock">
        <div className="l med"></div>
        <div className="l short"></div>
        <div className="l"></div>
        <div className="l short"></div>
        <div className="l med"></div>
        <div className="l"></div>
        <div className="l lime"></div>
        <div className="l short"></div>
        <div className="l med"></div>
        <div className="l"></div>
      </div>
      <div className="scanline" style={{animationDelay: '0s'}}></div>
      <div className="scanline" style={{animationDelay: '1.4s'}}></div>
    </div>
  );
}

function TrackingAnim() {
  return (
    <div className="anim anim-track">
      <div className="globe">
        <svg viewBox="0 0 360 360">
          <circle className="grid-circle" cx="180" cy="180" r="160" />
          <circle className="grid-circle" cx="180" cy="180" r="120" />
          <circle className="grid-circle" cx="180" cy="180" r="80" />
          <ellipse className="grid-circle" cx="180" cy="180" rx="160" ry="60" />
          <ellipse className="grid-circle" cx="180" cy="180" rx="160" ry="110" />
          <line x1="20" y1="180" x2="340" y2="180" className="grid-circle" />
          <line x1="180" y1="20" x2="180" y2="340" className="grid-circle" />
          <path className="arc" d="M 60 220 Q 180 60 300 200" />
          <path className="arc delay" d="M 80 110 Q 220 290 320 130" />
          <circle className="pin" cx="60" cy="220" r="4" />
          <circle className="pin b" cx="300" cy="200" r="4" />
          <circle className="pin" cx="80" cy="110" r="4" />
          <circle className="pin b" cx="320" cy="130" r="4" />
        </svg>
      </div>
    </div>
  );
}

function CopilotAnim() {
  return (
    <div className="anim" style={{background: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%)'}}>
      <img src="images/world.png" alt="" aria-hidden="true" className="copilot-world" />
      <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, zIndex: 1}}>
        <g stroke="var(--line-2)" fill="none">
          <circle cx="200" cy="200" r="60" />
          <circle cx="200" cy="200" r="110" />
          <circle cx="200" cy="200" r="160" />
        </g>
        <g>
          <circle cx="200" cy="200" r="14" fill="var(--accent)">
            <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
        <g stroke="var(--accent)" strokeWidth="1">
          <line x1="200" y1="200" x2="80" y2="120">
            <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" />
          </line>
          <line x1="200" y1="200" x2="320" y2="100">
            <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin=".4s" repeatCount="indefinite" />
          </line>
          <line x1="200" y1="200" x2="340" y2="280">
            <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin=".8s" repeatCount="indefinite" />
          </line>
          <line x1="200" y1="200" x2="60" y2="290">
            <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
          </line>
        </g>
        <g fill="var(--fg-3)">
          <circle cx="80" cy="120" r="3" />
          <circle cx="320" cy="100" r="3" />
          <circle cx="340" cy="280" r="3" />
          <circle cx="60" cy="290" r="3" />
        </g>
      </svg>
    </div>
  );
}

// ─── Product Card ───
function ProductCard({ product, kicker, name_a, name_b, desc, anim, soon, open, onOpen }) {
  return (
    <article className="product-card reveal" onClick={() => onOpen(product)} data-screen-label={`Product ${name_a}${name_b}`}>
      {anim}
      <div className="body">
        <div className="top">
          <span>{kicker}</span>
          <span className="badge">{soon}</span>
        </div>
        <div className="name">
          {name_a}<span className="ai">{name_b === "AI" ? "AI" : ""}</span>
          {name_b !== "AI" && <><br/>{name_b}</>}
        </div>
        <p className="desc">{desc}</p>
      </div>
      <div className="arrow">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </article>
  );
}

// ─── Products section ───
function Products({ t, onOpen }) {
  const p = t.products;
  return (
    <section className="section" id="products" data-screen-label="02 Products">
      <div className="section-tag"><span>●</span><span>{p.tag}</span></div>
      <header className="products-head">
        <h2 className="products-title">
          {p.title_a}<br/><span className="ital">{p.title_b}</span>
        </h2>
        <p style={{color: 'var(--fg-2)', maxWidth: '46ch', fontSize: '17px'}}>{p.title_sub}</p>
      </header>
      <div className="product-grid">
        <ProductCard product="importai"
          kicker={p.importai.kicker} name_a={p.importai.name_a} name_b={p.importai.name_b}
          desc={p.importai.desc} anim={<ImportAIAnim />}
          soon={p.soon} open={p.open} onOpen={onOpen} />
        <ProductCard product="tracking"
          kicker={p.tracking.kicker} name_a={p.tracking.name_a} name_b={p.tracking.name_b}
          desc={p.tracking.desc} anim={<TrackingAnim />}
          soon={p.soon} open={p.open} onOpen={onOpen} />
      </div>
      <div style={{marginTop: '18px'}}>
        <ProductCard product="copilot"
          kicker={p.copilot.kicker} name_a={p.copilot.name_a} name_b={p.copilot.name_b}
          desc={p.copilot.desc} anim={<CopilotAnim />}
          soon={p.soon} open={p.open} onOpen={onOpen} />
      </div>
    </section>
  );
}

// ─── Manifesto ───
function Manifesto({ t }) {
  const m = t.manifesto;
  return (
    <section className="section" id="manifesto" data-screen-label="03 Manifesto">
      <div className="section-tag"><span>●</span><span>{m.tag}</span></div>
      <div className="manifesto-grid">
        <h2 className="manifesto reveal">
          {m.title_a} <span className="accent">{m.title_b}</span><br/>
          <span className="ital">{m.title_c} {m.title_d}</span>
        </h2>
        <div className="manifesto-side">
          {m.principles.map(([num, body], i) => (
            <div className="principle reveal" key={i} style={{transitionDelay: `${i * 0.08}s`}}>
              <span className="principle-num">{num}</span>
              <p className="principle-body" dangerouslySetInnerHTML={{__html: body}}></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───
function Foot({ t }) {
  const f = t.foot;
  return (
    <footer className="foot" id="contact" data-screen-label="04 Contact">
      <div className="foot-mark" aria-label="GALM.AI">
        <GImg className="g-img--foot" />ALM<span className="accent">{f.mark_b}</span>
      </div>
      <div className="foot-row">
        <div className="col"><span>{f.a}</span><span>{f.a_v}</span></div>
        <div className="col"><span>{f.b}</span><span>{f.b_v}</span></div>
        <div className="col"><span>{f.c}</span><span>{f.c_v}</span></div>
        <div className="col"><span>{f.d}</span></div>
      </div>
    </footer>
  );
}

// ─── Modal ───
function Modal({ product, t, onClose }) {
  if (!product) return null;
  const p = t.products[product];
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="label">{t.products.soon}</div>
        <h3>{p.name_a}{p.name_b === "AI" ? <span className="ai">AI</span> : <> <span>{p.name_b}</span></>}</h3>
        <p style={{marginTop: '12px'}}>{p.desc}</p>
        <div className="feats">
          {p.feats.map(([n, line], i) => (
            <div className="feat" key={i}>
              <span>{n}</span><span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Orb ───
function Orb({ t }) {
  return (
    <button className="orb" aria-label="Copilot — coming soon" onClick={() => {}}>
      <span className="orb-tip">{t.orb.tip}</span>
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}

// ─── App ───
function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('galm.lang') || 'en'; } catch (e) { return 'en'; }
  });
  const [open, setOpen] = useState(null);
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    try { localStorage.setItem('galm.lang', lang); } catch (e) {}
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  usePalette(tw.palette);
  useFontPair(tw.fontPair);
  useReveal();
  useCursor();

  const t = window.GALM_I18N[lang];

  return (
    <div className="shell">
      <SiteIntro />
      <div className="grain"></div>
      <Nav lang={lang} setLang={setLang} t={t} />
      <Hero t={t} />
      <div className="curtain-stack">
        <Ticker t={t} />
        <Products t={t} onOpen={setOpen} />
        <Ticker t={t} className="ticker-between" />
        <Manifesto t={t} />
        <Foot t={t} />
      </div>
      <Orb t={t} />
      {open && <Modal product={open} t={t} onClose={() => setOpen(null)} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette">
          <TweakColor label="Theme"
            value={tw.palette}
            options={[PALETTES.lime, PALETTES.orange, PALETTES.blue, PALETTES.ice, PALETTES.paper]}
            onChange={(v) => setTweak('palette', v)} />
        </TweakSection>
        <TweakSection label="Type">
          <TweakRadio label="Display font" value={tw.fontPair}
            options={[
              {value: 'bricolage', label: 'Grotesque'},
              {value: 'instrument', label: 'Serif'},
              {value: 'mono', label: 'Mono'},
            ]}
            onChange={(v) => setTweak('fontPair', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
