// app.jsx — GALM.AI main app

const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#D8FF3D", "#0A0A0B", "#F2EFE6"],
  "fontPair": "bricolage",
  "intensity": "balanced"
}/*EDITMODE-END*/;

const PALETTES = {
  lime:    ["#D8FF3D", "#0A0A0B", "#F2EFE6"],
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
  return (
    <div className="lang">
      <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
      <button className={lang === 'pt' ? 'on' : ''} onClick={() => setLang('pt')}>PT</button>
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

// ─── Hero ───
function Hero({ t }) {
  return (
    <section className="hero" id="top" data-screen-label="01 Hero">
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
    </section>
  );
}

// ─── Ticker ───
function Ticker({ t }) {
  const items = t.ticker;
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
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
      <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
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
      <div className="grain"></div>
      <Nav lang={lang} setLang={setLang} t={t} />
      <Hero t={t} />
      <Ticker t={t} />
      <Products t={t} onOpen={setOpen} />
      <Manifesto t={t} />
      <Foot t={t} />
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
