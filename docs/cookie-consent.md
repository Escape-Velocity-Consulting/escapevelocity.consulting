# Cookie Consent & Tracking Architecture

DSGVO-konformes Cookie-Consent-System. Tracking-Tags laufen über **Google Tag Manager** (GTM-GNTWPNNL) mit **Google Consent Mode v2** — Signals sind default-denied und werden vom Banner live aktualisiert. Fonts werden lokal gehostet (kein Google CDN).

## Architektur

```
website/
├── _includes/base.njk              ← GTM snippet + Consent Mode default + localStorage restore (head)
├── _includes/cookie-consent.njk    ← Banner HTML + CSS
├── scripts/cookie-consent.js       ← Consent-Logik, ruft window.updateConsent()
├── scripts/tracking.js             ← Consent Mode v2 Bridge (window.updateConsent)
├── fonts/                          ← 6 woff2-Dateien (self-hosted)
├── styles/base.css                 ← @font-face Deklarationen
└── docs/gtm-setup.md               ← GTM UI configuration guide
```

**Laufzeit-Flow:**

```
1. base.njk <head>:
   a. gtag('consent', 'default', {...all tracking denied..., wait_for_update: 500})
   b. IF localStorage.ev_consent exists → gtag('consent', 'update', {...stored state})
   c. GTM container (GTM-GNTWPNNL) loads

2. GTM evaluates tags with granted/denied state → fires or blocks tags

3. cookie-consent.js at end of body:
   - returning visitor: updateConsent() fires again (idempotent)
   - new visitor: banner shows, user interaction triggers updateConsent()
   - POST /api/consent-log (DSGVO evidence trail)
```

**Warum Consent Mode v2 statt Hard-Gating?**

- GA4 liefert "cookieless pings" bei denied — modellierte Konversionen bleiben trackbar
- Für Google Ads EEA-Traffic ab März 2024 verpflichtend
- Consent-Änderungen während der Session wirken sofort, ohne Reload (außer bei Downgrade)

## Consent-Kategorien

| Kategorie | Google Consent Mode v2 Signals | Default | Änderbar |
|-----------|--------------------------------|---------|----------|
| Notwendig | `functionality_storage`, `security_storage` | Granted | Nein |
| Analyse | `analytics_storage` | Denied | Ja |
| Marketing | `ad_storage`, `ad_user_data`, `ad_personalization` | Denied | Ja |

Einzelne Tags (GA4, LinkedIn, HubSpot, X) werden **in der GTM UI** konfiguriert, nicht im Code. Siehe [`gtm-setup.md`](gtm-setup.md).

## UX-Flow

1. **Erstbesuch:** Banner am unteren Rand. 3 Buttons: "Alle akzeptieren" (Terracotta), "Nur notwendige" (Outline), "Einstellungen" (Text-Link)
2. **Einstellungen:** Klappt Toggles auf (Notwendig disabled/an, Analyse, Marketing). "Auswahl speichern" Button
3. **Wiederkehrend:** Kein Banner. Consent wird inline im `<head>` aus localStorage wiederhergestellt, bevor GTM lädt
4. **Ändern:** "Cookie-Einstellungen" im Footer oder Button auf der Datenschutz-Seite
5. **Reload:** Nur bei Downgrade (granted → denied für Analyse oder Marketing) — dann werden geladene Drittskripte entfernt. Upgrades (denied → granted) und Same-Level laufen ohne Reload

## In-Session Consent-Updates

Alle drei Banner-Aktionen propagieren live zu `window.updateConsent()` → `gtag('consent', 'update', ...)`:

| Aktion | updateConsent | Reload |
|---|---|---|
| Alle akzeptieren | ✓ granted | Nein |
| Nur notwendige (neu) | ✓ denied | Nein |
| Nur notwendige (nach Accept) | ✓ denied | Ja (wenn Downgrade) |
| Auswahl speichern — Upgrade | ✓ neue State | Nein |
| Auswahl speichern — Downgrade | ✓ neue State | Ja |

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

