#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-4173}"
PORT="$PORT" node server.mjs
