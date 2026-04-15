# Google Tag Manager Setup Guide

Step-by-step configuration of the GTM container for escapevelocity.consulting. Matches the code wiring in `base.njk` + `scripts/tracking.js` + `scripts/cookie-consent.js`.

**Container ID:** `GTM-GNTWPNNL`
**Consent model:** Google Consent Mode v2
**Status:** Phase 1 wiring in code ✅ · GTM UI config ⏳ (this document) · Quiz events ⏳

---

## Architecture Recap

```
base.njk <head>:
  1. gtag('consent', 'default', {…all denied…})   ← runs FIRST
  2. GTM snippet loads GTM-GNTWPNNL               ← runs SECOND

scripts/tracking.js (end of body):
  defines window.updateConsent(consent)           ← called by cookie-consent.js

scripts/cookie-consent.js (end of body):
  on load / accept / reject / save → calls updateConsent({analytics, marketing})
  which fires gtag('consent', 'update', …) with Consent Mode v2 signals
```

**Consent mapping (our 3 categories → Google Consent Mode v2):**

| Our category | Google signals |
|---|---|
| Notwendig (always granted) | `functionality_storage`, `security_storage` |
| Analyse | `analytics_storage` |
| Marketing | `ad_storage`, `ad_user_data`, `ad_personalization` |

---

## Part 1 — Container Setup

