#!/usr/bin/env bash
# Print local URLs for testing on this machine and other devices on the same Wi-Fi
PORT="${PORT:-8888}"

echo "Wish board — local URLs (port ${PORT})"
echo ""
echo "  This Mac:"
echo "    http://localhost:${PORT}/"
echo "    http://localhost:${PORT}/board.html"
echo "    http://localhost:${PORT}/api/admin/login.php"
echo ""

FOUND=0
for iface in $(ifconfig -l 2>/dev/null); do
    ip=$(ipconfig getifaddr "$iface" 2>/dev/null)
    if [ -n "$ip" ]; then
        FOUND=1
        echo "  LAN (${iface}):"
        echo "    http://${ip}:${PORT}/"
        echo "    http://${ip}:${PORT}/board.html"
        echo ""
    fi
done

if [ "$FOUND" -eq 0 ]; then
    echo "  No LAN IP found — connect to Wi-Fi first."
    echo ""
fi

echo "Note: Other devices must be on the same Wi-Fi."
echo "      Some office networks block device-to-device access."
