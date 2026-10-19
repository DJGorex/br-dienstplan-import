#!/bin/zsh
cd -- "${0:A:h}"
printf 'Dienstplan-PWA: http://localhost:4173\nZum Beenden Ctrl+C drücken.\n'
node server.mjs
