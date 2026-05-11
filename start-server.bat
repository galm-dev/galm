@echo off
setlocal

cd /d "%~dp0"

if "%PORT%"=="" set "PORT=4173"

node server.mjs