## Tag-Konfiguration

Tags werden **nicht im Code** konfiguriert. Tracking-IDs leben in der GTM UI:

| Tag | ID | Consent Signals |
|---|---|---|
| GA4 Configuration | `G-G29LZCZJSG` | Built-in `analytics_storage` (+ cookieless pings bei denied) |
| LinkedIn Insight | `9635737` | `ad_storage`, `ad_user_data` |
| HubSpot Tracking | `147929039` | `ad_storage` |
| X Pixel | `rbp2n` | `ad_storage`, `ad_personalization` |

Full setup guide: [`gtm-setup.md`](gtm-setup.md).

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

## CSP-Anforderungen

Caddy liefert den `Content-Security-Policy` Header. Für GTM + alle Tag-Hosts aktuell benötigt:

```
script-src:  'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com
             https://snap.licdn.com https://js-eu1.hs-scripts.com https://*.hs-analytics.net
             https://*.hscollectedforms.net https://*.usemessages.com https://*.hs-banner.com
             https://*.hsforms.net https://*.hsappstatic.net https://static.ads-twitter.com

connect-src: 'self' https://*.googletagmanager.com https://*.google-analytics.com https://analytics.google.com
             https://px.ads.linkedin.com https://*.hsforms.com https://*.hsforms.net https://*.hs-analytics.net
             https://*.hscollectedforms.net https://*.usemessages.com https://*.hs-banner.com
             https://*.hubspot.com https://*.hsappstatic.net

img-src:     'self' data: https: (permissives Wildcard deckt Pixel Fires ab)

frame-src:   'self' https://*.hsforms.com https://*.hsforms.net https://*.hubspot.com

style-src:   'self' 'unsafe-inline' https://fonts.googleapis.com  (HubSpot Chat lädt DM Sans/Serif von dort)
```

Offene Punkte / empfohlene Erweiterungen:
- **`connect-src`** sollte `https://*.googletagmanager.com` enthalten (GTM Debug/Preview Mode benötigt es — Tag Assistant warnt sonst)
- **`style-src`** sollte `https://fonts.googleapis.com` enthalten (HubSpot Chat Widget Fonts)
- Optional für Google Ads Enhanced Conversions: `connect-src` + `img-src` um `https://www.google.com`

Änderungen erfordern Zugriff auf Caddy-Config auf der VM.

## Lokales Testen

```bash
npx @11ty/eleventy --config C:/Users/tommi/business/.eleventy.js --serve --port=3000
```

1. DevTools > Application > Local Storage > `ev_consent` löschen
2. Seite neu laden → Banner erscheint, `consent default` in dataLayer
3. Network Tab: nur GTM-Container lädt, keine Tag-Requests (GA4, LinkedIn, HubSpot, X blockiert)
4. "Alle akzeptieren" klicken → `consent update` in dataLayer, Tags laden
5. Footer > "Cookie-Einstellungen" → Panel öffnet sich, Toggles zeigen gespeicherten State
6. Marketing-Toggle deaktivieren → "Auswahl speichern" → Reload (Downgrade)
7. Nach Reload: Head restored consent inline, Tags für Marketing laden nicht mehr

## Dateien

| Datei | Rolle |
|-------|-------|
| `_includes/base.njk` | GTM snippet, Consent Mode default, localStorage restore |
| `_includes/cookie-consent.njk` | Banner UI |
| `scripts/cookie-consent.js` | Banner-Logik, ruft updateConsent |
| `scripts/tracking.js` | Consent Mode v2 Bridge |
| `styles/base.css` | `@font-face` Deklarationen |
| `.eleventy.js` (Root und `website/`) | Passthrough für `scripts/`, `fonts/`, `gtmId` globalData |
| `datenschutz.njk` | DSGVO-Text: GA4, LinkedIn, HubSpot, X Tracking, Cookie-Tabelle |
