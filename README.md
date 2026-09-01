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
