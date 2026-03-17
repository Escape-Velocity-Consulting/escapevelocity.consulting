# Reifegrad-Check Quiz

## Overview

Interactive 15-question maturity assessment ("Reifegrad-Check") that evaluates a company's digitalization across 5 dimensions and delivers a personalized results page with radar chart, bottleneck analysis, and next-step routing.

## Architecture

```
website/
├── quiz/index.njk           ← Page template (layout, inline CSS, phase containers)
├── scripts/quiz.js           ← All logic, data, rendering, radar chart (~580 lines)
```

No build step, no dependencies. Pure vanilla JS rendered into `<section data-phase="...">` containers. Only the active phase is visible via CSS.

## Quiz Flow (6 Phases)

```
landing → contact → quiz (10 scored) → qual (4 qualification) → freetext → results
```

| Phase | Purpose | Questions |
|-------|---------|-----------|
| `landing` | Value prop, CTA | — |
| `contact` | Name + email + GDPR consent | — |
| `quiz` | Scored questions (5 dimensions × 2) | F1–F10 |
| `qual` | Qualification / sales intelligence | F11–F14 |
| `freetext` | Open-ended optional input | F15 |
| `results` | Radar chart, stage, bottleneck, CTA, debug | — |

Back-navigation works across all phases including cross-phase (e.g. qual Q1 → back → scored Q10).

## 5 Dimensions

| # | Dimension | Short Label (Radar) | Questions |
|---|-----------|---------------------|-----------|
| 0 | Prozesse & Workflows | Prozesse | F1, F2 |
| 1 | Tools & Systeme | Tools | F3, F4 |
| 2 | Daten & Information | Daten | F5, F6 |
| 3 | Team & Kompetenz | Team | F7, F8 |
| 4 | Führung & Richtung | Führung | F9, F10 |

## Scoring

- Each scored question has 4 options: first = 3 points, last = 0 points
- Per-dimension max: 6 (2 questions × 3 points)
- `dimToStage(score)`: 0–1 → Stufe 1, 2–3 → Stufe 2, 4–5 → Stufe 3, 6 → Stufe 4
- Overall stage: `Math.round(avg(dimStages))`

### 4 Maturity Stages

| Stage | Label | Color |
|-------|-------|-------|
| 1 | Manuell | `#C4553A` (red) |
| 2 | Digitalisiert | `#D4943A` (orange) |
| 3 | Vernetzt | `#3A8F6E` (green) |
| 4 | Optimiert | `#2A6B9C` (blue) |

## Bottleneck Detection

Compares highest and lowest dimension stages. If there's a discrepancy (≥1 stage difference), shows a specific text from `DISCREPANCY_TEXTS` (20 variants, keyed as `{highDim}h-{lowDim}l`). If all dimensions are equal, shows one of 3 fallback texts based on overall level.

## Results Page Sections

1. **Stage Gauge** — 4-bar indicator + stage label + comparison text
2. **Radar Chart** — SVG pentagon, 3 grid rings (scores 2/4/6), terracotta data polygon
3. **Dimension Breakdown** — 2-column grid, bottleneck dimension highlighted red
4. **Bottleneck Reveal** — Dark card with discrepancy analysis
5. **Next Steps** — CTA routed by stage + qualification answer (F14)
6. **Offer Mapping** — 3 offers with relevance opacity
7. **Debug Section** — All copy variants ranked by match score (always visible)

## HubSpot Integration

Progressive 4-step form submission to a single HubSpot form (`02d5857d-dc95-4b8b-8b44-fd658f75e8de`). HubSpot deduplicates by email — each submission updates the existing contact.

| Step | Trigger | Function | Fields Submitted |
|------|---------|----------|-----------------|
| 1 | contact → quiz | `submitContact()` | `firstname`, `email` |
| 2 | quiz → qual | `submitScoredAnswers()` | `firstname`, `email`, `quiz_f01`–`quiz_f10` |
| 3 | qual → freetext | `submitQualAnswers()` | `firstname`, `email`, `quiz_f11`–`quiz_f14` |
| 4 | freetext → results | `submitResults()` | `firstname`, `email`, `quiz_freetext`, `quiz_stage`, `quiz_dim_scores`, `quiz_bottleneck`, `quiz_routing` |

All steps include `firstname` and `email` because HubSpot rejects submissions missing required form fields.

If a user drops off at question 7, steps 1 is already captured (lead with name + email). If they complete scored questions but abandon during qual, steps 1 + 2 are captured.

All submissions are fire-and-forget (`.catch(function(){})`) — quiz flow never blocks on API response.

## HubSpot Setup (completed)

### Property Group
- **Group:** `quiz_reifegrad` ("Quiz - Reifegrad-Check")

### Contact Properties (19 total)

**Scored answers (dropdown, options 0–3):**

