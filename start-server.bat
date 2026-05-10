@echo off
setlocal

cd /d "%~dp0"

if "%PORT%"=="" set "PORT=4173"

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  py -3 -m http.server %PORT%
) else (
  python -m http.server %PORT%
)
