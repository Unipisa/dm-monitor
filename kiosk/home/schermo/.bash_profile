if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ]; then
    exec /home/schermo/kiosk.sh
fi
