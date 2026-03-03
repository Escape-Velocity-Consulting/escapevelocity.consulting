# Server Admin Briefing: Cookie Consent Deploy

## Was passiert ist

Die Website hat jetzt ein Cookie-Consent-Banner und selbst-gehostete Fonts. Nach dem nächsten Deploy auf `escapevelocity.consulting` müssen auf dem Server zwei Dinge angepasst werden:

1. CSP Header aktualisieren (Pflicht)
2. Consent-Log Endpoint einrichten (empfohlen)

---

## 1. CSP Header (Caddy) — Pflicht

### Neue Domains hinzufügen

**script-src:**
```
googletagmanager.com
google-analytics.com
snap.licdn.com
js-eu1.hs-scripts.com
js.hs-analytics.net
```

**connect-src:**
```
google-analytics.com
analytics.google.com
px.ads.linkedin.com
```

**img-src:**
```
px.ads.linkedin.com
track.hubspot.com
```

### Domains entfernen

Fonts werden jetzt lokal gehostet. Diese Domains können aus der CSP entfernt werden:

```
fonts.googleapis.com
fonts.gstatic.com
```

---

## 2. Consent-Log Endpoint — Empfohlen

Für den DSGVO-Nachweis (Art. 7 Abs. 1) loggt das Cookie-Banner jede Consent-Entscheidung per POST an `/api/consent-log`. Das Banner funktioniert auch ohne diesen Endpoint (fire-and-forget), aber der Nachweis fehlt dann.

### Option A: Caddy-only (simpelste Variante)

Caddy gibt 204 zurück, die Consent-Daten landen im Access Log.

```caddyfile
route /api/consent-log {
    @post method POST
    respond @post 204
}
```

Vorteil: Kein extra Prozess. Nachteil: Consent-Daten müssen aus dem Access Log extrahiert werden.

### Option B: Eigenes Log-Script (strukturierter)

Kleines Node.js-Script das JSON-Lines in eine Datei schreibt.

**Datei:** z.B. `/opt/consent-log/server.js`

```js
const http = require('http');
const fs = require('fs');

const LOG_FILE = '/mnt/pd/data/logs/consent.jsonl';
const PORT = 3001;

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://escapevelocity.consulting');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    return res.end();
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      // Validate it's JSON, then append
      JSON.parse(body);
      fs.appendFileSync(LOG_FILE, body + '\n');
    } catch (e) {
      // Invalid JSON — ignore
    }
    res.writeHead(204);
    res.end();
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('Consent log listening on port ' + PORT);
});
```

**Caddy-Route:**

```caddyfile
route /api/consent-log {
    reverse_proxy localhost:3001
}
```

**Systemd Service** (optional, damit es nach Reboot läuft):

```ini
# /etc/systemd/system/consent-log.service
[Unit]
Description=Consent Log Server
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/consent-log/server.js
Restart=on-failure
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable consent-log
sudo systemctl start consent-log
```

**Log-Datei:** `/mnt/pd/data/logs/consent.jsonl`

Jede Zeile ist ein JSON-Objekt:
```json
{"action":"grant","categories":{"necessary":true,"analytics":true,"marketing":false},"timestamp":"2026-03-03T14:22:00.000Z","consentId":"a1b2c3d4-..."}
```

- `action`: `grant` (Ersteinwilligung), `update` (Änderung), `revoke` (Widerruf)
- `consentId`: Client-generierte UUID, keine personenbezogenen Daten
- Kein IP-Logging, kein User-Agent — minimale Datenerhebung

**Log-Rotation** (optional):

```bash
# /etc/logrotate.d/consent-log
/mnt/pd/data/logs/consent.jsonl {
    monthly
    rotate 12
    compress
    missingok
    notifempty
}
```

---

## 3. Empfehlung

Starte mit **Option A** (Caddy 204). Wenn strukturierte Logs gebraucht werden, auf Option B upgraden. Das Banner funktioniert in beiden Fällen identisch.

---

## Reihenfolge

1. Code deployen (passiert automatisch via GitHub Actions bei Push auf main)
2. CSP Header in Caddy anpassen
3. Consent-Log Endpoint einrichten (A oder B)
4. Caddy reload: `sudo systemctl reload caddy`
5. Testen: Seite aufrufen, Banner sollte erscheinen, Network Tab prüfen
