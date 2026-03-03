# Cookie Consent & Self-Hosted Fonts

## Overview

DSGVO-konformes Cookie-Consent-System mit 3 Kategorien. Alle Tracking-Scripts werden erst nach Einwilligung dynamisch geladen. Fonts werden lokal gehostet (kein Google CDN).

## Architektur

```
website/
├── _includes/cookie-consent.njk   ← Banner HTML + CSS
├── scripts/cookie-consent.js      ← Consent-Logik (~150 Zeilen)
├── scripts/tracking.js            ← Script-Loader (GA, LinkedIn, HubSpot)
├── fonts/                         ← 6 woff2-Dateien (self-hosted)
└── styles/base.css                ← @font-face Deklarationen
```

## Consent-Kategorien

| Kategorie | Dienste | Default | Änderbar |
|-----------|---------|---------|----------|
| Notwendig | Consent-Cookie | An | Nein |
| Analyse | Google Analytics 4 | Aus | Ja |
| Marketing | LinkedIn Insight Tag, HubSpot Tracking | Aus | Ja |

## UX-Flow

1. **Erstbesuch:** Banner am unteren Rand. 3 Buttons: "Alle akzeptieren" (Terracotta), "Nur notwendige" (Outline), "Einstellungen" (Text-Link)
2. **Einstellungen:** Klappt Toggles auf (Notwendig disabled/an, Analyse, Marketing). "Auswahl speichern" Button
3. **Wiederkehrend:** Kein Banner. Scripts laden gemäß gespeichertem Consent
4. **Ändern:** "Cookie-Einstellungen" im Footer oder Button auf der Datenschutz-Seite
5. **Widerruf:** Page Reload nach Änderung (Scripts können nicht entladen werden)

## Consent-Speicherung

**Client-seitig:**
- `localStorage` Key `ev_consent`:
  ```json
  {
    "necessary": true,
    "analytics": false,
    "marketing": false,
    "timestamp": "2026-03-03T14:22:00.000Z",
    "consentId": "uuid-v4"
  }
  ```
- Cookie `ev_consent_given` (365 Tage) als schneller Check

**Server-seitig (Nachweis gemäß Art. 7 Abs. 1 DSGVO):**
- Fire-and-forget POST an `/api/consent-log` bei jeder Consent-Entscheidung
- `consentId` wird client-seitig generiert (`crypto.randomUUID()`) — Zuordnung ohne personenbezogene Daten
- Banner funktioniert auch wenn Endpoint down ist

## Tracking IDs eintragen

Datei: `website/scripts/tracking.js`, Zeile 4-7:

```js
const TRACKING = {
  GA_ID: 'G-XXXXXXXXXX',           // ← GA4 Measurement ID
  LINKEDIN_PARTNER_ID: '0000000',  // ← LinkedIn Partner ID
  HUBSPOT_PORTAL_ID: '147929039',  // ← bereits korrekt
};
```

- GA4 ID findest du unter: Google Analytics > Admin > Data Streams > Measurement ID
- LinkedIn Partner ID findest du unter: LinkedIn Campaign Manager > Insight Tag
- Scripts mit Platzhalter-IDs werden nicht geladen (Guard im Code)

## Self-Hosted Fonts

6 woff2-Dateien in `website/fonts/`:

| Datei | Font | Gewichte | Subset |
|-------|------|----------|--------|
| space-grotesk.woff2 | Space Grotesk | 400-700 | Latin |
| space-grotesk-ext.woff2 | Space Grotesk | 400-700 | Latin Extended |
| manrope.woff2 | Manrope | 400-800 | Latin |
| manrope-ext.woff2 | Manrope | 400-800 | Latin Extended |
| inter.woff2 | Inter | 400-600 | Latin |
| inter-ext.woff2 | Inter | 400-600 | Latin Extended |

Variable Fonts — eine Datei pro Familie deckt alle Gewichte ab. `@font-face` Deklarationen stehen am Anfang von `styles/base.css`.

**Hinweis:** `brand.njk` lädt weiterhin JetBrains Mono von Google CDN (nur CI-Referenzseite, nicht öffentlich).

## Lokales Testen

```bash
cd website && npx @11ty/eleventy --serve --port=3000
```

1. DevTools > Application > Local Storage > `ev_consent` löschen
2. Seite neu laden → Banner erscheint
3. Network Tab prüfen: keine Tracking-Requests vor Consent
4. "Alle akzeptieren" klicken → GA/LinkedIn/HubSpot Scripts im Network Tab (nur mit echten IDs)
5. Seite neu laden → kein Banner, Scripts laden automatisch
6. Footer > "Cookie-Einstellungen" → Panel öffnet sich, Toggles zeigen gespeicherten State
7. "Nur notwendige" → Reload → keine Tracking-Scripts

## Dateien die geändert wurden

| Datei | Änderung |
|-------|----------|
| `_includes/base.njk` | Google Fonts CDN Link entfernt. Consent-Partial + Scripts vor `</body>` |
| `_includes/footer.njk` | "Cookie-Einstellungen" Link eingefügt |
| `styles/base.css` | `@font-face` Deklarationen am Anfang |
| `.eleventy.js` (CI) | Passthrough für `scripts/` und `fonts/` |
| `../../.eleventy.js` (Dev) | Passthrough für `scripts/` und `fonts/` |
| `datenschutz.njk` | Abschnitte 4.4 (GA4), 4.5 (LinkedIn), Cookie-Tabelle, Settings-Button, Drittlandtransfers |
