# dm-monitor
Pagina HTML da visualizzare sullo schermo nell'atrio del dipartimento

Lo puoi vedere qui: 
produzione: https://unipisa.github.io/dm-monitor/
test: https://unipisa.github.io/dm-monitor/?test

## Development

```
npm run dev
```

## Build

```
npm run build
npm run preview
```

## kiosk

Per configurare la macchina collegata allo schermo trovi i files nella directory kiosk. Devi seguire le istruzioni seguenti.

### 1. Installa i pacchetti software necessari
sudo apt update && sudo apt install -y cage firefox-esr systemd

### 2. Estrai l'archivio mantenendo le risorse nei percorsi originali
sudo tar -xzvf kiosk_backup.tgz -C /

### 3. Imposta i permessi corretti per lo script utente
chmod +x ~/kiosk.sh

### 4. Ricarica la configurazione di systemd per l'autologin
sudo systemctl daemon-reload

### 5. Attiva il controllo automatico degli aggiornamenti

Il kiosk controlla ogni minuto il file `version.json` pubblicato su GitHub Pages.
Quando cambia il commit, riavvia Cage e Firefox tramite l'autologin. Il primo
controllo registra la versione senza riavviare; gli errori di rete non interrompono
la visualizzazione. Non serve accesso SSH da GitHub Actions né una VPN.

Dalla radice di una copia aggiornata del repository sul kiosk:

```bash
sudo apt install -y python3 procps ca-certificates
sudo install -m 755 kiosk/usr/local/bin/dm-monitor-update /usr/local/bin/dm-monitor-update
sudo install -m 644 kiosk/etc/systemd/system/dm-monitor-update.service /etc/systemd/system/
sudo install -m 644 kiosk/etc/systemd/system/dm-monitor-update.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now dm-monitor-update.timer
sudo systemctl start dm-monitor-update.service
```

Pubblica prima il workflow aggiornato per rendere disponibile `version.json`.
Per controllare l'esito usa `journalctl -u dm-monitor-update.service -n 20 --no-pager`.
I dettagli e i comandi di gestione sono nel [README del kiosk](kiosk/home/schermo/README).