1. Open [tagmanager.google.com](https://tagmanager.google.com) and select the `escapevelocity.consulting` container.
2. **Admin → Container Settings** — confirm Container ID `GTM-GNTWPNNL`, Target: Web.

## Part 2 — Enable Built-in Variables

Variables → Configure (top right of Built-In Variables section). Enable:

- [ ] Page Path
- [ ] Page URL
- [ ] Page Hostname
- [ ] Click Classes
- [ ] Click Text
- [ ] Click URL
- [ ] Form Classes
- [ ] Form ID

## Part 3 — User-Defined Variables (Quiz Data Layer)

Variables → New → Data Layer Variable. Create one per parameter. Data Layer Version: 2.

| Variable Name | Data Layer Variable Name |
|---|---|
| DLV - quiz_question_id | `quiz_question_id` |
| DLV - quiz_question_type | `quiz_question_type` |
| DLV - quiz_answer_index | `quiz_answer_index` |
| DLV - quiz_section | `quiz_section` |
| DLV - quiz_score_total | `quiz_score_total` |
| DLV - quiz_bottleneck | `quiz_bottleneck` |
| DLV - quiz_routing | `quiz_routing` |

## Part 4 — Consent Mode Defaults (Container-Level)

Admin → Container Settings → Additional Settings → **Enable consent overview** ✅.

Tags tab → top-right shield icon (Consent Overview) should show green. When you create tags below, set each tag's consent settings under **Advanced Settings → Consent Settings → Require additional consent for tag to fire**.

## Part 5 — Tags

### Consent Settings primer

GTM has two consent mechanisms for tags:

| Mechanism | Applies to | What you do |
|---|---|---|
| **Built-In Consent Checks** | Google Tag (GA4), Google Ads, Floodlight | Read-only. Google-owned tags auto-declare which signals they listen to. You can't change this — nothing to configure. The tag *always fires*, but behaves differently based on consent (cookieless pings when denied, full tracking when granted). This is the whole point of Consent Mode v2. |
| **Additional Consent** ("Require additional consent for tag to fire") | Custom HTML tags (3rd-party pixels) | You set this. Add the consent types that must be `granted` before GTM will fire the tag at all. Hard block. |

### Tag 1: GA4 Configuration

- **Type:** Google Tag (GA4)
- **Tag ID:** `G-G29LZCZJSG`
- **Trigger:** All Pages — Initialization (built-in) — *or* `Consent Initialization - All Pages`
- **Consent Settings:**
  - Built-in Consent Checks: auto-shown as `ad_storage`, `ad_personalization`, `ad_user_data`, `analytics_storage` — **read-only, leave as-is**
  - Additional Consent: **"No additional consent required"** (tag must fire always so Consent Mode can do its thing)

### Tag 2: LinkedIn Insight

- **Type:** Template — **LinkedIn Insight Tag** (publisher: LinkedIn). Tag Configuration → Discover more tag types → search "LinkedIn" → add to workspace.
- **Partner ID:** `9635737`
- **Trigger:** All Pages
- **Consent Settings:** Additional Consent → **Require additional consent for tag to fire** → add `ad_storage`, `ad_user_data`
- *Fallback if template unavailable:* Use Custom HTML with the [standard LinkedIn Insight snippet](https://www.linkedin.com/help/lms/answer/a427660) and insert `_linkedin_partner_id = "9635737"`.

### Tag 3: HubSpot Tracking

⚠️ **Use Custom HTML, not a template.** There is no official HubSpot template in the Gallery. The community template "HubSpot by luratic" only whitelists `https://js.hs-scripts.com/` (US endpoint) — it does **not** support the EU endpoint we need (`js-eu1.hs-scripts.com`) for DSGVO.

- **Type:** Custom HTML
- **HTML:**
  ```html
  <script type="text/javascript" id="hs-script-loader" async defer
          src="https://js-eu1.hs-scripts.com/147929039.js"></script>
  ```
- **Trigger:** All Pages
- **Consent Settings:** Additional Consent → **Require additional consent for tag to fire** → add `ad_storage`

### Tag 4: X (Twitter) Pixel

- **Type:** Check the Template Gallery first — search "X Pixel" or "Twitter Pixel". If an **official X/Twitter template** exists (publisher badge), use it with Pixel ID `rbp2n`. Otherwise fall back to Custom HTML below.
- **Fallback — Custom HTML:**
  ```html
  <script>
    !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
    },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
    a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
    twq('config','rbp2n');
  </script>
  ```
- **Trigger:** All Pages
- **Consent Settings:** Additional Consent → **Require additional consent for tag to fire** → add `ad_storage`, `ad_personalization`

## Part 6 — Quiz Event Tags (GA4 Events)

Each event below is a **GA4 Event** tag, referencing the GA4 Configuration Tag above.

### Trigger setup first

Triggers → New. Create one Page View trigger (for Quiz View) and nine Custom Event triggers.

**Custom Event trigger template** (use for all 9):

| Field | Value |
|---|---|
| Trigger Type | Custom Event |
| Event name | `ev_quiz_<name>` — **must include the `ev_` prefix**, matches dataLayer pushes |
| Use regex matching | ☐ unchecked |
| This trigger fires on | All Custom Events |
| Trigger name (top of page) | `CE - ev_quiz_<name>` |

**Page View trigger for Quiz View:**

| Field | Value |
|---|---|
| Trigger Type | Page View |
| This trigger fires on | Some Page Views |
| Condition | `Page Path` `equals` `/quiz/` |
| Trigger name | `PV - Quiz Page` |

### Tags

| Tag Name | GA4 Event Name | Parameters (key → value) | Trigger (Custom Event) |
|---|---|---|---|
| GA4 - Quiz View | `quiz_view` | — | **Page View** trigger: `Page Path equals /quiz/` (not a custom event) |
| GA4 - Quiz CTA Click | `quiz_cta_click` | — | `ev_quiz_cta_click` |
| GA4 - Quiz Contact Submit | `quiz_contact_submit` | — | `ev_quiz_contact_submit` |
| GA4 - Quiz Start | `quiz_start` | — | `ev_quiz_start` |
| GA4 - Quiz Answer | `quiz_answer` | `question_id={{DLV - quiz_question_id}}`, `question_type={{DLV - quiz_question_type}}`, `answer_index={{DLV - quiz_answer_index}}` | `ev_quiz_answer` |
| GA4 - Quiz Section Complete | `quiz_section_complete` | `section={{DLV - quiz_section}}` | `ev_quiz_section_complete` |
| GA4 - Quiz Complete | `quiz_complete` | `score_total={{DLV - quiz_score_total}}`, `bottleneck={{DLV - quiz_bottleneck}}`, `routing={{DLV - quiz_routing}}` | `ev_quiz_complete` |
| GA4 - Quiz Book Meeting | `quiz_book_meeting` | — | `ev_quiz_book_meeting` |
| GA4 - Quiz Share | `quiz_share` | — | `ev_quiz_share` |
| GA4 - Quiz Restart | `quiz_restart` | — | `ev_quiz_restart` |

All consent-gated by `analytics_storage` (inherited from GA4 Config tag).

## Part 7 — Preview + Publish

1. **Preview:** top-right "Preview" button → opens [tagassistant.google.com](https://tagassistant.google.com). Enter `https://escapevelocity.consulting/`. Connect. Walk the quiz flow. Check each tag fires on the expected event.
2. **Publish:** Submit → Version name "v1 — initial migration + quiz events" → Publish.

---

## Production Verification (Handover 3)

After publish + next deploy, in order:

1. [ ] `https://escapevelocity.consulting/` — fresh session (clear localStorage). DevTools Network: only `gtm.js?id=GTM-GNTWPNNL` loads. No `collect`, `licdn`, `hs-scripts`, `ads-twitter`.
2. [ ] Click "Alle akzeptieren". Network: `collect` (GA4), `insight.min.js` (LinkedIn), `hs-scripts/147929039.js` (HubSpot), `uwt.js` (X) all load.
3. [ ] Open quiz. GTM Preview panel → `ev_quiz_view` fires.
4. [ ] Run through one question. `ev_quiz_answer` fires with correct `question_id`, `question_type`, `answer_index`.
5. [ ] Complete quiz. `ev_quiz_complete` fires with `score_total`, `bottleneck`, `routing`.
6. [ ] Click "Kostenloses Erstgespräch buchen". `ev_quiz_book_meeting` fires.
7. [ ] GA4 → Admin → DebugView. Confirm events landing in real-time with parameters.
8. [ ] LinkedIn Campaign Manager → Insight Tag → last activity within last 5 min.
9. [ ] HubSpot → Reports → Traffic Analytics → session shows up.
10. [ ] X Ads → Pixel → last activity within last 5 min.
11. [ ] Reject consent on a fresh session. Confirm Network tab shows NO tag requests (gtm.js still loads, tags blocked by Consent Mode).

## Known Gotchas

- **Consent Mode "wait_for_update: 500":** GTM delays tag evaluation by 500ms to let the consent banner decide. If user clicks "Alle akzeptieren" fast, tags fire shortly after. If user doesn't interact, default (denied) sticks.
- **HubSpot tracking cookie:** HubSpot's script sets its own cookies post-consent. HubSpot Forms API (the form submissions on the site) is independent of this tag — form data still flows without consent, because forms are first-party user-initiated submissions, not tracking.
- **Cross-domain / subdomain:** GTM container is scoped to escapevelocity.consulting. If we add subdomains later, update GA4 Config → Configure your domains.
- **DSGVO evidence trail:** `/api/consent-log` POST stays on the client-side code — unchanged by this migration. GTM does not replace it.
