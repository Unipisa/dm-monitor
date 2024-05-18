#!/bin/bash

export DISPLAY=:0

echo sleep 10

sleep 10

echo killall

killall firefox-esr

echo sleep 2

sleep 2

echo unclutter

unclutter >/dev/null 2>&1 &

echo run firefox

nohup firefox --kiosk https://unipisa.github.io/dm-monitor >/dev/null 2>&1 &

echo done