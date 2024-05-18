#!/bin/bash

export DISPLAY=:0

sleep 10

killall firefox-esr

sleep 2

unclutter &

nohup firefox --kiosk https://unipisa.github.io/dm-monitor >/dev/null 2>&1 &
