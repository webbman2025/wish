#!/usr/bin/env bash
# Start local wish site on port 8888 (works on localhost + LAN IP)
set -e
PORT=8888
cd "$(dirname "$0")"

if lsof -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port ${PORT} already in use — server may already be running."
else
    echo "Starting PHP server on port ${PORT}..."
    php -S "0.0.0.0:${PORT}" -t . > /tmp/wish-server.log 2>&1 &
    sleep 1
fi

echo ""
./show-urls.sh
