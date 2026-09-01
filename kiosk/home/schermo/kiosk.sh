#!/bin/bash

killall firefox-bin

# Attende che la connessione Internet sia attiva prima di avviare il kiosk
until ping -c 1 8.8.8.8 >/dev/null 2>&1; do
    echo "In attesa della connessione di rete..."
    sleep 2
done

# Disabilita il risparmio energetico / DPMS in ambiente Wayland
export WLR_DRM_NO_MODESET=0
export WLR_LIBINPUT_NO_DEVICES=0

# Avvia Cage con l'opzione -s per consentire lo switch tra le TTY
exec cage -s -- firefox --kiosk https://unipisa.github.io/dm-monitor
