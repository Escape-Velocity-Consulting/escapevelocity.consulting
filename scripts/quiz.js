// ─── Digital-Check Quiz ───────────────────────────────────────────
// Vanilla JS port of quiz/draft.jsx — Escape Velocity brand system
// ──────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  var DEBUG = new URLSearchParams(window.location.search).get('debug') === 'true';

  // ─── DATA ───────────────────────────────────────────────────────
  var DIMENSIONS = [
    'Prozesse & Workflows',
    'Tools & Systeme',
    'Daten & Information',
    'Team & Kompetenz',
    'Führung & Richtung',
  ];

  var STAGES = [
    {
      label: 'Manuell',
      tagline: 'Es funktioniert, weil die richtigen Leute wissen wie.',
      color: '#C4553A',
      textColor: '#A3432D',
      desc: 'Ihre Abläufe sind stark personenabhängig. Prozesse leben in den Köpfen einzelner Mitarbeiter, nicht in Systemen. Das bedeutet: hohe Fehleranfälligkeit, kein Überblick über Zeitfresser, und Risiko bei jedem Personalwechsel.',
    },
    {
      label: 'Digitalisiert',
      tagline: 'Wir haben die Tools, aber sie reden nicht miteinander.',
      color: '#D4943A',
      textColor: '#9A6A1E',
      desc: 'Sie haben in digitale Werkzeuge investiert — Buchhaltung, CRM, Cloud. Aber die Systeme arbeiten nicht zusammen. Daten werden mehrfach eingegeben, Medienbrüche kosten Zeit, und niemand nutzt die Software so, wie sie gedacht war.',
    },
    {
      label: 'Vernetzt',
      tagline: 'Es läuft — auch wenn ich nicht da bin.',
      color: '#3A8F6E',
      textColor: '#2D7358',
      desc: 'Ihre Kernprozesse sind standardisiert und Systeme verbunden. Daten fließen, Routineaufgaben werden teilweise automatisiert. Das Team arbeitet nach definierten Abläufen. Sie haben einen klaren Überblick — jetzt geht es um die nächste Stufe.',
    },
    {
      label: 'Optimiert',
      tagline: 'Mein Team arbeitet an dem, was wirklich zählt.',
      color: '#2A6B9C',
      textColor: '#1F5680',
      desc: 'Routinearbeit ist automatisiert, Daten treiben Entscheidungen, und Ihr Team arbeitet an wertschöpfenden Aufgaben. Sie arbeiten AM Unternehmen, nicht IM Unternehmen. Kontinuierliche Verbesserung ist Gewohnheit.',
    },
  ];

  var SCORED_QUESTIONS = [
    {
      dim: 0,
      q: 'Wie werden Ihre Kernprozesse aktuell durchgeführt?',
      sub: 'z.B. Auftragsabwicklung, Rechnungsstellung, Kundenbetreuung',
      opts: [
        'Nach klar definierten, dokumentierten Abläufen',
        'Es gibt Routinen, aber sie sind nicht schriftlich festgehalten',
        'Jeder hat seinen eigenen Weg',
        'Wir haben darüber noch nie nachgedacht',
      ],
    },
    {
      dim: 0,
      q: 'Was passiert, wenn ein wichtiger Mitarbeiter zwei Wochen ausfällt?',
      opts: [
        'Kein Problem — Abläufe sind dokumentiert, andere können übernehmen',
        'Es holpert, aber wir kriegen es hin',
        'Es wird eng — vieles bleibt liegen',
        'Chaos — nur diese Person weiß, wie bestimmte Dinge laufen',
      ],
    },
    {
      dim: 1,
      q: 'Wie gut arbeiten Ihre digitalen Werkzeuge zusammen?',
      sub: 'z.B. Buchhaltung, CRM, E-Mail, Projektmanagement',
      opts: [
        'Systeme sind verbunden, Daten fließen automatisch',
        'Teilweise verbunden, aber vieles wird manuell übertragen',
        'Jedes System ist eine Insel',
        'Wir arbeiten hauptsächlich mit Excel / E-Mail / Papier',
      ],
    },
    {
      dim: 1,
      q: 'Wie werden bei Ihnen Dokumente verarbeitet?',
      sub: 'Rechnungen, Verträge, Berichte, Belege',
      opts: [
        'Weitgehend automatisiert (z.B. automatische Belegerkennung, digitale Freigaben)',
        'Digital vorhanden, aber viel Handarbeit beim Verarbeiten',
        'Mix aus digital und Papier, kein einheitlicher Prozess',
        'Fast alles auf Papier oder in E-Mail-Anhängen',
      ],
    },
    {
      dim: 2,
      q: 'In welchem Zustand sind Ihre Geschäftsdaten?',
      sub: 'Kundendaten, Finanzdaten, Projektdaten',
      opts: [
        'Sauber, strukturiert und zentral zugänglich',
        'Vorhanden, aber verstreut über verschiedene Systeme',
        'Lückenhaft und teilweise veraltet',
        'Wir haben keinen Überblick',
      ],
    },
    {
      dim: 2,
      q: 'Wenn Sie den aktuellen Stand eines Kundenprojekts oder einer Aufgabe wissen müssen — wie schnell finden Sie die Information?',
      opts: [
        'Sofort — alles ist zentral und aktuell abrufbar',
        'In ein paar Minuten — ich muss in verschiedenen Systemen nachschauen',
        'Es dauert — ich muss Kollegen fragen oder E-Mails durchsuchen',
        'Ich hab keinen verlässlichen Weg, das herauszufinden',
      ],
    },
    {
      dim: 3,
      q: 'Wie steht Ihr Team dem Thema Digitalisierung und neue Tools gegenüber?',
      opts: [
        'Offen und neugierig — einige treiben das Thema aktiv voran',
        'Grundsätzlich offen, aber unsicher im Umgang',
        'Eher skeptisch oder ängstlich',
        'Das Thema kam bei uns noch nie auf',
      ],
    },
    {
      dim: 3,
      q: 'Haben Sie oder Ihr Team schon einmal Prozesse digitalisiert oder automatisiert?',
      opts: [
        'Ja, erfolgreich umgesetzt und im Einsatz',
        'Angefangen, aber nicht konsequent weiterverfolgt',
        'Ausprobiert und enttäuscht',
        'Noch nie versucht',
      ],
    },
    {
      dim: 4,
      q: 'Wie konkret ist das Thema Digitalisierung in Ihrer Geschäftsführung verankert?',
      opts: [
        'Fester Bestandteil mit konkretem Plan und Meilensteinen',
        'Steht auf der Agenda, aber ohne klaren Fahrplan',
        'Wurde mal angesprochen, aber nicht weiterverfolgt',
        'Kein Thema',
      ],
    },
    {
      dim: 4,
      q: 'Gibt es ein Budget für Digitalisierung oder Prozessoptimierung?',
      opts: [
        'Ja, fest eingeplant mit konkreten Vorhaben',
        'Wir würden investieren, wenn der Nutzen klar ist',
        'Es steht nicht auf der Prioritätenliste, aber bei einem guten Anlass schon',
        'Nein, aktuell kein Thema',
      ],
    },
  ];

  var QUAL_QUESTIONS = [
    {
      q: 'Wo stehen Sie gerade?',
      sub: 'Was beschreibt Ihre aktuelle Situation am besten?',
      opts: [
        'Wir haben vieles digitalisiert und wollen den nächsten Schritt machen',
        'Wir haben erste Schritte gemacht und suchen Orientierung',
        'Wir wissen, dass wir etwas tun sollten, aber haben noch nicht angefangen',
        'Wir sind nicht überzeugt, dass Digitalisierung für uns relevant ist',
      ],
    },
    {
      q: 'Was wäre für Sie das wichtigste Ergebnis in den nächsten 90 Tagen?',
      opts: [
        'Konkrete Zeitersparnis bei Routineaufgaben',
        'Klarheit, wo die größten Hebel in unserem Unternehmen liegen',
        'Mitarbeiter befähigen, digitale Tools produktiv zu nutzen',
        'Einen konkreten Umsetzungsplan haben',
      ],
    },
    {
      q: 'Was hält Sie aktuell am meisten zurück?',
      opts: [
        'Keine Zeit, sich dem Thema zu widmen',
        'Wir wissen nicht, wo wir anfangen sollen',
        'Wir haben es versucht, aber es hat nicht funktioniert',
        'Fehlendes Know-how im Team',
      ],
    },
    {
      q: 'Welche Art von Unterstützung passt am besten zu Ihnen?',
      opts: [
        'Schulung — Wir wollen es selbst können',
        'Workshop — Wir brauchen eine klare Analyse und Strategie',
        'Umsetzung — Wir wollen, dass jemand das für uns baut',
        'Weiß ich noch nicht',
      ],
    },
  ];

  var DISCREPANCY_TEXTS = {
    '0h-1l': { title: 'Gute Abläufe, schwache Systeme', text: 'Ihre Abläufe sind durchdacht — aber Ihre Systeme halten nicht mit. Sie machen von Hand, was längst automatisch laufen könnte. Die Diagnose liegt vor, die Behandlung fehlt.' },
    '0h-2l': { title: 'Abläufe ohne Überblick', text: 'Ihre Prozesse funktionieren, aber Ihre Daten sind das schwache Glied. Ohne saubere Datenbasis bleiben Optimierungen Bauchgefühl statt Fakten.' },
    '0h-3l': { title: 'Prozesse ohne Mannschaft', text: 'Ihre Abläufe sind gut durchdacht, aber Ihr Team kann sie nicht umsetzen. Standardisierte Prozesse nützen nichts, wenn niemand sie lebt.' },
    '0h-4l': { title: 'Abläufe ohne Strategie', text: 'Ihre Abläufe funktionieren — aber nur aus Gewohnheit, nicht aus Strategie. Ohne Führung, die das Thema aktiv treibt, bleibt Optimierung Zufall.' },
    '1h-0l': { title: 'Tools ohne Fundament', text: 'Sie haben in Software investiert, aber Ihre Abläufe sind nicht standardisiert. Jeder nutzt die gleichen Tools anders. Die Investition verpufft, weil der Prozess darunter fehlt.' },
    '1h-2l': { title: 'Systeme ohne Substanz', text: 'Sie haben die Systeme — aber was darin steckt, ist unbrauchbar. Gute Software mit schlechten Daten liefert schlechte Ergebnisse.' },
    '1h-3l': { title: 'Werkzeuge ohne Anwender', text: 'Sie haben in gute Systeme investiert, aber Ihr Team nutzt sie nicht. Die teuerste Software ist die, die niemand bedient.' },
    '1h-4l': { title: 'Werkzeuge ohne Richtung', text: 'Die Tools sind da, aber es fehlt die strategische Führung. Ohne klare Richtung entscheidet jeder selbst, was er wie nutzt — und nichts passt zusammen.' },
    '2h-0l': { title: 'Daten ohne Prozesse', text: 'Ihre Daten sind in gutem Zustand, aber Ihre Abläufe sind chaotisch. Saubere Daten in unstrukturierten Prozessen sind ungenutztes Potenzial.' },
    '2h-1l': { title: 'Daten ohne Infrastruktur', text: 'Ihre Daten wären bereit — aber Ihre Systeme können nichts damit anfangen. Die Grundlage ist da, die technische Infrastruktur fehlt.' },
    '2h-3l': { title: 'Daten ohne Kompetenz', text: 'Ihre Daten sind solide, aber Ihr Team weiß nicht, wie es sie nutzen soll. Daten ohne digitale Kompetenz im Team bleiben tote Zahlen.' },
    '2h-4l': { title: 'Daten ohne Richtung', text: 'Ihre Datengrundlage ist solide, aber niemand nutzt sie strategisch. Die Grundlage für bessere Entscheidungen ist da — es fehlt der Plan, sie einzusetzen.' },
    '3h-0l': { title: 'Motivation ohne Struktur', text: 'Ihr Team ist digital-affin, aber arbeitet ohne standardisierte Abläufe. Motivierte Leute ohne klare Prozesse improvisieren — gut gemeint, aber nicht skalierbar.' },
    '3h-1l': { title: 'Kompetenz ohne Werkzeuge', text: 'Ihr Team wäre bereit für bessere Werkzeuge, aber die Systeme halten nicht mit. Digitale Kompetenz wird ausgebremst durch veraltete oder fehlende Software.' },
    '3h-2l': { title: 'Team ohne Datenbasis', text: 'Ihr Team ist offen für Digitalisierung, aber die Datenbasis fehlt. Bevor Ihr Team loslegen kann, müssen erst die Grundlagen stimmen.' },
    '3h-4l': { title: 'Motivation ohne Mandat', text: 'Ihr Team wäre bereit, aber von oben kommt kein Signal. Motivierte Mitarbeiter ohne Mandat bremsen sich selbst aus.' },
    '4h-0l': { title: 'Vision ohne Fundament', text: 'Die Geschäftsführung hat eine klare digitale Vision, aber die Abläufe im Tagesgeschäft sind noch nicht standardisiert. Strategie ohne Prozess-Fundament bleibt Wunschdenken.' },
    '4h-1l': { title: 'Plan ohne Werkzeuge', text: 'Sie haben den Plan, aber nicht die Werkzeuge. Die strategische Richtung stimmt — jetzt fehlt die technische Infrastruktur, um sie umzusetzen.' },
    '4h-2l': { title: 'Strategie ohne Datenbasis', text: 'Die Führung treibt Digitalisierung voran, aber die Datenbasis ist löchrig. Strategische Entscheidungen brauchen verlässliche Daten — die fehlen noch.' },
    '4h-3l': { title: 'Führung ohne Buy-in', text: 'Die Geschäftsführung will vorwärts — aber das Team zieht nicht mit. Ohne Buy-in bleibt jede Initiative ein Pilotprojekt.' },
  };

  var ROUTING = [
    { label: 'Schulung', cta: 'Kostenlosen Digitalisierungs-Leitfaden herunterladen', ctaSub: 'Schritt-für-Schritt zum nächsten Level', type: 'nurture' },
    { label: 'Workshop', cta: 'Aha! Moment Workshop buchen', ctaSub: 'Ein Tag, ein Durchblick — wo Ihre größten Hebel liegen', type: 'calendly' },
    { label: 'Umsetzung', cta: 'Tech Upgrade Gespräch vereinbaren', ctaSub: 'Engpass gefunden? Wir lösen ihn.', type: 'calendly' },
    { label: 'Unentschieden', cta: '3 Ressourcen zum Einstieg erhalten', ctaSub: 'Orientierung für Ihren ersten Schritt', type: 'nurture' },
  ];

  // ─── SCORING HELPERS ───────────────────────────────────────────
  function scoreDimensions(answers) {
    var dims = [0, 0, 0, 0, 0];
    SCORED_QUESTIONS.forEach(function (qObj, i) {
      var a = answers[i];
      if (a !== undefined) dims[qObj.dim] += 3 - a;
    });
    return dims;
  }

  function dimToStage(score) {
    if (score <= 1) return 0;
    if (score <= 3) return 1;
    if (score <= 5) return 2;
    return 3;
  }

  function getOverallStage(dimScores) {
    var stages = dimScores.map(dimToStage);
    var avg = stages.reduce(function (a, b) { return a + b; }, 0) / stages.length;
    return Math.round(avg);
  }

  function getBottleneck(dimScores) {
    var stages = dimScores.map(dimToStage);
    var maxStage = Math.max.apply(null, stages);
    var minStage = Math.min.apply(null, stages);
    if (maxStage - minStage <= 0) return null;

    var minIdx = stages.indexOf(minStage);
    var maxIdx = stages.indexOf(maxStage);
    var key1 = maxIdx + 'h-' + minIdx + 'l';
    if (DISCREPANCY_TEXTS[key1]) return Object.assign({}, DISCREPANCY_TEXTS[key1], { highDim: maxIdx, lowDim: minIdx });

    return {
      title: DIMENSIONS[minIdx] + ' bremst Sie',
      text: 'Ihre schwächste Dimension ist \u201E' + DIMENSIONS[minIdx] + '\u201C — sie liegt deutlich hinter Ihren anderen Bereichen zurück. Das ist Ihr Engpass: Solange dieser Bereich nicht aufholt, können die anderen Dimensionen ihr Potenzial nicht entfalten.',
      highDim: maxIdx,
      lowDim: minIdx,
    };
  }

  function getFallbackText(overallStage, dimScores) {
    var stages = dimScores.map(dimToStage);
    var allSame = stages.every(function (s) { return s === stages[0]; });
    if (allSame && stages[0] <= 1) {
      return { title: 'Sauberer Anfang', text: 'Start bei Null — und das ist kein Nachteil. Kein Altlasten-Chaos, kein Tool-Friedhof. Sie können von Anfang an richtig aufbauen.' };
    }
    if (allSame && stages[0] >= 2) {
      return { title: 'Top-Ausgangslage', text: 'Top 10% der KMU. Sie haben die Basis geschaffen. Die Frage ist nicht ob, sondern wie schnell Sie den nächsten Schritt machen.' };
    }
    return { title: 'Solides Fundament', text: 'Überall angefangen, nirgends durchgezogen — typisch für KMU in Ihrer Größe. Die gute Nachricht: Ein fokussierter Schritt bringt sofort Ergebnisse.' };
  }

  // ─── STATE ──────────────────────────────────────────────────────
  var state = {
    phase: 'landing',
    currentQ: 0,
    scoredAnswers: {},
    qualAnswers: {},
    freetext: '',
    name: '',
    email: '',
    consent: false,
  };

  var totalQ = SCORED_QUESTIONS.length + QUAL_QUESTIONS.length + 1; // 15

  // ─── STATE PERSISTENCE ────────────────────────────────────────
  var STORAGE_KEY = 'ev_quiz_state';

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* quota exceeded or private browsing */ }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  // ─── DOM HELPERS ────────────────────────────────────────────────
  var $app = document.getElementById('quiz-app');
  var $footer = document.querySelector('footer.footer');

  function $(sel, ctx) { return (ctx || $app).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || $app).querySelectorAll(sel)); }

  function show(phase) {
    $$('.phase').forEach(function (el) { el.classList.remove('active'); });
    var target = $('[data-phase="' + phase + '"]');
    if (target) target.classList.add('active');
    if ($footer) $footer.style.display = phase === 'results' ? '' : 'none';
  }

  function transition(fn) {
    $app.classList.add('fade-out');
    setTimeout(function () {
      fn();
      saveState();
      render();
      $app.classList.remove('fade-out');
      $app.classList.add('fade-in');
      window.scrollTo(0, 0);
      setTimeout(function () { $app.classList.remove('fade-in'); }, 300);
    }, 300);
  }

  // ─── RADAR CHART (SVG) ─────────────────────────────────────────
  function renderRadarChart(dimScores) {
    var cx = 200, cy = 160, maxR = 120;
    var n = 5;
    var labels = ['Prozesse', 'Tools', 'Daten', 'Team', 'Führung'];
    var maxVal = 6;
    var rings = [2, 4, 6];

    function angle(i) { return (Math.PI * 2 * i) / n - Math.PI / 2; }
    function pt(i, val) {
      var r = (val / maxVal) * maxR;
      return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
    }

    var svg = '<svg viewBox="0 0 400 320" class="radar-chart">';

    // Grid rings
    rings.forEach(function (ringVal) {
      var pts = [];
      for (var i = 0; i < n; i++) pts.push(pt(i, ringVal).join(','));
      svg += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>';
    });

    // Axes
    for (var i = 0; i < n; i++) {
      var ep = pt(i, maxVal);
      svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ep[0] + '" y2="' + ep[1] + '" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>';
    }

    // Data polygon
    var dataPts = [];
    for (var i = 0; i < n; i++) dataPts.push(pt(i, dimScores[i]).join(','));
    svg += '<polygon points="' + dataPts.join(' ') + '" fill="var(--color-terracotta)" fill-opacity="0.18" stroke="var(--color-terracotta)" stroke-width="2"/>';

    // Data dots
    for (var i = 0; i < n; i++) {
      var dp = pt(i, dimScores[i]);
      svg += '<circle cx="' + dp[0] + '" cy="' + dp[1] + '" r="5" fill="var(--color-terracotta)" stroke="#fff" stroke-width="2"/>';
    }

    // Labels
    var labelOffsets = [
      [0, -14],   // top
      [14, 0],    // right
      [10, 14],   // bottom-right
      [-10, 14],  // bottom-left
      [-14, 0],   // left
    ];
    var anchors = ['middle', 'start', 'start', 'end', 'end'];
    for (var i = 0; i < n; i++) {
      var lp = pt(i, maxVal);
      svg += '<text x="' + (lp[0] + labelOffsets[i][0]) + '" y="' + (lp[1] + labelOffsets[i][1]) + '" text-anchor="' + anchors[i] + '" class="radar-label">' + labels[i] + '</text>';
    }

    svg += '</svg>';
    return svg;
  }

  // ─── HUBSPOT SUBMISSION ─────────────────────────────────────────
  var HS_PORTAL = '147929039';
  var HS_FORM_ID = '02d5857d-dc95-4b8b-8b44-fd658f75e8de';
  var HS_SUBMIT_URL = 'https://api-eu1.hsforms.com/submissions/v3/integration/submit/' + HS_PORTAL + '/' + HS_FORM_ID;

  function submitToHubSpot(fields) {
    return fetch(HS_SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: fields,
        context: { pageUri: window.location.href, pageName: document.title },
      }),
    }).then(function (res) {
      if (!res.ok) throw new Error('HubSpot: ' + res.status);
      return res;
    });
  }

  // Step 1: contact phase — lead capture
  function submitContact() {
    return submitToHubSpot([
      { name: 'firstname', value: state.name },
      { name: 'email', value: state.email },
    ]);
  }

  // Step 2: quiz→qual transition — scored answers F01–F10
  function submitScoredAnswers() {
    var fields = [{ name: 'firstname', value: state.name }, { name: 'email', value: state.email }];
    for (var i = 0; i < SCORED_QUESTIONS.length; i++) {
      if (state.scoredAnswers[i] !== undefined) {
        var num = String(i + 1).padStart(2, '0');
        fields.push({ name: 'quiz_f' + num, value: String(state.scoredAnswers[i]) });
      }
    }
    return submitToHubSpot(fields);
  }

  // Step 3: qual→freetext transition — qual answers F11–F14
  function submitQualAnswers() {
    var fields = [{ name: 'firstname', value: state.name }, { name: 'email', value: state.email }];
    for (var i = 0; i < QUAL_QUESTIONS.length; i++) {
      if (state.qualAnswers[i] !== undefined) {
        fields.push({ name: 'quiz_f' + String(i + 11), value: String(state.qualAnswers[i]) });
      }
    }
    return submitToHubSpot(fields);
  }

  // Step 4: freetext→results transition — freetext + computed results
  function submitResults() {
    var dimScores = scoreDimensions(state.scoredAnswers);
    var overallStage = getOverallStage(dimScores);
    var bottleneck = getBottleneck(dimScores);
    var routingIdx = state.qualAnswers[3] !== undefined ? state.qualAnswers[3] : 3;
    return submitToHubSpot([
      { name: 'firstname', value: state.name },
      { name: 'email', value: state.email },
      { name: 'quiz_freetext', value: state.freetext },
      { name: 'quiz_stage', value: STAGES[overallStage].label },
      { name: 'quiz_dim_scores', value: dimScores.join(',') },
      { name: 'quiz_bottleneck', value: bottleneck ? bottleneck.title : 'Keine Diskrepanz' },
      { name: 'quiz_routing', value: ROUTING[routingIdx].label },
    ]);
  }

  function showSubmissionError() {
    var toast = document.getElementById('quiz-toast');
    if (!toast) return;
    toast.innerHTML = 'Ihre Antworten konnten leider nicht gespeichert werden. ' +
      'Ihre Auswertung sehen Sie trotzdem hier. ' +
      '<a href="/#newsletter">Melden Sie sich f\u00FCr unseren Newsletter an</a>, ' +
      'um in Kontakt zu bleiben.';
    toast.style.display = 'block';
    setTimeout(function () { toast.style.display = 'none'; }, 12000);
  }

  // ─── RENDER ─────────────────────────────────────────────────────
  function render() {
    show(state.phase);

    switch (state.phase) {
      case 'landing':
        renderLanding();
        break;
      case 'contact':
        renderContact();
        break;
      case 'quiz':
        renderQuiz();
        break;
      case 'qual':
        renderQual();
        break;
      case 'freetext':
        renderFreetext();
        break;
      case 'results':
        renderResults();
        break;
    }
  }

  // ─── LANDING ────────────────────────────────────────────────────
  function renderLanding() {
    var el = $('[data-phase="landing"]');

    // ── Section 1: Hero ──
    var hero =
      '<div class="quiz-container" style="text-align:center">' +
        '<div class="quiz-eyebrow">Escape Velocity &middot; Digital-Check</div>' +
        '<h1 class="quiz-hero-title">Wo bremst sich Ihr<br>Unternehmen <em>selbst</em> aus?</h1>' +
        '<p class="quiz-hero-sub">15 Fragen. 5 Minuten. Danach wissen Sie, was Ihr Wachstum blockiert \u2014 und was der n\u00E4chste Schritt ist.</p>' +

        '<div style="display:flex;flex-direction:column;align-items:center;gap:12px">' +
          '<button class="btn-primary btn-large landing-cta">Check starten <span class="btn-arrow">&rarr;</span></button>' +
          '<div class="landing-trust">Kostenlos &middot; Kein Login &middot; Ergebnis sofort</div>' +
        '</div>' +
      '</div>';

    // ── Section 2: Value-Prop Cards ──
    var cards =
      '<div class="quiz-container" style="text-align:center">' +
        '<div class="landing-cards">' +
          '<div class="landing-card">' +
            '<div class="landing-card-num">01</div>' +
            '<svg class="landing-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<rect x="4" y="18" width="5" height="10" rx="1.5" fill="var(--color-terracotta)" opacity="0.3"/>' +
              '<rect x="12" y="12" width="5" height="16" rx="1.5" fill="var(--color-terracotta)" opacity="0.6"/>' +
              '<rect x="20" y="6" width="5" height="22" rx="1.5" fill="var(--color-terracotta)"/>' +
              '<path d="M6 14l7-6 7 4 6-8" stroke="var(--color-terracotta)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
            '<div class="landing-card-title">Ihr Level sehen</div>' +
            '<div class="landing-card-body">Wo steht Ihr Unternehmen wirklich \u2014 Level 1 oder Level 4? Kein Bauchgef\u00FChl, sondern ein klares Bild \u00FCber 5 Dimensionen.</div>' +
          '</div>' +

          '<div class="landing-card featured">' +
            '<div class="landing-badge">Kernanalyse</div>' +
            '<div class="landing-card-num">02</div>' +
            '<svg class="landing-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<circle cx="14" cy="14" r="8" stroke="var(--color-terracotta)" stroke-width="1.5"/>' +
              '<path d="M20 20L27 27" stroke="var(--color-terracotta)" stroke-width="1.5" stroke-linecap="round"/>' +
              '<path d="M11 14h6M14 11v6" stroke="var(--color-terracotta)" stroke-width="1.3" stroke-linecap="round"/>' +
            '</svg>' +
            '<div class="landing-card-title">Den Engpass finden</div>' +
            '<div class="landing-card-body">Eine Dimension bremst alle anderen. Wir zeigen Ihnen, welche \u2014 und warum genau dort Zeit und Geld verloren gehen.</div>' +
          '</div>' +

          '<div class="landing-card">' +
            '<div class="landing-card-num">03</div>' +
            '<svg class="landing-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<circle cx="16" cy="16" r="10" stroke="var(--color-terracotta)" stroke-width="1.5"/>' +
              '<circle cx="16" cy="16" r="3" fill="var(--color-terracotta)"/>' +
              '<path d="M16 6V9M16 23v3M6 16H9M23 16h3" stroke="var(--color-terracotta)" stroke-width="1.3" stroke-linecap="round"/>' +
            '</svg>' +
            '<div class="landing-card-title">Ihren n\u00E4chsten Schritt erfahren</div>' +
            '<div class="landing-card-body">Keine generische To-do-Liste. Sie erhalten eine konkrete Empfehlung, die zu Ihrem Level und Ihrem Engpass passt.</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ── Section 3: Stages Progression ──
    var stagesCards = '';
    for (var i = 0; i < STAGES.length; i++) {
      stagesCards +=
        '<div class="stage-card" style="border-top-color:' + STAGES[i].color + '">' +
          '<div class="stage-card-num">Level ' + (i + 1) + '</div>' +
          '<div class="stage-card-label">' + STAGES[i].label + '</div>' +
          '<div class="stage-card-tagline">\u201E' + STAGES[i].tagline + '\u201C</div>' +
        '</div>';
    }

    var stages =
      '<div class="landing-stages">' +
        '<h2>4 Level. Eines davon ist Ihres.</h2>' +
        '<div class="stages-grid">' + stagesCards + '</div>' +
        '<button class="btn-primary btn-large landing-cta">Mein Level herausfinden <span class="btn-arrow">&rarr;</span></button>' +
      '</div>';

    // ── Section 3: Results Preview (Dark) ──
    // Static radar chart with sample data for dark background
    var sampleScores = [4, 2, 5, 3, 4];
    var rcx = 200, rcy = 160, rmaxR = 120;
    var rn = 5, rmaxVal = 6;
    var rLabels = ['Prozesse', 'Tools', 'Daten', 'Team', 'F\u00FChrung'];
    var rRings = [2, 4, 6];

    function rAngle(idx) { return (Math.PI * 2 * idx) / rn - Math.PI / 2; }
    function rPt(idx, val) {
      var r = (val / rmaxVal) * rmaxR;
      return [rcx + r * Math.cos(rAngle(idx)), rcy + r * Math.sin(rAngle(idx))];
    }

    var radarSvg = '<svg viewBox="0 0 400 320" class="radar-chart">';
    // Grid rings
    rRings.forEach(function (ringVal) {
      var pts = [];
      for (var j = 0; j < rn; j++) pts.push(rPt(j, ringVal).join(','));
      radarSvg += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>';
    });
    // Axes
    for (var j = 0; j < rn; j++) {
      var ep = rPt(j, rmaxVal);
      radarSvg += '<line x1="' + rcx + '" y1="' + rcy + '" x2="' + ep[0] + '" y2="' + ep[1] + '" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>';
    }
    // Data polygon
    var dataPts = [];
    for (var j = 0; j < rn; j++) dataPts.push(rPt(j, sampleScores[j]).join(','));
    radarSvg += '<polygon points="' + dataPts.join(' ') + '" fill="var(--color-terracotta)" fill-opacity="0.25" stroke="var(--color-terracotta)" stroke-width="2"/>';
    // Data dots
    for (var j = 0; j < rn; j++) {
      var dp = rPt(j, sampleScores[j]);
      radarSvg += '<circle cx="' + dp[0] + '" cy="' + dp[1] + '" r="5" fill="var(--color-terracotta)" stroke="rgba(255,255,255,0.9)" stroke-width="2"/>';
    }
    // Labels
    var rLabelOffsets = [[0, -14], [14, 0], [10, 14], [-10, 14], [-14, 0]];
    var rAnchors = ['middle', 'start', 'start', 'end', 'end'];
    for (var j = 0; j < rn; j++) {
      var lp = rPt(j, rmaxVal);
      radarSvg += '<text x="' + (lp[0] + rLabelOffsets[j][0]) + '" y="' + (lp[1] + rLabelOffsets[j][1]) + '" text-anchor="' + rAnchors[j] + '" class="radar-label">' + rLabels[j] + '</text>';
    }
    radarSvg += '</svg>';

    var preview =
      '<div class="landing-preview">' +
        '<h2>In 5 Minuten wissen Sie mehr als nach dem letzten Strategie-Meeting</h2>' +
        '<p class="landing-preview-sub">Der Digital-Check liefert keine Theorie \u2014 sondern ein konkretes Profil Ihres Unternehmens. Das hier erwartet Sie:</p>' +
        '<div class="radar-preview">' + radarSvg + '</div>' +
        '<div class="preview-features">' +
          '<div>\u2713 Ihr Digitalisierungs-Level auf einen Blick \u2014 \u00FCber 5 Dimensionen ausgewertet</div>' +
          '<div>\u2713 Der Engpass, der alles andere ausbremst \u2014 konkret benannt, nicht geraten</div>' +
          '<div>\u2713 Ein n\u00E4chster Schritt, der zu Ihrer Situation passt \u2014 nicht von der Stange</div>' +
        '</div>' +
        '<button class="btn-primary btn-large landing-cta">Jetzt Digital-Check starten <span class="btn-arrow">&rarr;</span></button>' +
      '</div>';

    el.innerHTML = hero + cards + stages + preview;

    // Bind all CTA buttons
    var ctas = el.querySelectorAll('.landing-cta');
    for (var i = 0; i < ctas.length; i++) {
      ctas[i].addEventListener('click', function () {
        transition(function () { state.phase = 'contact'; });
      });
    }
  }

  // ─── CONTACT ────────────────────────────────────────────────────
  function renderContact() {
    var el = $('[data-phase="contact"]');
    el.innerHTML =
      '<div class="quiz-container">' +
        '<div class="quiz-card">' +
          '<div class="quiz-eyebrow">Bevor es losgeht</div>' +
          '<h2 class="quiz-title">Wohin dürfen wir Ihre Auswertung senden?</h2>' +
          '<p class="quiz-subtitle">Sie erhalten Ihr persönliches Digitalisierungs-Profil direkt im Anschluss — und per E-Mail zum Nachschlagen.</p>' +
          '<div class="form-fields">' +
            '<label for="input-name" class="sr-only">Ihr Name</label>' +
            '<input type="text" class="quiz-input" id="input-name" placeholder="Ihr Name" value="' + escHtml(state.name) + '">' +
            '<label for="input-email" class="sr-only">Ihre E-Mail-Adresse</label>' +
            '<input type="email" class="quiz-input" id="input-email" placeholder="Ihre E-Mail-Adresse" value="' + escHtml(state.email) + '">' +
            '<label class="consent-label"><input type="checkbox" id="input-consent"' + (state.consent ? ' checked' : '') + '> Ich stimme zu, dass meine Daten zur Auswertung des Digital-Checks und zur Kontaktaufnahme verarbeitet werden. <a href="/datenschutz/" target="_blank">Datenschutz</a></label>' +
            '<button class="btn-primary" id="contact-submit" disabled>Quiz starten &rarr;</button>' +
          '</div>' +
          '<div class="quiz-hint" style="text-align:center">Kein Spam. Wir respektieren Ihre Daten.</div>' +
        '</div>' +
      '</div>';

    var nameInput = $('#input-name');
    var emailInput = $('#input-email');
    var consentInput = $('#input-consent');
    var submitBtn = $('#contact-submit');

    function validateContact() {
      state.name = nameInput.value;
      state.email = emailInput.value;
      state.consent = consentInput.checked;
      submitBtn.disabled = !(state.name && state.email && state.consent);
    }

    nameInput.addEventListener('input', validateContact);
    emailInput.addEventListener('input', validateContact);
    consentInput.addEventListener('change', validateContact);
    validateContact();

    submitBtn.addEventListener('click', function () {
      submitContact().catch(showSubmissionError);
      transition(function () { state.phase = 'quiz'; state.currentQ = 0; });
    });
  }

  // ─── SCORED QUIZ ────────────────────────────────────────────────
  function renderQuiz() {
    var qObj = SCORED_QUESTIONS[state.currentQ];
    var selected = state.scoredAnswers[state.currentQ];
    var qNum = state.currentQ;

    var el = $('[data-phase="quiz"]');
    el.innerHTML =
      '<div class="quiz-container">' +
        renderProgressBar(qNum) +
        '<div class="quiz-meta">Frage ' + (qNum + 1) + ' von ' + totalQ + ' &middot; <strong>' + escHtml(DIMENSIONS[qObj.dim]) + '</strong></div>' +
        '<div class="quiz-card">' +
          '<h2 class="quiz-title">' + escHtml(qObj.q) + '</h2>' +
          (qObj.sub ? '<p class="quiz-subtitle">' + escHtml(qObj.sub) + '</p>' : '<div style="height:20px"></div>') +
          '<div class="options" role="listbox">' +
            qObj.opts.map(function (opt, oi) {
              return '<button class="option-btn' + (selected === oi ? ' selected' : '') + '" data-idx="' + oi + '" role="option" aria-selected="' + (selected === oi) + '">' + escHtml(opt) + '</button>';
            }).join('') +
          '</div>' +
          (qNum > 0 ? '<button class="btn-back" id="quiz-back">&larr; Zurück</button>' : '') +
        '</div>' +
      '</div>';

    $$('.option-btn', el).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.idx);
        state.scoredAnswers[state.currentQ] = idx;
        // Briefly highlight then advance
        $$('.option-btn', el).forEach(function (b) {
          b.classList.remove('selected');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-selected', 'true');
        setTimeout(function () {
          if (state.currentQ < SCORED_QUESTIONS.length - 1) {
            transition(function () { state.currentQ++; });
          } else {
            submitScoredAnswers().catch(showSubmissionError);
            transition(function () { state.phase = 'qual'; state.currentQ = 0; });
          }
        }, 250);
      });
    });

    addArrowNavigation($('.options', el));

    var backBtn = $('#quiz-back', el);
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        transition(function () { state.currentQ--; });
      });
    }
  }

  // ─── QUAL QUESTIONS ─────────────────────────────────────────────
  function renderQual() {
    var qObj = QUAL_QUESTIONS[state.currentQ];
    var selected = state.qualAnswers[state.currentQ];
    var qNum = SCORED_QUESTIONS.length + state.currentQ;

    var el = $('[data-phase="qual"]');
    el.innerHTML =
      '<div class="quiz-container">' +
        renderProgressBar(qNum) +
        '<div class="quiz-meta">Frage ' + (qNum + 1) + ' von ' + totalQ + ' &middot; <strong>Über Sie</strong></div>' +
        '<div class="quiz-card">' +
          '<h2 class="quiz-title">' + escHtml(qObj.q) + '</h2>' +
          (qObj.sub ? '<p class="quiz-subtitle">' + escHtml(qObj.sub) + '</p>' : '<div style="height:20px"></div>') +
          '<div class="options" role="listbox">' +
            qObj.opts.map(function (opt, oi) {
              return '<button class="option-btn' + (selected === oi ? ' selected' : '') + '" data-idx="' + oi + '" role="option" aria-selected="' + (selected === oi) + '">' + escHtml(opt) + '</button>';
            }).join('') +
          '</div>' +
          '<button class="btn-back" id="qual-back">&larr; Zurück</button>' +
        '</div>' +
      '</div>';

    $$('.option-btn', el).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.idx);
        state.qualAnswers[state.currentQ] = idx;
        $$('.option-btn', el).forEach(function (b) {
          b.classList.remove('selected');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-selected', 'true');
        setTimeout(function () {
          if (state.currentQ < QUAL_QUESTIONS.length - 1) {
            transition(function () { state.currentQ++; });
          } else {
            submitQualAnswers().catch(showSubmissionError);
            transition(function () { state.phase = 'freetext'; });
          }
        }, 250);
      });
    });

    addArrowNavigation($('.options', el));

    $('#qual-back', el).addEventListener('click', function () {
      if (state.currentQ > 0) {
        transition(function () { state.currentQ--; });
      } else {
        transition(function () { state.phase = 'quiz'; state.currentQ = SCORED_QUESTIONS.length - 1; });
      }
    });
  }

  // ─── FREETEXT ───────────────────────────────────────────────────
  function renderFreetext() {
    var qNum = SCORED_QUESTIONS.length + QUAL_QUESTIONS.length;
    var el = $('[data-phase="freetext"]');
    el.innerHTML =
      '<div class="quiz-container">' +
        renderProgressBar(qNum) +
        '<div class="quiz-meta">Frage ' + (qNum + 1) + ' von ' + totalQ + ' &middot; <strong>Letzte Frage</strong></div>' +
        '<div class="quiz-card">' +
          '<h2 class="quiz-title">Gibt es sonst etwas, das Sie uns sagen möchten?</h2>' +
          '<p class="quiz-subtitle">Optional — alles was uns hilft, Ihre Auswertung relevanter zu machen.</p>' +
          '<label for="freetext-input" class="sr-only">Ihre Gedanken</label>' +
          '<textarea class="quiz-textarea" id="freetext-input" rows="4" placeholder="Ihre Gedanken...">' + escHtml(state.freetext) + '</textarea>' +
          '<button class="btn-primary" id="freetext-submit">Auswertung anzeigen &rarr;</button>' +
          '<button class="btn-back" id="freetext-back">&larr; Zurück</button>' +
        '</div>' +
      '</div>';

    $('#freetext-input', el).addEventListener('input', function (e) { state.freetext = e.target.value; });
    $('#freetext-submit', el).addEventListener('click', function () {
      submitResults().catch(showSubmissionError);
      transition(function () { state.phase = 'results'; });
    });
    $('#freetext-back', el).addEventListener('click', function () {
      transition(function () { state.phase = 'qual'; state.currentQ = QUAL_QUESTIONS.length - 1; });
    });
  }

  // ─── RESULTS ────────────────────────────────────────────────────
  function renderResults() {
    clearState();
    var dimScores = scoreDimensions(state.scoredAnswers);
    var overallStage = getOverallStage(dimScores);
    var dimStages = dimScores.map(dimToStage);
    var stageData = STAGES[overallStage];
    var bottleneck = getBottleneck(dimScores);
    var fallback = getFallbackText(overallStage, dimScores);
    var reveal = bottleneck || fallback;
    var routingIdx = state.qualAnswers[3] !== undefined ? state.qualAnswers[3] : 3;
    var routing = ROUTING[routingIdx];

    // Comparison text
    var comparisonText;
    if (overallStage === 0) comparisonText = 'Die meisten KMU in Ihrer Größe liegen bei Level 2 (Digitalisiert). Sie haben Aufholpotenzial — und den Vorteil, von Anfang an richtig aufzubauen.';
    else if (overallStage === 1) comparisonText = 'Die meisten KMU in Ihrer Größe liegen ebenfalls bei Level 2. Sie sind im Mittelfeld — ein fokussierter nächster Schritt hebt Sie ab.';
    else if (overallStage === 2) comparisonText = 'Die meisten KMU in Ihrer Größe liegen bei Level 2. Sie sind bereits weiter als der Durchschnitt — jetzt geht es um den Vorsprung.';
    else comparisonText = 'Weniger als 10% der KMU erreichen Level 4. Sie gehören zur Spitzengruppe — Ihr Vorteil: Skalierung und Effizienz, die Wettbewerber nicht haben.';

    // Next step text
    var nextStepText;
    if (overallStage <= 1) nextStepText = 'Am meisten profitieren Sie jetzt von Klarheit: verstehen, wo die größten Hebel liegen, bevor Sie investieren.';
    else if (overallStage <= 2) nextStepText = 'Sie haben die Grundlage — jetzt geht es darum, Systeme zu verbinden und Engpässe gezielt zu lösen.';
    else nextStepText = 'Sie sind weiter als die meisten. Jetzt geht es um kontinuierliche Optimierung und strategische Skalierung.';

    // Stage gauge bars
    var gaugeBars = STAGES.map(function (st, i) {
      return '<div class="gauge-bar' + (i <= overallStage ? ' active' : '') + (i === overallStage ? ' current' : '') + '" style="background:' + (i <= overallStage ? st.color : 'rgba(0,0,0,0.06)') + '"></div>';
    }).join('');

    // Dimension breakdown
    var dimBreakdown = DIMENSIONS.map(function (d, i) {
      var isBottleneck = bottleneck && bottleneck.lowDim === i;
      return '<div class="dim-card' + (isBottleneck ? ' dim-bottleneck' : '') + (i === 4 ? ' dim-full' : '') + '">' +
        '<div class="dim-label">' + escHtml(d) + '</div>' +
        '<div class="dim-stage" style="color:' + STAGES[dimStages[i]].textColor + '">Level ' + (dimStages[i] + 1) + ': ' + STAGES[dimStages[i]].label + '</div>' +
      '</div>';
    }).join('');

    // Offer mapping
    var offers = [
      { stage: 'Level 1–2', offer: 'Aha! Moment Workshop', desc: 'Ein Tag, ein Durchblick — wo Ihre größten Hebel liegen.', icon: '&#x1F50D;', match: overallStage <= 1 },
      { stage: 'Level 2–3', offer: 'Tech Upgrade', desc: 'Engpass gefunden? Wir lösen ihn. Prozesse, Systeme, Automatisierung.', icon: '&#x26A1;', match: overallStage >= 1 && overallStage <= 2 },
      { stage: 'Level 3–4', offer: 'Laufende Begleitung', desc: 'Technische Führung ohne Fixkosten. CIO as a Service.', icon: '&#x1F504;', match: overallStage >= 2 },
    ];
    var offerHtml = offers.map(function (o, i) {
      return '<div class="offer-row' + (o.match ? '' : ' offer-dim') + '"' + (i > 0 ? ' style="border-top:1px solid rgba(0,0,0,0.06)"' : '') + '>' +
        '<div class="offer-icon">' + o.icon + '</div>' +
        '<div><div class="offer-name">' + o.offer + ' <span class="offer-stage">' + o.stage + '</span></div><div class="offer-desc">' + o.desc + '</div></div>' +
      '</div>';
    }).join('');

    var el = $('[data-phase="results"]');
    el.innerHTML =
      '<div class="quiz-container">' +
        // Header
        '<div class="quiz-eyebrow">Ihr Digitalisierungs-Level</div>' +
        (state.name ? '<div class="results-for">Ergebnis für <strong>' + escHtml(state.name) + '</strong></div>' : '') +

        // Stage gauge card
        '<div class="quiz-card">' +
          '<div style="text-align:center;margin:32px 0">' +
            '<div class="gauge-bars">' + gaugeBars + '</div>' +
            '<div class="stage-label" style="color:' + stageData.textColor + '">Level ' + (overallStage + 1) + ': ' + stageData.label + '</div>' +
            '<div class="stage-tagline">\u201E' + escHtml(stageData.tagline) + '\u201C</div>' +
          '</div>' +
          '<p class="stage-desc">' + escHtml(stageData.desc) + '</p>' +
          '<div class="comparison-box">&#x1F4CA; <strong>Zum Vergleich:</strong> ' + comparisonText + '</div>' +
        '</div>' +

        // Radar chart card
        '<div class="quiz-card" style="margin-top:20px">' +
          '<h3 class="card-title" style="text-align:center">Ihr Dimensions-Profil</h3>' +
          '<p class="card-subtitle" style="text-align:center">Je weiter außen, desto reifer die Dimension</p>' +
          '<div class="radar-wrap">' + renderRadarChart(dimScores) + '</div>' +
          '<div class="dim-grid">' + dimBreakdown + '</div>' +
        '</div>' +

        // Bottleneck reveal card
        '<div class="quiz-card bottleneck-card" style="margin-top:20px">' +
          '<div class="bottleneck-eyebrow">' + (bottleneck ? '&#x26A1; Ihr Engpass' : '&#x26A1; Ihr Aha-Moment') + '</div>' +
          '<h3 class="bottleneck-title">' + escHtml(reveal.title) + '</h3>' +
          '<p class="bottleneck-text">' + escHtml(reveal.text) + '</p>' +
        '</div>' +

        // Next steps card
        '<div class="quiz-card" style="margin-top:20px">' +
          '<h3 class="card-title">Ihr nächster Schritt</h3>' +
          '<p class="quiz-subtitle" style="margin-bottom:24px">' + nextStepText + '</p>' +
          '<a href="https://meetings-eu1.hubspot.com/tommi-enenkel/meeting" target="_blank" rel="noopener" class="btn-primary btn-large" style="display:block;text-align:center;text-decoration:none">' + escHtml(routing.cta) + '</a>' +
          '<div class="quiz-hint" style="text-align:center;margin-top:10px">' + escHtml(routing.ctaSub) + '</div>' +
        '</div>' +

        // Offer mapping
        '<div class="offer-box">' +
          '<div class="offer-header">Was passt zu Ihrem Level?</div>' +
          offerHtml +
        '</div>' +

        // Debug section
        (DEBUG ? renderDebug(dimScores, dimStages, overallStage, bottleneck) : '') +
      '</div>';
  }

  // ─── PROGRESS BAR ──────────────────────────────────────────────
  function renderProgressBar(current) {
    var pct = ((current + 1) / totalQ) * 100;
    return '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  }

  // ─── DEBUG SECTION ──────────────────────────────────────────────
  function renderDebug(dimScores, dimStages, overallStage, bottleneck) {
    var maxStage = Math.max.apply(null, dimStages);
    var minStage = Math.min.apply(null, dimStages);

    // Raw scores table
    var scoreRows = DIMENSIONS.map(function (d, i) {
      return '<tr><td class="debug-td">' + escHtml(d) + '</td><td class="debug-td" style="font-weight:700">' + dimScores[i] + '</td><td class="debug-td">' + (dimStages[i] + 1) + '</td><td class="debug-td">' + STAGES[dimStages[i]].label + '</td></tr>';
    }).join('');
    scoreRows += '<tr style="border-top:2px solid rgba(0,0,0,0.06)"><td class="debug-td" style="font-weight:700">Gesamt</td><td class="debug-td" style="font-weight:700">' + dimScores.reduce(function (a, b) { return a + b; }, 0) + ' / 30</td><td class="debug-td" style="font-weight:700">' + (overallStage + 1) + '</td><td class="debug-td" style="font-weight:700">' + STAGES[overallStage].label + '</td></tr>';

    // Ranked bottleneck variants
    var rankedVariants = Object.keys(DISCREPANCY_TEXTS).map(function (key) {
      var val = DISCREPANCY_TEXTS[key];
      var parts = key.split('-');
      var highIdx = parseInt(parts[0]);
      var lowIdx = parseInt(parts[1].replace('l', ''));
      var highStage = dimStages[highIdx];
      var lowStage = dimStages[lowIdx];
      var discrepancy = highStage - lowStage;
      var directionMatch = highStage > lowStage ? 1 : 0;
      var matchScore = discrepancy * 2 + directionMatch;
      var isActive = bottleneck && bottleneck.title === val.title;
      return { key: key, title: val.title, text: val.text, highIdx: highIdx, lowIdx: lowIdx, highStage: highStage, lowStage: lowStage, discrepancy: discrepancy, directionMatch: directionMatch, matchScore: matchScore, isActive: isActive };
    });
    rankedVariants.sort(function (a, b) { return b.matchScore - a.matchScore; });

    var variantRows = rankedVariants.map(function (v, i) {
      var cls = v.isActive ? 'debug-variant active' : (i === 0 && !v.isActive ? 'debug-variant top-match' : 'debug-variant');
      return '<div class="' + cls + '">' +
        '<div class="debug-variant-header">' +
          '<div class="debug-variant-badges">' +
            '<span class="debug-badge' + (v.matchScore > 2 ? ' green' : v.matchScore > 0 ? ' orange' : ' red') + '">Score: ' + v.matchScore + '</span>' +
            (v.isActive ? '<span class="debug-badge orange">&#x2605; Active</span>' : '') +
            '<span class="debug-key">' + v.key + '</span>' +
          '</div>' +
          '<span class="debug-rank">#' + (i + 1) + '</span>' +
        '</div>' +
        '<div class="debug-dims">' + escHtml(DIMENSIONS[v.highIdx]) + ' (Stufe ' + (v.highStage + 1) + ') &uarr; &times; ' + escHtml(DIMENSIONS[v.lowIdx]) + ' (Stufe ' + (v.lowStage + 1) + ') &darr; &middot; &Delta;' + v.discrepancy + ' &middot; Direction: ' + (v.directionMatch ? '&#x2713;' : '&#x2717;') + '</div>' +
        '<div class="debug-variant-title">' + escHtml(v.title) + '</div>' +
        '<div class="debug-variant-text">' + escHtml(v.text) + '</div>' +
      '</div>';
    }).join('');

    // Fallbacks
    var fallbackItems = [
      { key: 'fallback-allSame-low', title: 'Sauberer Anfang', text: 'Start bei Null — und das ist kein Nachteil. Kein Altlasten-Chaos, kein Tool-Friedhof. Sie können von Anfang an richtig aufbauen.', condition: 'Alle Dimensionen ≤ Stufe 1', conditionMet: dimStages.every(function (s) { return s <= 1; }) && maxStage - minStage === 0 },
      { key: 'fallback-allSame-high', title: 'Top-Ausgangslage', text: 'Top 10% der KMU. Sie haben die Basis geschaffen. Die Frage ist nicht ob, sondern wie schnell Sie den nächsten Schritt machen.', condition: 'Alle Dimensionen ≥ Stufe 3', conditionMet: dimStages.every(function (s) { return s >= 2; }) && maxStage - minStage === 0 },
      { key: 'fallback-balanced', title: 'Solides Fundament', text: 'Überall angefangen, nirgends durchgezogen — typisch für KMU in Ihrer Größe. Die gute Nachricht: Ein fokussierter Schritt bringt sofort Ergebnisse.', condition: 'Alle Dimensionen auf ähnlichem Level (Fallback)', conditionMet: !bottleneck },
    ];

    var fallbackRows = fallbackItems.map(function (fb) {
      var isActiveFb = fb.conditionMet && !bottleneck;
      var cls = isActiveFb ? 'debug-variant active' : (fb.conditionMet ? 'debug-variant match' : 'debug-variant');
      return '<div class="' + cls + '">' +
        '<div class="debug-variant-badges">' +
          '<span class="debug-badge' + (fb.conditionMet ? ' green' : '') + '">' + (fb.conditionMet ? 'MATCH' : 'NO MATCH') + '</span>' +
          (isActiveFb ? '<span class="debug-badge orange">&#x2605; Active</span>' : '') +
        '</div>' +
        '<div class="debug-dims">Bedingung: ' + fb.condition + '</div>' +
        '<div class="debug-variant-title">' + escHtml(fb.title) + '</div>' +
        '<div class="debug-variant-text">' + escHtml(fb.text) + '</div>' +
      '</div>';
    }).join('');

    // Stage routes
    var stageRoutes = [
      { id: 'stage-1-2', label: 'Stufe 1–2 → Aha! Moment Workshop', copy: 'Am meisten profitieren Sie jetzt von Klarheit: verstehen, wo die größten Hebel liegen, bevor Sie investieren.', cta: 'Aha! Moment Workshop buchen', ctaSub: 'Ein Tag, ein Durchblick — wo Ihre größten Hebel liegen', stageMatch: overallStage <= 1, stageScore: overallStage <= 1 ? 3 : overallStage === 2 ? 1 : 0 },
      { id: 'stage-2-3', label: 'Stufe 2–3 → Tech Upgrade', copy: 'Sie haben die Grundlage — jetzt geht es darum, Systeme zu verbinden und Engpässe gezielt zu lösen.', cta: 'Tech Upgrade Gespräch vereinbaren', ctaSub: 'Engpass gefunden? Wir lösen ihn.', stageMatch: overallStage >= 1 && overallStage <= 2, stageScore: overallStage === 1 || overallStage === 2 ? 3 : 1 },
      { id: 'stage-3-4', label: 'Stufe 3–4 → Laufende Begleitung', copy: 'Sie sind weiter als die meisten. Jetzt geht es um kontinuierliche Optimierung und strategische Skalierung.', cta: 'Gespräch für laufende Begleitung vereinbaren', ctaSub: 'Technische Führung ohne Fixkosten. CIO as a Service.', stageMatch: overallStage >= 2, stageScore: overallStage >= 2 ? 3 : overallStage === 1 ? 1 : 0 },
      { id: 'stage-discrepancy', label: 'Große Diskrepanz → Aha! Moment (Bottleneck first)', copy: 'Ihre Dimensionen sind sehr unterschiedlich entwickelt. Der größte Hebel liegt darin, zuerst den Engpass zu identifizieren und gezielt zu lösen.', cta: 'Aha! Moment Workshop buchen', ctaSub: 'Erst Klarheit, dann Umsetzung.', stageMatch: maxStage - minStage >= 2, stageScore: maxStage - minStage >= 2 ? 4 : 0 },
    ];
    stageRoutes.sort(function (a, b) { return b.stageScore - a.stageScore; });
    var activeStageRoute = stageRoutes.find(function (r) { return r.stageMatch; }) || stageRoutes[0];

    var stageRouteRows = stageRoutes.map(function (r) {
      var isA = r.id === activeStageRoute.id;
      var cls = isA ? 'debug-variant active' : 'debug-variant';
      return '<div class="' + cls + '">' +
        '<div class="debug-variant-badges">' +
          '<span class="debug-badge' + (r.stageScore >= 3 ? ' green' : r.stageScore > 0 ? ' orange' : '') + '">Stage-Score: ' + r.stageScore + '</span>' +
          (isA ? '<span class="debug-badge orange">&#x2605; Active</span>' : '') +
        '</div>' +
        '<div class="debug-variant-title">' + escHtml(r.label) + '</div>' +
        '<div class="debug-variant-text"><em>Body:</em> ' + escHtml(r.copy) + '</div>' +
        '<div class="debug-dims"><strong>CTA:</strong> ' + escHtml(r.cta) + ' &middot; <em>' + escHtml(r.ctaSub) + '</em></div>' +
      '</div>';
    }).join('');

    // Pref routes
    var prefRouteRows = ROUTING.map(function (r, i) {
      var prefMatch = state.qualAnswers[3] === i;
      var cls = prefMatch ? 'debug-variant active' : 'debug-variant';
      return '<div class="' + cls + '">' +
        '<div class="debug-variant-badges">' +
          '<span class="debug-badge' + (prefMatch ? ' blue' : '') + '">' + (prefMatch ? 'SELECTED' : '—') + '</span>' +
          (prefMatch ? '<span class="debug-badge orange">&#x2605; Active</span>' : '') +
        '</div>' +
        '<div class="debug-dims">Antwort: \u201E' + escHtml(QUAL_QUESTIONS[3].opts[i]) + '\u201C</div>' +
        '<div class="debug-variant-title">' + escHtml(r.cta) + '</div>' +
        '<div class="debug-variant-text">' + escHtml(r.ctaSub) + ' &middot; Typ: ' + r.type + '</div>' +
      '</div>';
    }).join('');

    // Stage descriptions
    var stageDescRows = STAGES.map(function (s, i) {
      var isA = i === overallStage;
      var cls = isA ? 'debug-variant active' : 'debug-variant';
      return '<div class="' + cls + '">' +
        '<div class="debug-variant-badges">' +
          '<span class="debug-badge" style="background:' + s.color + ';color:#fff">Stufe ' + (i + 1) + '</span>' +
          (isA ? '<span class="debug-badge orange">&#x2605; Active</span>' : '') +
          '<span class="debug-variant-title" style="margin:0;font-size:14px">' + s.label + '</span>' +
        '</div>' +
        '<div class="debug-dims" style="font-style:italic">\u201E' + escHtml(s.tagline) + '\u201C</div>' +
        '<div class="debug-variant-text">' + escHtml(s.desc) + '</div>' +
      '</div>';
    }).join('');

    // Qual answers summary
    var qualRows = QUAL_QUESTIONS.map(function (qObj, i) {
      var hasAnswer = state.qualAnswers[i] !== undefined;
      return '<div style="margin-bottom:12px">' +
        '<div style="font-size:12px;font-weight:600;margin-bottom:2px">F' + (SCORED_QUESTIONS.length + i + 1) + ': ' + escHtml(qObj.q) + '</div>' +
        '<div style="font-size:13px;color:' + (hasAnswer ? 'var(--color-terracotta)' : 'var(--color-subtle)') + ';font-weight:' + (hasAnswer ? '600' : '400') + '">' +
          (hasAnswer ? '&rarr; \u201E' + escHtml(qObj.opts[state.qualAnswers[i]]) + '\u201C' : '(keine Antwort)') +
        '</div>' +
      '</div>';
    }).join('');
    if (state.freetext) {
      qualRows += '<div style="margin-top:8px"><div style="font-size:12px;font-weight:600;margin-bottom:2px">F15: Freitext</div><div style="font-size:13px;color:var(--color-terracotta);font-style:italic">&rarr; \u201E' + escHtml(state.freetext) + '\u201C</div></div>';
    }

    return '<div class="debug-section">' +
      '<div class="debug-header">&#x1F6E0; Debug Output — Copy Evaluation</div>' +
      '<div class="debug-intro">Alle Bottleneck- und Next-Step-Varianten, sortiert nach Match-Score für diesen User. Die aktiv angezeigte Variante ist markiert.</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x1F4D0; Raw Scores</div>' +
        '<table class="debug-table"><thead><tr><th class="debug-th">Dimension</th><th class="debug-th">Score (0–6)</th><th class="debug-th">Stufe</th><th class="debug-th">Label</th></tr></thead><tbody>' + scoreRows + '</tbody></table>' +
        '<div class="debug-dims" style="margin-top:8px">Max Diskrepanz: Stufe ' + (maxStage + 1) + ' (' + escHtml(DIMENSIONS[dimStages.indexOf(maxStage)]) + ') &rarr; Stufe ' + (minStage + 1) + ' (' + escHtml(DIMENSIONS[dimStages.indexOf(minStage)]) + ') = &Delta;' + (maxStage - minStage) + '</div>' +
      '</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x26A1; Bottleneck-Reveal Varianten (ranked by match)</div>' +
        '<div class="debug-intro">Match-Score = Diskrepanz zwischen den beiden referenzierten Dimensionen. Höher = besser passend. Fallbacks werden gezeigt wenn keine Diskrepanz existiert.</div>' +
        variantRows +
        '<div class="debug-subheader">Fallback-Texte</div>' +
        fallbackRows +
      '</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x1F3AF; Next Steps Copy Variants (ranked by match)</div>' +
        '<div class="debug-intro">Kombination aus Reifegrad-Routing (welches Offer passt) und Frage-14-Routing (Präferenz). Die aktiv angezeigte Variante ist markiert.</div>' +
        '<div class="debug-subheader">Nach Reifegrad</div>' +
        stageRouteRows +
        '<div class="debug-subheader">Nach Frage 14 (Präferenz)</div>' +
        prefRouteRows +
      '</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x1F3F7; Stufen-Beschreibungen (alle 4)</div>' +
        '<div class="debug-intro">Die Beschreibung der zugewiesenen Stufe wird auf der Ergebnis-Seite angezeigt. Alle vier hier zum Vergleich.</div>' +
        stageDescRows +
      '</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x1F4CB; Qualifikations-Antworten (Sales Intelligence)</div>' +
        qualRows +
      '</div>' +
    '</div>';
  }

  // ─── ARROW KEY NAVIGATION ──────────────────────────────────────
  function addArrowNavigation(container) {
    if (!container) return;
    var buttons = Array.from(container.querySelectorAll('.option-btn'));
    container.addEventListener('keydown', function (e) {
      var idx = buttons.indexOf(document.activeElement);
      if (idx === -1) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        buttons[(idx + 1) % buttons.length].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        buttons[(idx - 1 + buttons.length) % buttons.length].focus();
      }
    });
  }

  // ─── UTILITIES ──────────────────────────────────────────────────
  function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ─── INIT ───────────────────────────────────────────────────────
  var saved = loadState();
  if (saved && saved.phase !== 'landing' && saved.phase !== 'results') {
    var banner = document.createElement('div');
    banner.id = 'quiz-resume-banner';
    banner.className = 'quiz-resume-banner';
    banner.innerHTML =
      '<span>Sie haben einen laufenden Digital-Check. Fortsetzen?</span>' +
      '<button class="btn-resume" id="resume-btn">Fortsetzen</button>' +
      '<button class="btn-restart" id="restart-btn">Neu starten</button>';
    $app.parentNode.insertBefore(banner, $app);

    document.getElementById('resume-btn').addEventListener('click', function () {
      Object.assign(state, saved);
      banner.remove();
      render();
    });
    document.getElementById('restart-btn').addEventListener('click', function () {
      clearState();
      banner.remove();
    });
  }
  render();
})();