| Internal Name | Label | Options |
|--------------|-------|---------|
| `quiz_f01` | Quiz F01: Kernprozesse | 0=Dokumentiert, 1=Routinen ohne Doku, 2=Eigener Weg, 3=Nie nachgedacht |
| `quiz_f02` | Quiz F02: Mitarbeiterausfall | 0=Kein Problem, 1=Holpert, 2=Wird eng, 3=Chaos |
| `quiz_f03` | Quiz F03: Tool-Integration | 0=Verbunden, 1=Teilweise, 2=Inseln, 3=Excel/Papier |
| `quiz_f04` | Quiz F04: Dokumentenverarbeitung | 0=Automatisiert, 1=Digital+Handarbeit, 2=Mix, 3=Papier |
| `quiz_f05` | Quiz F05: Datenzustand | 0=Sauber+zentral, 1=Verstreut, 2=Lueckenhaft, 3=Kein Ueberblick |
| `quiz_f06` | Quiz F06: Informationszugang | 0=Sofort, 1=Paar Minuten, 2=Dauert, 3=Kein Weg |
| `quiz_f07` | Quiz F07: Team-Haltung | 0=Offen+neugierig, 1=Offen+unsicher, 2=Skeptisch, 3=Nie Thema |
| `quiz_f08` | Quiz F08: Digitalisierungserfahrung | 0=Erfolgreich, 1=Angefangen, 2=Enttaeuscht, 3=Nie versucht |
| `quiz_f09` | Quiz F09: Verankerung in GF | 0=Fester Plan, 1=Agenda ohne Plan, 2=Mal angesprochen, 3=Kein Thema |
| `quiz_f10` | Quiz F10: Budget | 0=Fest eingeplant, 1=Bei klarem Nutzen, 2=Nicht Prio, 3=Kein Thema |

**Qual answers (dropdown, options 0–3):**

| Internal Name | Label | Options |
|--------------|-------|---------|
| `quiz_f11` | Quiz F11: Aktuelle Situation | 0=Naechster Schritt, 1=Orientierung, 2=Noch nicht angefangen, 3=Nicht ueberzeugt |
| `quiz_f12` | Quiz F12: 90-Tage-Ziel | 0=Zeitersparnis, 1=Klarheit Hebel, 2=Team befaehigen, 3=Umsetzungsplan |
| `quiz_f13` | Quiz F13: Groesste Huerde | 0=Keine Zeit, 1=Wissen nicht wo, 2=Hat nicht funktioniert, 3=Fehlendes Know-how |
| `quiz_f14` | Quiz F14: Unterstuetzungsart | 0=Schulung, 1=Workshop, 2=Umsetzung, 3=Weiss nicht |

**Result properties:**

| Internal Name | Label | Type |
|--------------|-------|------|
| `quiz_freetext` | Quiz: Freitext | Multi-line text |
| `quiz_stage` | Quiz: Gesamtstufe | Dropdown (Manuell/Digitalisiert/Vernetzt/Optimiert) |
| `quiz_dim_scores` | Quiz: Dimension Scores | Single-line text (CSV: Prozesse,Tools,Daten,Team,Fuehrung) |
| `quiz_bottleneck` | Quiz: Engpass | Single-line text |
| `quiz_routing` | Quiz: Routing | Dropdown (Schulung/Workshop/Umsetzung/Unentschieden) |

### Form
- **Name:** Reifegrad-Check
- **GUID:** `02d5857d-dc95-4b8b-8b44-fd658f75e8de`
- **Required fields:** `firstname`, `email` only — all quiz fields optional (progressive submission)
- **Portal:** `147929039`

### Subscription Types (existing)
- `2189782969` — Marketing Information (active)
- `2189782970` — One to One (active)

GDPR consent is handled in the quiz UI (checkbox on contact phase), not via HubSpot's built-in consent mechanism.

### Testing

1. Fill out the quiz completely
2. Check HubSpot Contacts for a new contact with `firstname` + `email`
3. Verify `quiz_f01`–`quiz_f10` populated after completing scored questions
4. Verify `quiz_f11`–`quiz_f14` populated after completing qual questions
5. Verify result properties (`quiz_stage`, `quiz_dim_scores`, `quiz_bottleneck`, `quiz_routing`, `quiz_freetext`) populated after reaching results
6. Check Marketing > Forms > Reifegrad-Check — should show up to 4 submissions per completion

## State Management

Single object, mutated then `render()` called:

```js
state = {
  phase: 'landing',     // current phase
  currentQ: 0,          // question index within current phase
  scoredAnswers: {},     // { 0: 2, 1: 0, ... } — option index per scored question
  qualAnswers: {},       // { 0: 1, 1: 3, ... } — option index per qual question
  freetext: '',
  name: '',
  email: '',
  consent: false,
}
```

## Transitions

- `transition(fn)` adds `.fade-out` → 300ms → runs `fn()` → `render()` → `.fade-in`
- `scrollTo(0, 0)` on every phase change
- Footer hidden during quiz phases, shown on results

## Brand Mapping from Draft

| Element | Draft (React) | Production |
|---------|--------------|------------|
| Background | `#FAFAF7` | `var(--color-cream)` |
| Card border-radius | 16px | 12px |
| Primary button | `#2A6B9C` blue | `var(--color-terracotta)` |
| Button hover | `#1E4F74` | `var(--color-terracotta-hover)` |
| Button radius | 10px | 8px |
| Headline font | Playfair Display | `var(--font-headline)` Space Grotesk |
| Body font | DM Sans | `var(--font-body)` Inter |
| UI/labels | — | `var(--font-ui)` Manrope |
| Selected option bg | `#E8F0F6` | `rgba(212,120,74,0.1)` |
| Progress bar | blue→green gradient | solid terracotta |
| Dark card | `#1A1A18` gradient | `var(--color-black)` |

Stage colors kept as-is (semantic: red → orange → green → blue for maturity levels).

## Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| ≤768px | Reduced padding, single-column value props, smaller stage label |
| ≤480px | Further padding reduction, 1-column dimension grid, full-width CTA |

## Local Testing

```bash
cd website && npx @11ty/eleventy --serve --port=3000
```

Open `http://localhost:3000/quiz/` and walk through all phases. The debug section on the results page shows all copy variant rankings without needing to change code.
