#!/usr/bin/env bash
# Local dev server — accessible via localhost and your LAN IP (work Wi-Fi friendly)
PORT="${PORT:-8888}"

echo "Starting wish dev server on port ${PORT}..."
echo ""
echo "  Home:   http://localhost:${PORT}/"
echo "  Board:  http://localhost:${PORT}/board.html"
echo "  Admin:  http://localhost:${PORT}/api/admin/login.php"
echo ""

for iface in $(ifconfig -l 2>/dev/null); do
    ip=$(ipconfig getifaddr "$iface" 2>/dev/null)
    if [ -n "$ip" ]; then
        echo "  LAN (${iface}): http://${ip}:${PORT}/"
    fi
done

echo ""
echo "Press Ctrl+C to stop."
echo ""

cd "$(dirname "$0")"
php -S "0.0.0.0:${PORT}" -t .
