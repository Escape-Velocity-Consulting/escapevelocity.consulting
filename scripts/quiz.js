// ─── Digital-Check Quiz ───────────────────────────────────────────
// Vanilla JS port of quiz/draft.jsx — Escape Velocity brand system
// ──────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  var DEBUG = new URLSearchParams(window.location.search).get('debug') === 'true';

  // Path routing — quiz.js only runs interactive logic on /quiz/check/.
  // The /quiz/ landing page has its own tiny inline script for CTA tracking.
  var IS_CHECK_PAGE = location.pathname.indexOf('/quiz/check') === 0;

  // Shared results via URL query. Canonical: /quiz/check/?s=53211 (5 digits, one
  // per dimension score 0–6). Legacy /quiz/?r=... is redirected by an inline
  // script in quiz/index.njk to the canonical URL.
  var SHARED_SCORES = (function () {
    var params = new URLSearchParams(window.location.search);
    var code = params.get('s') || params.get('r');
    if (!code || code.length !== 5) return null;
    var scores = [];
    for (var i = 0; i < 5; i++) {
      var v = parseInt(code[i], 10);
      if (isNaN(v) || v < 0 || v > 6) return null;
      scores.push(v);
    }
    return scores;
  })();

  // ─── ANALYTICS (dataLayer / GTM) ────────────────────────────────
  // Fires ev_quiz_* events consumed by Custom Event triggers in GTM.
  // No PII (email, name, freetext) is ever pushed — those go to HubSpot
  // via the Forms API, not through analytics.
  function track(eventName, params) {
    try {
      window.dataLayer = window.dataLayer || [];
      var payload = { event: eventName };
      if (params) {
        for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
      }
      window.dataLayer.push(payload);
    } catch (e) { /* analytics must never break the quiz */ }
  }

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
      desc: 'Sie haben in digitale Werkzeuge investiert: Buchhaltung, CRM, Cloud. Aber die Systeme arbeiten nicht zusammen. Daten werden mehrfach eingegeben, Medienbrüche kosten Zeit, und niemand nutzt die Software so, wie sie gedacht war.',
    },
    {
      label: 'Vernetzt',
      tagline: 'Es läuft, auch wenn ich nicht da bin.',
      color: '#3A8F6E',
      textColor: '#2D7358',
      desc: 'Ihre Kernprozesse sind standardisiert und Systeme verbunden. Daten fließen, Routineaufgaben werden teilweise automatisiert. Das Team arbeitet nach definierten Abläufen. Sie haben einen klaren Überblick. Jetzt geht es um die nächste Stufe.',
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
        'Kein Problem, Abläufe sind dokumentiert und andere können übernehmen',
        'Es holpert, aber wir kriegen es hin',
        'Es wird eng, vieles bleibt liegen',
        'Chaos, denn nur diese Person weiß, wie bestimmte Dinge laufen',
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
      q: 'Wenn Sie den aktuellen Stand eines Kundenprojekts oder einer Aufgabe wissen müssen: Wie schnell finden Sie die Information?',
      opts: [
        'Sofort, alles ist zentral und aktuell abrufbar',
        'In ein paar Minuten, ich muss in verschiedenen Systemen nachschauen',
        'Es dauert, ich muss Kollegen fragen oder E-Mails durchsuchen',
        'Ich hab keinen verlässlichen Weg, das herauszufinden',
      ],
    },
    {
      dim: 3,
      q: 'Wie steht Ihr Team dem Thema Digitalisierung und neue Tools gegenüber?',
      opts: [
        'Offen und neugierig, einige treiben das Thema aktiv voran',
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
        'Schulung: Wir wollen es selbst können',
        'Workshop: Wir brauchen eine klare Analyse und Strategie',
        'Umsetzung: Wir wollen, dass jemand das für uns baut',
        'Weiß ich noch nicht',
      ],
    },
  ];

  var DISCREPANCY_TEXTS = {
    '0h-1l': { title: 'Gute Abl\u00E4ufe, schwache Systeme', text: 'Ihre Abl\u00E4ufe sind durchdacht, doch Ihre Systeme halten nicht mit. Vieles, was l\u00E4ngst automatisch laufen k\u00F6nnte, wird noch von Hand erledigt.' },
    '0h-2l': { title: 'Abl\u00E4ufe ohne \u00DCberblick', text: 'Ihre Prozesse funktionieren, aber Ihre Daten geben kein klares Bild. Ohne eine solide Datenbasis bleiben Verbesserungen schwer zu priorisieren.' },
    '0h-3l': { title: 'Prozesse ohne Mannschaft', text: 'Ihre Abl\u00E4ufe sind gut durchdacht, aber Ihr Team braucht noch Unterst\u00FCtzung, um sie im Alltag umzusetzen. Gute Prozesse entfalten ihre Wirkung erst, wenn das Team sie mittr\u00E4gt.' },
    '0h-4l': { title: 'Abl\u00E4ufe ohne Strategie', text: 'Ihre Abl\u00E4ufe funktionieren, doch eher aus Gewohnheit als aus Strategie. Ohne eine F\u00FChrung, die das Thema aktiv steuert, fehlt die Richtung f\u00FCr den n\u00E4chsten Schritt.' },
    '1h-0l': { title: 'Tools ohne Fundament', text: 'Sie haben in Software investiert, aber die Abl\u00E4ufe darunter sind noch nicht standardisiert. Ohne klare Prozesse nutzt jeder die gleichen Tools anders, und die Investition wirkt nicht so, wie sie k\u00F6nnte.' },
    '1h-2l': { title: 'Systeme ohne Substanz', text: 'Sie haben gute Systeme im Einsatz, doch die Daten darin halten nicht mit. Gute Software kann nur so gut arbeiten wie die Daten, die sie bekommt.' },
    '1h-3l': { title: 'Werkzeuge ohne Anwender', text: 'Sie haben in gute Systeme investiert, aber Ihr Team nutzt sie noch nicht voll aus. Das Potenzial ist da. Es braucht Begleitung, damit die Tools im Alltag ankommen.' },
    '1h-4l': { title: 'Werkzeuge ohne Richtung', text: 'Die Tools sind da, aber es fehlt die strategische Steuerung. Ohne klare Richtung von oben entscheidet jeder selbst, was er wie nutzt.' },
    '2h-0l': { title: 'Daten ohne Prozesse', text: 'Ihre Daten sind in gutem Zustand, aber Ihre Abl\u00E4ufe sind noch nicht strukturiert genug, um davon zu profitieren. Saubere Daten in unklaren Prozessen sind ungenutztes Potenzial.' },
    '2h-1l': { title: 'Daten ohne Infrastruktur', text: 'Ihre Daten w\u00E4ren bereit, doch Ihre Systeme k\u00F6nnen noch nicht genug damit anfangen. Die Grundlage ist da, die technische Infrastruktur muss nachziehen.' },
    '2h-3l': { title: 'Daten ohne Kompetenz', text: 'Ihre Daten sind solide, aber Ihr Team braucht noch das Know-how, um sie gezielt zu nutzen. Mit der richtigen Begleitung wird aus Datenbasis echte Entscheidungsgrundlage.' },
    '2h-4l': { title: 'Daten ohne Richtung', text: 'Ihre Datengrundlage ist solide, aber sie wird noch nicht strategisch genutzt. Die Basis f\u00FCr bessere Entscheidungen ist da, doch es fehlt der Plan, sie einzusetzen.' },
    '3h-0l': { title: 'Motivation ohne Struktur', text: 'Ihr Team ist digital-affin und motiviert, aber es fehlen standardisierte Abl\u00E4ufe. Ohne klare Prozesse wird improvisiert: engagiert, aber schwer skalierbar.' },
    '3h-1l': { title: 'Kompetenz ohne Werkzeuge', text: 'Ihr Team w\u00E4re bereit f\u00FCr bessere Werkzeuge, aber die Systeme halten noch nicht mit. Digitale Kompetenz wird durch fehlende oder veraltete Software ausgebremst.' },
    '3h-2l': { title: 'Team ohne Datenbasis', text: 'Ihr Team ist offen f\u00FCr Digitalisierung, aber die Datenbasis fehlt noch. Bevor Ihr Team richtig loslegen kann, m\u00FCssen die Grundlagen stimmen.' },
    '3h-4l': { title: 'Motivation ohne Mandat', text: 'Ihr Team w\u00E4re bereit, doch es fehlt das klare Signal von oben. Ohne R\u00FCckendeckung der F\u00FChrung bleiben gute Initiativen auf halber Strecke stehen.' },
    '4h-0l': { title: 'Vision ohne Fundament', text: 'Die Gesch\u00E4ftsf\u00FChrung hat eine klare digitale Vision, aber die Abl\u00E4ufe im Tagesgesch\u00E4ft sind noch nicht darauf ausgerichtet. Damit die Strategie greift, braucht es ein solides Prozess-Fundament.' },
    '4h-1l': { title: 'Plan ohne Werkzeuge', text: 'Sie haben den Plan, aber noch nicht die Werkzeuge. Die strategische Richtung stimmt. Jetzt braucht es die technische Infrastruktur, um sie umzusetzen.' },
    '4h-2l': { title: 'Strategie ohne Datenbasis', text: 'Die F\u00FChrung treibt Digitalisierung voran, aber die Datenbasis ist noch l\u00FCckenhaft. Strategische Entscheidungen brauchen verl\u00E4ssliche Daten als Grundlage.' },
    '4h-3l': { title: 'F\u00FChrung ohne Buy-in', text: 'Die Gesch\u00E4ftsf\u00FChrung will vorw\u00E4rts, doch das Team ist noch nicht mit an Bord. Ohne Buy-in im Team bleibt jede Initiative ein Pilotprojekt.' },
  };

  // v2: Dimension-Stage full sentences — each dimension self-contained, no cross-references
  var DIM_STAGE_TEXTS = [
    // Prozesse & Workflows
    [
      'Ihre Prozesse sind nicht standardisiert, und jeder arbeitet nach eigenem System.',
      'Ihre Prozesse haben Grundroutinen, sind aber nicht durchg\u00E4ngig dokumentiert.',
      'Ihre Prozesse sind klar definiert und werden einheitlich gelebt.',
      'Ihre Prozesse sind durchgehend automatisiert und werden kontinuierlich verbessert.',
    ],
    // Tools & Systeme
    [
      'In Ihrem Unternehmen sind kaum digitale Werkzeuge im Einsatz.',
      'Sie nutzen einzelne digitale Tools, aber ohne einheitliche Strategie dahinter.',
      'Ihre wichtigsten Systeme sind aufeinander abgestimmt und werden gezielt eingesetzt.',
      'Ihre Systemlandschaft ist durchg\u00E4ngig integriert, und jedes Tool hat seinen Platz.',
    ],
    // Daten & Information
    [
      'Sie haben keinen verl\u00E4sslichen \u00DCberblick \u00FCber Ihre Gesch\u00E4ftsdaten.',
      'Ihre Daten existieren digital, sind aber \u00FCber verschiedene Systeme verstreut.',
      'Ihre Daten sind an einem Ort zusammengef\u00FChrt und aktuell abrufbar.',
      'Ihre Daten sind sauber strukturiert und flie\u00DFen in Ihre Entscheidungen ein.',
    ],
    // Team & Kompetenz
    [
      'Ihrem Team fehlt digitales Know-how, und Digitalisierung ist kein Thema.',
      'Im Team ist Offenheit da, aber es fehlt an Sicherheit im Umgang mit digitalen Tools.',
      'Ihr Team ist digital-kompetent und setzt neue Werkzeuge eigenst\u00E4ndig ein.',
      'Ihr Team treibt Verbesserungen aktiv voran und ist offen f\u00FCr Neues.',
    ],
    // Führung & Richtung
    [
      'Digitalisierung ist kein Thema auf Gesch\u00E4ftsf\u00FChrungsebene.',
      'Digitalisierung steht auf der Agenda, aber es fehlt ein konkreter Plan.',
      'Ihre F\u00FChrung hat Digitalisierung als Priorit\u00E4t mit klaren Ressourcen verankert.',
      'Ihre F\u00FChrung steuert die digitale Entwicklung aktiv mit Roadmap und Erfolgsmessung.',
    ],
  ];

  // v2: Dimension short labels for personalized text
  var DIM_SHORT = ['Prozesse', 'Tools', 'Daten', 'Team', 'F\u00FChrung'];

  // v2: Cluster narratives for 2-bottleneck scenarios (spec section 5, Scenario B)
  var CLUSTER_TEXTS = {
    '0-1': { label: 'Operatives Fundament', text: 'Weder die Abl\u00E4ufe noch die Systeme sind auf dem n\u00F6tigen Stand. Sie arbeiten ohne standardisierte Prozesse und ohne die Werkzeuge, die sie tragen k\u00F6nnten. Das operative Fundament muss zuerst stehen.' },
    '0-2': { label: 'Blinder Flug', text: 'Ihre Abl\u00E4ufe sind nicht standardisiert und Ihre Daten geben keinen \u00DCberblick. Sie steuern im Blindflug, ohne zu wissen, wo Zeit verloren geht und ohne die Zahlen, die es beweisen.' },
    '0-3': { label: 'Execution Gap', text: 'Weder die Abl\u00E4ufe noch die Mannschaft sind bereit f\u00FCr den n\u00E4chsten Schritt. Es braucht beides: klare Prozesse UND ein Team das sie lebt.' },
    '0-4': { label: 'Strategie-Execution-L\u00FCcke', text: 'Weder von oben noch von unten gibt es klare Strukturen. Es fehlt sowohl die strategische Richtung als auch das operative Fundament.' },
    '1-2': { label: 'Technische Infrastruktur', text: 'Ihre Abl\u00E4ufe sind klar und das Team ist bereit, doch die technische Infrastruktur h\u00E4lt nicht mit. Die Werkzeuge und die Datengrundlage m\u00FCssen aufholen.' },
    '1-3': { label: 'Adoptions-L\u00FCcke', text: 'Die Werkzeuge fehlen und das Team hat nicht das Know-how, um neue Systeme zu nutzen. Beides muss zusammen aufgebaut werden, sonst wiederholt sich der Kreislauf aus Anschaffung und Nicht-Nutzung.' },
    '1-4': { label: 'Investitionsstau', text: 'Es fehlt sowohl die technische Infrastruktur als auch die strategische F\u00FChrung, die Investitionen vorantreibt. Ohne ein Signal von oben und ohne die richtigen Werkzeuge passiert nichts.' },
    '2-3': { label: 'Wissensl\u00FCcke', text: 'Die Grundlagen fehlen auf zwei Seiten: Ihrem Team fehlt das Know-how und Ihren Daten fehlt die Struktur. Beides muss parallel aufgebaut werden.' },
    '2-4': { label: 'Strategische Blindheit', text: 'Keine verl\u00E4sslichen Daten und keine F\u00FChrung, die datenbasiert entscheidet. Strategische Entscheidungen fallen aus dem Bauch, weil es weder die Zahlen noch den Plan gibt, es anders zu machen.' },
    '3-4': { label: 'Organisatorische Verankerung', text: 'Die technische Grundlage steht, aber es fehlt die organisatorische Verankerung. Ohne ein Team das mitzieht und eine F\u00FChrung die das Thema treibt, bleiben gute Systeme ungenutzt.' },
  };

  // v2: Outcome texts per weak dimension — authoritative recommendations, full sentences
  var OUTCOME_TEXTS = [
    'Machen Sie Ihre Kernprozesse sichtbar. Erst wenn klar ist, wo im Alltag Stunden verloren gehen, lassen sich die richtigen Abl\u00E4ufe gezielt verbessern.',
    'Sortieren Sie Ihre Systemlandschaft. Welche Werkzeuge bleiben, welche gehen, und wie m\u00FCssen die verbleibenden Systeme zusammenspielen, damit Medienbr\u00FCche verschwinden?',
    'Bringen Sie Ordnung in Ihre Datenlandschaft. Solange Informationen \u00FCber verschiedene Systeme verstreut sind, fehlt die Grundlage f\u00FCr fundierte Entscheidungen.',
    'Bef\u00E4higen Sie Ihr Team gezielt. Neue Prozesse und Tools entfalten ihre Wirkung nur, wenn die Menschen, die damit arbeiten, sicher im Umgang sind.',
    'Erarbeiten Sie eine konkrete Digitalisierungs-Roadmap. Ohne klare Priorit\u00E4ten, realistisches Budget und definierte Meilensteine bleibt Digitalisierung ein Vorsatz statt ein Projekt.',
  ];

  // v2: Dream outcome per dimension — vivid after-picture, no prefix (lead-in is dynamic)
  var OUTCOME_DREAMS = [
    'Ihr Team arbeitet nach klaren Abl\u00E4ufen. Kein Suchen, kein Improvisieren, keine Feuerwehreins\u00E4tze. Routineaufgaben laufen, und Sie haben den Kopf frei f\u00FCr das, was Ihr Unternehmen wirklich voranbringt.',
    'Ihre Systeme arbeiten zusammen. Daten flie\u00DFen automatisch, kein Abtippen zwischen Programmen. Ihr Team \u00F6ffnet morgens ein Dashboard und sieht alles, was z\u00E4hlt, auf einen Blick.',
    'Sie \u00F6ffnen ein Dashboard und sehen sofort, wo Ihr Unternehmen steht. Keine Excel-Suche, keine R\u00FCckfragen, keine veralteten Zahlen. Entscheidungen treffen Sie auf Basis von Fakten, nicht aus dem Bauch.',
    'Ihr Team geht souver\u00E4n mit neuen Tools um. Keine Angst vor Ver\u00E4nderung, keine Workarounds. Neue Prozesse werden nicht nur eingef\u00FChrt, sie werden gelebt.',
    'Sie haben einen klaren Plan. Sie wissen, was als N\u00E4chstes kommt, was es kostet und was es bringt. Keine endlosen Strategiemeetings, sondern eine Roadmap, der Ihr Team folgen kann.',
  ];

  // v1 ROUTING kept for HubSpot backward compatibility in submitResults()
  var ROUTING = [
    { label: 'Schulung' },
    { label: 'Workshop' },
    { label: 'Umsetzung' },
    { label: 'Unentschieden' },
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
    return Math.min.apply(null, stages);
  }

  // v2: Multi-bottleneck analysis
  // Returns { type, weakDims, strongDims, minStage, maxStage, ... }
  function getBottleneckData(dimScores) {
    var stages = dimScores.map(dimToStage);
    var minStage = Math.min.apply(null, stages);
    var maxStage = Math.max.apply(null, stages);

    var weakDims = [];
    var strongDims = [];
    for (var i = 0; i < stages.length; i++) {
      if (stages[i] === minStage) weakDims.push(i);
      else strongDims.push(i);
    }

    // Tiebreak within minStage by raw score — only truly weakest count
    if (weakDims.length > 1) {
      var minRaw = Math.min.apply(null, weakDims.map(function (i) { return dimScores[i]; }));
      var trulyWeak = weakDims.filter(function (i) { return dimScores[i] === minRaw; });
      if (trulyWeak.length < weakDims.length) {
        weakDims.forEach(function (i) {
          if (dimScores[i] !== minRaw) strongDims.push(i);
        });
        weakDims = trulyWeak;
      }
    }

    // Scenario C: No discrepancy (all equal)
    if (maxStage === minStage) {
      var fallbackTitle, fallbackText;
      if (minStage === 0) {
        fallbackTitle = 'Sauberer Anfang';
        fallbackText = 'Start bei Null, ohne Altlasten-Chaos und ohne Tool-Friedhof. Sie k\u00F6nnen von Anfang an richtig aufbauen.';
      } else if (minStage >= 2) {
        fallbackTitle = 'Top-Ausgangslage';
        fallbackText = 'Top 10% der KMU. Die Frage ist nicht ob, sondern wie schnell Sie den n\u00E4chsten Schritt machen.';
      } else {
        fallbackTitle = 'Solides Fundament';
        fallbackText = '\u00DCberall angefangen, nirgends durchgezogen. Typisch f\u00FCr KMU in Ihrer Gr\u00F6\u00DFe. Ein fokussierter Schritt bringt sofort Ergebnisse.';
      }
      return { type: 'equal', title: fallbackTitle, text: fallbackText, weakDims: weakDims, strongDims: strongDims, minStage: minStage, maxStage: maxStage };
    }

    // Scenario A: Single bottleneck (1 weak dimension)
    if (weakDims.length === 1) {
      var lowIdx = weakDims[0];
      var highIdx = stages.indexOf(maxStage);
      var key = highIdx + 'h-' + lowIdx + 'l';
      var disc = DISCREPANCY_TEXTS[key];
      if (disc) {
        return { type: 'single', title: disc.title, text: disc.text, weakDims: weakDims, strongDims: strongDims, minStage: minStage, maxStage: maxStage, highDim: highIdx, lowDim: lowIdx };
      }
      return {
        type: 'single',
        title: DIMENSIONS[lowIdx] + ' bremst Sie',
        text: 'Ihre schw\u00E4chste Dimension ist \u201E' + DIMENSIONS[lowIdx] + '\u201C. Sie liegt deutlich hinter Ihren anderen Bereichen zur\u00FCck. Solange dieser Bereich nicht aufholt, k\u00F6nnen die anderen Dimensionen ihr Potenzial nicht entfalten.',
        weakDims: weakDims, strongDims: strongDims, minStage: minStage, maxStage: maxStage, highDim: highIdx, lowDim: lowIdx,
      };
    }

    // Scenario B: Exactly 2 bottlenecks
    if (weakDims.length === 2) {
      var clusterKey = weakDims[0] + '-' + weakDims[1];
      var cluster = CLUSTER_TEXTS[clusterKey];
      if (cluster) {
        return { type: 'cluster', label: cluster.label, text: cluster.text, weakDims: weakDims, strongDims: strongDims, minStage: minStage, maxStage: maxStage };
      }
    }

    // Scenario B2: 3+ bottlenecks (or 2 without cluster text)
    return { type: 'multi', weakDims: weakDims, strongDims: strongDims, minStage: minStage, maxStage: maxStage };
  }

  // ─── STATE ──────────────────────────────────────────────────────
  var state = {
    phase: 'contact',
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
      // On /quiz/check/, each forward step pushes a new hash onto history so
      // browser Back navigates to the previous step. render()→syncUrl() uses
      // replaceState, so we do the pushState here explicitly.
      if (IS_CHECK_PAGE) {
        var target = stateToHash();
        if (target && location.hash !== target) {
          history.pushState(null, '', location.pathname + location.search + target);
          _lastSyncedHash = target;
        }
      }
      render();
      $app.classList.remove('fade-out');
      $app.classList.add('fade-in');
      window.scrollTo(0, 0);
      setTimeout(function () { $app.classList.remove('fade-in'); }, 300);
    }, 300);
  }

  // ─── RADAR CHART (SVG) ─────────────────────────────────────────
  function renderRadarChart(dimScores, weakDims) {
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

    // Data dots — weak dims get warning color + pulse
    var wk = weakDims || [];
    for (var i = 0; i < n; i++) {
      var dp = pt(i, dimScores[i]);
      var isWeak = wk.indexOf(i) !== -1;
      if (isWeak) {
        svg += '<circle cx="' + dp[0] + '" cy="' + dp[1] + '" r="12" fill="#C4553A" fill-opacity="0.5" class="radar-dot-pulse"/>';
      }
      svg += '<circle cx="' + dp[0] + '" cy="' + dp[1] + '" r="5" fill="' + (isWeak ? '#C4553A' : 'var(--color-terracotta)') + '" stroke="#fff" stroke-width="2"/>';
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
    var bn = getBottleneckData(dimScores);
    var bottleneckLabel = bn.type === 'equal' ? bn.title : bn.type === 'cluster' ? bn.label : bn.type === 'single' ? bn.title : bn.weakDims.map(function (i) { return DIM_SHORT[i]; }).join(', ');
    var routingIdx = state.qualAnswers[3] !== undefined ? state.qualAnswers[3] : 3;
    return submitToHubSpot([
      { name: 'firstname', value: state.name },
      { name: 'email', value: state.email },
      { name: 'quiz_freetext', value: state.freetext },
      { name: 'quiz_stage', value: STAGES[overallStage].label },
      { name: 'quiz_dim_scores', value: dimScores.join(',') },
      { name: 'quiz_bottleneck', value: bottleneckLabel },
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

  // ─── URL / HASH ROUTING ─────────────────────────────────────────
  // Hash encodes the current step on /quiz/check/ so browser Back navigates
  // per-question. Layout: #contact → #f1..#f{SCORED} → #f{SCORED+1}..#f{SCORED+QUAL} → #freetext.
  function stateToHash() {
    if (state.phase === 'contact') return '#contact';
    if (state.phase === 'quiz') return '#f' + (state.currentQ + 1);
    if (state.phase === 'qual') return '#f' + (SCORED_QUESTIONS.length + state.currentQ + 1);
    if (state.phase === 'freetext') return '#freetext';
    return ''; // results uses ?s= query, no hash
  }

  function applyHash() {
    // Parse location.hash → update state.phase + state.currentQ. Returns true if state changed.
    var h = location.hash.replace(/^#/, '');
    if (!h || h === 'contact') {
      state.phase = 'contact';
      return true;
    }
    var m = h.match(/^f(\d+)$/);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 1 && n <= SCORED_QUESTIONS.length) {
        state.phase = 'quiz';
        state.currentQ = n - 1;
        return true;
      }
      if (n > SCORED_QUESTIONS.length && n <= SCORED_QUESTIONS.length + QUAL_QUESTIONS.length) {
        state.phase = 'qual';
        state.currentQ = n - SCORED_QUESTIONS.length - 1;
        return true;
      }
    }
    if (h === 'freetext') {
      state.phase = 'freetext';
      return true;
    }
    return false;
  }

  // Called from render() to keep URL in sync with state (without creating a new history entry — that's done by transition()).
  var _lastSyncedHash = null;
  function syncUrl() {
    if (!IS_CHECK_PAGE) return;
    var target = stateToHash();
    if (target && location.hash !== target && _lastSyncedHash !== target) {
      // Use replaceState so the render() sync doesn't duplicate history entries.
      history.replaceState(null, '', location.pathname + location.search + target);
      _lastSyncedHash = target;
    }
  }

  // popstate: browser Back/Forward changed the hash — sync state and re-render.
  if (IS_CHECK_PAGE) {
    window.addEventListener('popstate', function () {
      if (applyHash()) {
        _lastSyncedHash = location.hash;
        render();
      }
    });
  }

  // ─── RENDER ─────────────────────────────────────────────────────
  function render() {
    show(state.phase);
    syncUrl();

    switch (state.phase) {
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

    // If the landing is pre-rendered as static HTML in quiz/index.njk
    // (Phase 1 of the SEO refactor), skip innerHTML generation and just
    // bind the CTAs. Detecting via .landing-cta presence is simpler than
    // a marker class.
    if (el.querySelector('.landing-cta')) {
      var ctasStatic = el.querySelectorAll('.landing-cta');
      for (var ic = 0; ic < ctasStatic.length; ic++) {
        ctasStatic[ic].addEventListener('click', function () {
          track('ev_quiz_cta_click');
          openContactModal();
        });
      }
      return;
    }

    // ── Section 1: Hero ──
    var hero =
      '<div class="quiz-container" style="text-align:center;padding-top:80px;padding-bottom:100px">' +
        '<div class="quiz-eyebrow">Escape Velocity &middot; Digital-Check</div>' +
        '<h1 class="quiz-hero-title">Wo bremst sich Ihr<br>Unternehmen <em>selbst</em> aus?</h1>' +
        '<p class="quiz-hero-sub">15 Fragen. 5 Minuten. Danach wissen Sie, was Ihr Wachstum blockiert und was der n\u00E4chste Schritt ist.</p>' +

        '<div style="display:flex;flex-direction:column;align-items:center;gap:12px">' +
          '<button class="btn-primary btn-large landing-cta">Check starten <span class="btn-arrow">&rarr;</span></button>' +
          '<div class="landing-trust">Kostenlos &middot; Kein Login &middot; Ergebnis sofort</div>' +
        '</div>' +
      '</div>';

    // ── Section 2: Value-Prop Cards ──
    var cards =
      '<div class="quiz-container quiz-container--wide">' +
        '<h2 class="landing-section-title">So funktioniert der Digital-Check</h2>' +
        '<div class="landing-cards">' +
          '<div class="landing-card">' +
            '<div class="landing-card-num">01</div>' +
            '<div class="landing-icon-wrap">' +
              '<svg class="landing-icon" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 5-9"/></svg>' +
            '</div>' +
            '<div class="landing-card-title">Ihr Level sehen</div>' +
            '<div class="landing-card-body">Wo steht Ihr Unternehmen wirklich? Level 1 oder Level 4? Kein Bauchgef\u00FChl, sondern ein klares Bild \u00FCber 5 Dimensionen.</div>' +
          '</div>' +

          '<div class="landing-card featured">' +
            '<div class="landing-badge">Kernanalyse</div>' +
            '<div class="landing-card-num">02</div>' +
            '<div class="landing-icon-wrap">' +
              '<svg class="landing-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>' +
            '</div>' +
            '<div class="landing-card-title">Den Engpass finden</div>' +
            '<div class="landing-card-body">Eine Dimension bremst alle anderen. Wir zeigen Ihnen, welche, und warum genau dort Zeit und Geld verloren gehen.</div>' +
          '</div>' +

          '<div class="landing-card">' +
            '<div class="landing-card-num">03</div>' +
            '<div class="landing-icon-wrap">' +
              '<svg class="landing-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>' +
            '</div>' +
            '<div class="landing-card-title">Ihren n\u00E4chsten Schritt erfahren</div>' +
            '<div class="landing-card-body">Keine generische To-do-Liste. Sie erhalten eine konkrete Empfehlung, die zu Ihrem Level und Ihrem Engpass passt.</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ── Section 3: Levels Roadmap ──
    var levelItems = '';
    for (var i = 0; i < STAGES.length; i++) {
      levelItems +=
        '<div class="level-item">' +
          '<div class="level-dot">' + (i + 1) + '</div>' +
          '<div class="level-label">Level ' + (i + 1) + '</div>' +
          '<div class="level-name">' + STAGES[i].label + '</div>' +
          '<div class="level-quote">\u201E' + STAGES[i].tagline + '\u201C</div>' +
        '</div>';
    }

    var stages =
      '<div class="landing-stages">' +
        '<h2>4 Level. Eines davon ist Ihres.</h2>' +
        '<div class="levels-roadmap">' + levelItems + '</div>' +
        '<div style="text-align:center;margin-top:48px">' +
          '<button class="btn-primary btn-large landing-cta">Mein Level herausfinden <span class="btn-arrow">&rarr;</span></button>' +
        '</div>' +
      '</div>';

    // ── Section 3: Results Preview (Dark) ──
    // Static radar chart with sample data for dark background
    var sampleScores = [3, 2, 1, 4, 4];
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
    radarSvg += '<polygon points="' + dataPts.join(' ') + '" fill="var(--color-terracotta)" fill-opacity="0.2" stroke="var(--color-terracotta)" stroke-width="2.5" stroke-linejoin="round"/>';
    // Data dots
    for (var j = 0; j < rn; j++) {
      var dp = rPt(j, sampleScores[j]);
      radarSvg += '<circle cx="' + dp[0] + '" cy="' + dp[1] + '" r="6" fill="var(--color-terracotta)"/>';
    }
    // Labels
    var rLabelOffsets = [[0, -14], [14, 0], [10, 14], [-10, 14], [-14, 0]];
    var rAnchors = ['middle', 'start', 'start', 'end', 'end'];
    for (var j = 0; j < rn; j++) {
      var lp = rPt(j, rmaxVal);
      radarSvg += '<text x="' + (lp[0] + rLabelOffsets[j][0]) + '" y="' + (lp[1] + rLabelOffsets[j][1]) + '" text-anchor="' + rAnchors[j] + '" class="radar-label" font-weight="600">' + rLabels[j] + '</text>';
    }
    radarSvg += '</svg>';

    var checkSvg = '<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';

    var preview =
      '<div class="landing-preview">' +
        '<div class="dark-header">' +
          '<h2>In 5 Minuten wissen Sie mehr als nach dem letzten Strategie-Meeting</h2>' +
          '<p class="landing-preview-sub">Der Digital-Check liefert keine Theorie, sondern ein konkretes Profil Ihres Unternehmens. Das hier erwartet Sie:</p>' +
        '</div>' +
        '<div class="radar-layout">' +
          '<div class="radar-chart-wrap">' + radarSvg + '</div>' +
          '<div class="radar-benefits">' +
            '<div class="benefit-item">' +
              '<div class="benefit-check">' + checkSvg + '</div>' +
              '<div class="benefit-text">' +
                '<h4>Digitalisierungs-Level auf einen Blick</h4>' +
                '<p>\u00DCber 5 Dimensionen ausgewertet: Prozesse, Tools, Daten, Team und F\u00FChrung.</p>' +
              '</div>' +
            '</div>' +
            '<div class="benefit-item">' +
              '<div class="benefit-check">' + checkSvg + '</div>' +
              '<div class="benefit-text">' +
                '<h4>Der Engpass, konkret benannt</h4>' +
                '<p>Nicht geraten, sondern aus Ihren Antworten abgeleitet.</p>' +
              '</div>' +
            '</div>' +
            '<div class="benefit-item">' +
              '<div class="benefit-check">' + checkSvg + '</div>' +
              '<div class="benefit-text">' +
                '<h4>Ein n\u00E4chster Schritt, der passt</h4>' +
                '<p>Zu Ihrer Situation, nicht von der Stange.</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<button class="btn-primary btn-large landing-cta">Jetzt Digital-Check starten <span class="btn-arrow">&rarr;</span></button>' +
        '</div>' +
      '</div>';

    el.innerHTML = hero + cards + stages + preview;

    // Bind all CTA buttons
    var ctas = el.querySelectorAll('.landing-cta');
    for (var i = 0; i < ctas.length; i++) {
      ctas[i].addEventListener('click', function () {
        track('ev_quiz_cta_click');
        openContactModal();
      });
    }
  }

  // ─── CONTACT MODAL ─────────────────────────────────────────────
  var $modalBackdrop = document.getElementById('quiz-modal-backdrop');

  function openContactModal() {
    $modalBackdrop.innerHTML =
      '<div class="quiz-modal">' +
        '<button class="quiz-modal-close" aria-label="Schließen">&times;</button>' +
        '<h2>Wohin d\u00FCrfen wir Ihre Auswertung senden?</h2>' +
        '<p class="quiz-subtitle">Sie erhalten Ihr pers\u00F6nliches Digitalisierungs-Profil direkt im Anschluss und per E-Mail zum Nachschlagen.</p>' +
        '<div class="form-fields">' +
          '<label for="input-name" class="sr-only">Ihr Name</label>' +
          '<input type="text" class="quiz-input" id="input-name" placeholder="Ihr Name" value="' + escHtml(state.name) + '">' +
          '<label for="input-email" class="sr-only">Ihre E-Mail-Adresse</label>' +
          '<input type="email" class="quiz-input" id="input-email" placeholder="Ihre E-Mail-Adresse" value="' + escHtml(state.email) + '">' +
          '<label class="consent-label"><input type="checkbox" id="input-consent"' + (state.consent ? ' checked' : '') + '> Ich stimme zu, dass meine Daten zur Auswertung des Digital-Checks und zur Kontaktaufnahme verarbeitet werden. <a href="/datenschutz/" target="_blank">Datenschutz</a></label>' +
          '<button class="btn-primary" id="contact-submit" disabled>Quiz starten &rarr;</button>' +
        '</div>' +
        '<div class="quiz-hint" style="text-align:center">Kein Spam. Wir respektieren Ihre Daten.</div>' +
      '</div>';

    $modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    var nameInput = document.getElementById('input-name');
    var emailInput = document.getElementById('input-email');
    var consentInput = document.getElementById('input-consent');
    var submitBtn = document.getElementById('contact-submit');

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

    // Submit
    submitBtn.addEventListener('click', function () {
      track('ev_quiz_contact_submit');
      submitContact().catch(showSubmissionError);
      _contactSubmitting = true; // suppress the /quiz/ redirect on close
      closeContactModal();
      track('ev_quiz_start');
      transition(function () { state.phase = 'quiz'; state.currentQ = 0; });
    });

    // Close on backdrop click
    $modalBackdrop.addEventListener('click', function (e) {
      if (e.target === $modalBackdrop) closeContactModal();
    });

    // Close button
    $modalBackdrop.querySelector('.quiz-modal-close').addEventListener('click', closeContactModal);

    // Escape key
    document.addEventListener('keydown', handleModalEsc);

    // Focus the name input
    setTimeout(function () { nameInput.focus(); }, 100);
  }

  function closeContactModal() {
    $modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleModalEsc);
    // If user dismissed the modal without submitting (still on #contact,
    // transition to 'quiz' phase is NOT about to run), they'd be left staring
    // at an empty /quiz/check/ page. Send them back to the landing.
    // _contactSubmitting is set by the submit click handler to suppress this.
    if (IS_CHECK_PAGE && state.phase === 'contact' && !_contactSubmitting) {
      window.location.href = '/quiz/';
    }
    _contactSubmitting = false;
  }
  var _contactSubmitting = false;

  function handleModalEsc(e) {
    if (e.key === 'Escape') closeContactModal();
  }

  // /quiz/check/#contact renders the contact modal over an empty page.
  function renderContact() {
    openContactModal();
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
        track('ev_quiz_answer', {
          quiz_question_id: 'scored_' + state.currentQ,
          quiz_question_type: 'scored',
          quiz_answer_index: idx
        });
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
            track('ev_quiz_section_complete', { quiz_section: 'scored' });
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
        track('ev_quiz_answer', {
          quiz_question_id: 'qual_' + state.currentQ,
          quiz_question_type: 'qual',
          quiz_answer_index: idx
        });
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
            track('ev_quiz_section_complete', { quiz_section: 'qual' });
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
          '<p class="quiz-subtitle">Optional. Alles, was uns hilft, Ihre Auswertung relevanter zu machen.</p>' +
          '<label for="freetext-input" class="sr-only">Ihre Gedanken</label>' +
          '<textarea class="quiz-textarea" id="freetext-input" rows="4" placeholder="Ihre Gedanken...">' + escHtml(state.freetext) + '</textarea>' +
          '<button class="btn-primary" id="freetext-submit">Auswertung anzeigen &rarr;</button>' +
          '<button class="btn-back" id="freetext-back">&larr; Zurück</button>' +
        '</div>' +
      '</div>';

    $('#freetext-input', el).addEventListener('input', function (e) { state.freetext = e.target.value; });
    $('#freetext-submit', el).addEventListener('click', function () {
      // Compute once for analytics; submitResults() recomputes for HubSpot (cheap, avoids coupling)
      var _ds = scoreDimensions(state.scoredAnswers);
      var _bn = getBottleneckData(_ds);
      var _bnLabel = _bn.type === 'equal' ? _bn.title : _bn.type === 'cluster' ? _bn.label : _bn.type === 'single' ? _bn.title : _bn.weakDims.map(function (i) { return DIM_SHORT[i]; }).join(', ');
      var _routingIdx = state.qualAnswers[3] !== undefined ? state.qualAnswers[3] : 3;
      track('ev_quiz_complete', {
        quiz_score_total: _ds.reduce(function (a, b) { return a + b; }, 0),
        quiz_bottleneck: _bnLabel,
        quiz_routing: ROUTING[_routingIdx].label
      });
      submitResults().catch(showSubmissionError);
      // Navigate to the canonical results URL. Fire-and-forget HubSpot POST
      // above continues through navigation. On reload, SHARED_SCORES kicks in.
      window.location.href = '/quiz/check/?s=' + _ds.join('');
    });
    $('#freetext-back', el).addEventListener('click', function () {
      transition(function () { state.phase = 'qual'; state.currentQ = QUAL_QUESTIONS.length - 1; });
    });
  }

  // ─── RESULTS ROADMAP (bridge between Engpass and Next Step) ────
  function renderResultsRoadmap(overallStage) {
    var items = '';
    for (var i = 0; i < STAGES.length; i++) {
      var stateClass;
      if (i < overallStage) stateClass = 'level-past';
      else if (i === overallStage) stateClass = 'level-current';
      else if (i === overallStage + 1) stateClass = 'level-next';
      else stateClass = 'level-future';
      items +=
        '<div class="level-item ' + stateClass + '">' +
          '<div class="level-dot"' + (i === overallStage ? ' style="background:' + STAGES[i].color + ';color:#fff"' : '') + '>' + (i + 1) + '</div>' +
          '<div class="level-label">Level ' + (i + 1) + '</div>' +
          '<div class="level-name">' + STAGES[i].label + '</div>' +
          '<div class="level-quote">\u201E' + STAGES[i].tagline + '\u201C</div>' +
        '</div>';
    }
    var noteHtml = '';
    if (overallStage >= 3) {
      noteHtml = '<p class="results-roadmap-note">Sie haben das h\u00F6chste Level erreicht. Jetzt geht es darum, diesen Vorsprung systematisch auszubauen.</p>';
    }
    var bridgeText = overallStage >= 3
      ? 'Sie sind am Ziel. Jetzt geht es darum, dort zu bleiben.'
      : 'Die gute Nachricht: Genau hier liegt Ihr gr\u00F6\u00DFter Hebel.';
    return '<div class="results-roadmap-wrap">' +
      '<p class="section-bridge">' + bridgeText + '</p>' +
      '<div class="levels-roadmap">' + items + '</div>' +
      noteHtml +
    '</div>';
  }

  // ─── RESULTS ────────────────────────────────────────────────────
  function renderResults(sharedDimScores) {
    var dimScores = sharedDimScores || scoreDimensions(state.scoredAnswers);
    var overallStage = getOverallStage(dimScores);
    var dimStages = dimScores.map(dimToStage);
    var stageData = STAGES[overallStage];
    var bn = getBottleneckData(dimScores);

    // Stage gauge bars
    var gaugeBars = STAGES.map(function (st, i) {
      return '<div class="gauge-bar' + (i <= overallStage ? ' active' : '') + (i === overallStage ? ' current' : '') + '" style="background:' + (i <= overallStage ? st.color : 'rgba(0,0,0,0.06)') + '"></div>';
    }).join('');

    // v2: Personalized level summary (full sentences, no verb templating)
    var summaryHtml = '';
    if (bn.type === 'equal') {
      summaryHtml = '<p class="stage-desc">Alle f\u00FCnf Dimensionen liegen auf einem vergleichbaren Niveau. ' +
        (overallStage === 0 ? 'Sie stehen am Anfang. Ohne Altlasten k\u00F6nnen Sie von Grund auf richtig aufbauen.' :
         overallStage <= 1 ? 'Sie haben erste Schritte gemacht. Jetzt geht es darum, einen Bereich konsequent durchzuziehen.' :
         overallStage <= 2 ? 'Sie haben eine solide Grundlage geschaffen: Prozesse sind standardisiert, Systeme verbunden, Ihr Team ist kompetent und die F\u00FChrung treibt das Thema aktiv. Jetzt geht es darum, die n\u00E4chste Stufe zu erreichen.' :
         'Sie geh\u00F6ren zu den am weitesten digitalisierten KMU. Kontinuierliche Optimierung und strategische Skalierung sind Ihre n\u00E4chsten Themen.') +
        '</p>';
    } else {
      // Build Stark + Im Mittelfeld + Engpass summary
      var trulyStrong = bn.strongDims.filter(function (i) { return dimStages[i] >= 2; });
      var midfield = bn.strongDims.filter(function (i) { return dimStages[i] < 2; });
      var sortedStrong = trulyStrong.slice().sort(function (a, b) { return dimStages[b] - dimStages[a]; });
      var starkListItems = sortedStrong.map(function (i) {
        return '<li><strong>' + DIM_SHORT[i] + ':</strong> ' + DIM_STAGE_TEXTS[i][dimStages[i]] + '</li>';
      }).join('');
      var midfieldListItems = midfield.map(function (i) {
        return '<li><strong>' + DIM_SHORT[i] + ':</strong> ' + DIM_STAGE_TEXTS[i][dimStages[i]] + '</li>';
      }).join('');
      var engpassListItems = bn.weakDims.map(function (i) {
        return '<li><strong>' + DIM_SHORT[i] + ':</strong> ' + DIM_STAGE_TEXTS[i][dimStages[i]] + '</li>';
      }).join('');
      summaryHtml =
        '<div class="level-summary">' +
          (starkListItems ? '<p class="level-summary-strong"><strong>Stark:</strong></p><ul class="level-summary-list">' + starkListItems + '</ul>' : '') +
          (midfieldListItems ? '<p class="level-summary-mid"><strong>Im Mittelfeld:</strong></p><ul class="level-summary-list">' + midfieldListItems + '</ul>' : '') +
          '<p class="level-summary-weak"><strong>Engpass:</strong></p><ul class="level-summary-list">' + engpassListItems + '</ul>' +
          '<p class="level-summary-note">Ihre Geschwindigkeit wird von den schw\u00E4chsten Dimensionen bestimmt.' +
            (bn.strongDims.length > 0 ? ' Solange die operative Basis nicht steht, k\u00F6nnen Ihre St\u00E4rken ihr Potenzial nicht entfalten.' : '') +
          '</p>' +
        '</div>';
    }

    // Dimension breakdown — highlight ALL bottleneck dimensions
    var dimBreakdown = DIMENSIONS.map(function (d, i) {
      var isWeak = bn.weakDims.indexOf(i) !== -1 && bn.type !== 'equal';
      return '<div class="dim-card' + (isWeak ? ' dim-bottleneck' : '') + (i === 4 ? ' dim-full' : '') + '">' +
        '<div class="dim-label">' + escHtml(d) + '</div>' +
        '<div class="dim-stage" style="color:' + STAGES[dimStages[i]].textColor + '">Level ' + (dimStages[i] + 1) + ': ' + STAGES[dimStages[i]].label + '</div>' +
      '</div>';
    }).join('');

    // v2: Bottleneck reveal — multi-scenario with emotional lead-in
    var bottleneckHtml = '';
    if (bn.type === 'equal') {
      bottleneckHtml =
        '<div class="bottleneck-eyebrow">&#x26A1; Ihr Aha-Moment</div>' +
        '<h3 class="bottleneck-title">' + escHtml(bn.title) + '</h3>' +
        '<p class="bottleneck-text">' + escHtml(bn.text) + '</p>';
    } else if (bn.type === 'single') {
      bottleneckHtml =
        '<div class="bottleneck-eyebrow">&#x26A1; Ihr Engpass</div>' +
        '<p class="bottleneck-leadin">Hier bremst sich Ihr Unternehmen selbst aus:</p>' +
        '<h3 class="bottleneck-title">' + escHtml(bn.title) + '</h3>' +
        '<p class="bottleneck-text">' + escHtml(bn.text) + '</p>';
    } else if (bn.type === 'cluster') {
      bottleneckHtml =
        '<div class="bottleneck-eyebrow">&#x26A1; Ihr Engpass</div>' +
        '<p class="bottleneck-leadin">Hier bremst sich Ihr Unternehmen selbst aus:</p>' +
        '<h3 class="bottleneck-title">' + escHtml(bn.label) + '</h3>' +
        '<p class="bottleneck-text">' + escHtml(bn.text) + '</p>';
    } else {
      // multi: 3+ weak dimensions
      var introText = '';
      if (bn.strongDims.length === 2) {
        introText = 'Ihre St\u00E4rke liegt in ' + DIM_SHORT[bn.strongDims[0]] + ' und ' + DIM_SHORT[bn.strongDims[1]] + ', doch ' + bn.weakDims.length + ' Bereiche hinken deutlich hinterher.';
      } else if (bn.strongDims.length === 1) {
        introText = DIM_SHORT[bn.strongDims[0]] + ' ist Ihr Anker, doch ' + bn.weakDims.length + ' von f\u00FCnf Dimensionen brauchen Aufmerksamkeit.';
      } else {
        introText = 'Diese Bereiche bilden gemeinsam Ihren Engpass. Solange sie nicht aufholen, k\u00F6nnen Ihre St\u00E4rken ihr Potenzial nicht entfalten.';
      }
      var multiDimList = bn.weakDims.map(function (wi) {
        return '<li>' + DIM_STAGE_TEXTS[wi][bn.minStage] + '</li>';
      }).join('');
      var multiTitle = bn.weakDims.map(function (wi) { return DIM_SHORT[wi]; }).join(', ');
      bottleneckHtml =
        '<div class="bottleneck-eyebrow">&#x26A1; Ihr Engpass</div>' +
        '<p class="bottleneck-leadin">Hier bremst sich Ihr Unternehmen selbst aus:</p>' +
        '<h3 class="bottleneck-title">' + escHtml(multiTitle) + '</h3>' +
        '<p class="bottleneck-text">' + introText + '</p>' +
        '<ul class="bottleneck-dim-list">' + multiDimList + '</ul>' +
        '<p class="bottleneck-closing">Das sind die Bereiche, die Sie heute Zeit und Energie kosten.</p>';
    }

    // v2: Next steps — outcome + dream outcome + soft CTA
    var nextStepsHtml = '';
    var dreamHtml = '';
    // Dynamic dream lead-in
    var dreamLeadin;
    if (overallStage < 3) {
      dreamLeadin = 'Das wird bei Level ' + (overallStage + 2) + ', ' + STAGES[overallStage + 1].label + ', m\u00F6glich:';
    } else {
      dreamLeadin = 'Das sichern Sie sich, wenn Sie Ihren Vorsprung ausbauen:';
    }

    if (bn.type === 'equal') {
      var equalNextText;
      var equalDreamText;
      if (overallStage === 0) {
        equalNextText = 'Der wichtigste n\u00E4chste Schritt ist, einen klaren Startpunkt zu setzen. Ohne Altlasten haben Sie die Chance, von Anfang an die richtigen Grundlagen zu legen.';
        equalDreamText = 'Statt \u00FCberall gleichzeitig anzufangen, haben Sie einen klaren Plan: welcher Bereich zuerst, was es bringt, und wie Sie Schritt f\u00FCr Schritt vorankommen.';
      } else if (overallStage <= 2) {
        equalNextText = 'Der wichtigste n\u00E4chste Schritt ist, von Einzell\u00F6sungen zu einem vernetzten System zu kommen. Die Grundlagen stehen. Jetzt geht es darum, sie zusammenzuf\u00FChren.';
        equalDreamText = 'Ihre Systeme, Prozesse und Daten greifen ineinander. Kein Flickwerk mehr, sondern ein Unternehmen, das als Ganzes funktioniert.';
      } else {
        equalNextText = 'Der wichtigste n\u00E4chste Schritt ist, die Optimierung zu systematisieren. Sie sind weiter als die meisten. Jetzt geht es darum, diesen Vorsprung zu halten.';
        equalDreamText = 'Ihr Unternehmen verbessert sich kontinuierlich, nicht durch gro\u00DFe Projekte, sondern durch eingespielte Routinen, die Effizienz zur Gewohnheit machen.';
      }
      nextStepsHtml = '<p class="next-step-text">' + equalNextText + '</p>';
      dreamHtml = '<p class="next-step-dream-leadin">' + dreamLeadin + '</p><p class="next-step-dream">' + equalDreamText + '</p>';
    } else if (bn.weakDims.length === 1) {
      nextStepsHtml = '<p class="next-step-text">Der wichtigste n\u00E4chste Schritt: ' + OUTCOME_TEXTS[bn.weakDims[0]] + '</p>';
      dreamHtml = '<p class="next-step-dream-leadin">' + dreamLeadin + '</p><p class="next-step-dream">' + OUTCOME_DREAMS[bn.weakDims[0]] + '</p>';
    } else {
      var outcomeItems = bn.weakDims.map(function (wi) {
        return '<li>' + OUTCOME_TEXTS[wi] + '</li>';
      }).join('');
      nextStepsHtml =
        '<p class="next-step-intro">' + bn.weakDims.length + ' Bereiche brauchen Aufmerksamkeit. Das k\u00F6nnen Sie konkret tun:</p>' +
        '<ol class="next-step-list">' + outcomeItems + '</ol>';
      dreamHtml = '<p class="next-step-dream-leadin">' + dreamLeadin + '</p><p class="next-step-dream">' + OUTCOME_DREAMS[bn.weakDims[0]] + '</p>';
    }

    // Warm intro text
    var introName = state.name ? escHtml(state.name) + ', hier' : 'Hier';

    var el = $('[data-phase="results"]');
    el.innerHTML =
      '<div class="quiz-container">' +

        // Stage gauge card with warm intro + personalized summary
        '<div class="quiz-card">' +
          '<div class="quiz-eyebrow" style="margin-bottom:8px">Ihr Digitalisierungs-Profil</div>' +
          '<p class="results-intro">' + introName + ' ist Ihre pers\u00F6nliche Auswertung, basierend auf Ihren Antworten \u00FCber alle f\u00FCnf Dimensionen.</p>' +
          '<div style="text-align:center;margin:28px 0">' +
            '<div class="gauge-bars">' + gaugeBars + '</div>' +
            '<div class="stage-label" style="color:' + stageData.textColor + '">Level ' + (overallStage + 1) + ': ' + stageData.label + '</div>' +
            '<div class="stage-tagline">\u201E' + escHtml(stageData.tagline) + '\u201C</div>' +
          '</div>' +
          summaryHtml +
        '</div>' +

        // Shared view: first "selbst machen" CTA after summary
        (SHARED_SCORES ? '<div class="quiz-card shared-cta-card" style="margin-top:20px;text-align:center">' +
          '<p class="shared-cta-text">Wie digital ist Ihr Unternehmen?</p>' +
          '<a href="/quiz/" class="btn-primary btn-large" style="display:inline-flex;text-align:center;text-decoration:none">Jetzt selbst den Digital-Check machen</a>' +
        '</div>' : '') +

        // Radar chart card
        '<div class="quiz-card" style="margin-top:20px">' +
          '<h3 class="card-title" style="text-align:center">Ihr Dimensions-Profil</h3>' +
          '<p class="card-subtitle" style="text-align:center">Je weiter au\u00DFen, desto reifer die Dimension</p>' +
          '<div class="radar-wrap">' + renderRadarChart(dimScores, bn.type !== 'equal' ? bn.weakDims : []) + '</div>' +
          '<div class="dim-grid">' + dimBreakdown + '</div>' +
        '</div>' +

        // Bottleneck reveal card
        '<div class="quiz-card bottleneck-card" style="margin-top:20px">' +
          bottleneckHtml +
        '</div>' +

        // Levels roadmap bridge
        renderResultsRoadmap(overallStage) +

        // Next steps card with dream outcome + soft CTA
        '<div class="quiz-card" style="margin-top:20px">' +
          '<h3 class="card-title">Ihr n\u00E4chster Schritt</h3>' +
          '<p class="next-step-leadin">' + (overallStage < 3 ? 'So erreichen Sie Level ' + (overallStage + 2) + ': ' + STAGES[overallStage + 1].label : 'So sichern Sie Ihren Vorsprung') + '</p>' +
          nextStepsHtml +
          dreamHtml +
          '<div class="next-step-cta-wrap">' +
            '<h4 class="next-step-cta-headline">Lassen Sie uns gemeinsam draufschauen</h4>' +
            '<p class="next-step-cta-text">In einem kostenlosen 30-Minuten-Gespr\u00E4ch schauen wir gemeinsam auf Ihr Ergebnis, identifizieren den gr\u00F6\u00DFten Hebel und skizzieren die ersten konkreten Schritte. Unverbindlich und auf den Punkt.</p>' +
            '<a href="https://meetings-eu1.hubspot.com/tommi-enenkel/meeting" target="_blank" rel="noopener" class="' + (SHARED_SCORES ? 'btn-outline' : 'btn-primary') + ' btn-large" style="display:block;text-align:center;text-decoration:none">Kostenloses Erstgespr\u00E4ch buchen</a>' +
            '<div class="quiz-hint" style="text-align:center;margin-top:8px">30 Minuten, unverbindlich. Ihre Fragen, konkrete Antworten.</div>' +
          '</div>' +
          // Shared view: second "selbst machen" CTA after next steps
          (SHARED_SCORES ? '<div style="text-align:center;margin-top:20px">' +
            '<a href="/quiz/" class="btn-primary btn-large" style="display:inline-flex;text-align:center;text-decoration:none">Jetzt selbst den Digital-Check machen</a>' +
          '</div>' : '') +
        '</div>' +

        // Debug section
        (DEBUG ? renderDebug(dimScores, dimStages, overallStage, bn) : '') +

        // Restart link
        // Footer: share link + restart
        '<div style="text-align:center;margin:40px 0 20px">' +
          (!SHARED_SCORES ? '<button class="results-share" style="background:none;border:none;cursor:pointer;font-family:var(--font-body);font-size:14px;color:var(--color-subtle);text-decoration:underline;margin-right:16px">Link teilen</button>' : '') +
          '<button class="results-restart" style="background:none;border:none;cursor:pointer;font-family:var(--font-body);font-size:14px;color:var(--color-subtle);text-decoration:underline">' + (SHARED_SCORES ? 'Selbst den Check machen' : 'Nochmal machen') + '</button>' +
        '</div>' +
      '</div>';

    // Meeting booking CTA — track before the new tab opens
    var bookBtns = el.querySelectorAll('a[href*="meetings-eu1.hubspot.com"]');
    for (var bi = 0; bi < bookBtns.length; bi++) {
      bookBtns[bi].addEventListener('click', function () {
        track('ev_quiz_book_meeting');
      });
    }

    // Share link button
    var shareBtn = el.querySelector('.results-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        track('ev_quiz_share');
        var shareUrl = window.location.origin + '/quiz/check/?s=' + dimScores.join('');
        navigator.clipboard.writeText(shareUrl).then(function () {
          shareBtn.textContent = 'Link kopiert!';
          setTimeout(function () { shareBtn.textContent = 'Link teilen'; }, 2000);
        });
      });
    }

    el.querySelector('.results-restart').addEventListener('click', function () {
      track('ev_quiz_restart');
      clearState();
      // Back to the landing page. User can start fresh from there.
      window.location.href = '/quiz/';
    });
  }

  // ─── PROGRESS BAR ──────────────────────────────────────────────
  function renderProgressBar(current) {
    var pct = ((current + 1) / totalQ) * 100;
    return '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  }

  // ─── DEBUG SECTION ──────────────────────────────────────────────
  function renderDebug(dimScores, dimStages, overallStage, bn) {
    var maxStage = Math.max.apply(null, dimStages);
    var minStage = Math.min.apply(null, dimStages);

    // Raw scores table
    var scoreRows = DIMENSIONS.map(function (d, i) {
      var isWeak = bn.weakDims.indexOf(i) !== -1 && bn.type !== 'equal';
      return '<tr' + (isWeak ? ' style="background:rgba(196,85,58,0.08)"' : '') + '><td class="debug-td">' + escHtml(d) + (isWeak ? ' &#x26A0;' : '') + '</td><td class="debug-td" style="font-weight:700">' + dimScores[i] + '</td><td class="debug-td">' + (dimStages[i] + 1) + '</td><td class="debug-td">' + STAGES[dimStages[i]].label + '</td></tr>';
    }).join('');
    scoreRows += '<tr style="border-top:2px solid rgba(0,0,0,0.06)"><td class="debug-td" style="font-weight:700">Gesamt (Minimum)</td><td class="debug-td" style="font-weight:700">' + dimScores.reduce(function (a, b) { return a + b; }, 0) + ' / 30</td><td class="debug-td" style="font-weight:700">' + (overallStage + 1) + '</td><td class="debug-td" style="font-weight:700">' + STAGES[overallStage].label + '</td></tr>';

    // Bottleneck scenario info
    var scenarioLabel = bn.type === 'equal' ? 'C (Keine Diskrepanz)' : bn.type === 'single' ? 'A (Einzelner Engpass)' : bn.type === 'cluster' ? 'B (2 Engp\u00E4sse, Cluster)' : 'B2 (3+ Engp\u00E4sse)';
    var scenarioHtml =
      '<div class="debug-variant active">' +
        '<div class="debug-variant-badges"><span class="debug-badge green">ACTIVE</span></div>' +
        '<div class="debug-variant-title">Szenario ' + scenarioLabel + '</div>' +
        '<div class="debug-dims">Schwache Dims: ' + (bn.weakDims.length > 0 ? bn.weakDims.map(function (i) { return DIM_SHORT[i] + ' (L' + (dimStages[i] + 1) + ')'; }).join(', ') : 'keine') + '</div>' +
        '<div class="debug-dims">Starke Dims: ' + (bn.strongDims.length > 0 ? bn.strongDims.map(function (i) { return DIM_SHORT[i] + ' (L' + (dimStages[i] + 1) + ')'; }).join(', ') : 'keine') + '</div>' +
        (bn.type === 'single' ? '<div class="debug-variant-text">Discrepancy-Key: ' + (bn.highDim !== undefined ? bn.highDim + 'h-' + bn.lowDim + 'l' : 'n/a') + ' &rarr; ' + escHtml(bn.title) + '</div>' : '') +
        (bn.type === 'cluster' ? '<div class="debug-variant-text">Cluster-Key: ' + bn.weakDims.join('-') + ' &rarr; ' + escHtml(bn.label) + '</div>' : '') +
        (bn.type === 'equal' ? '<div class="debug-variant-text">Fallback: ' + escHtml(bn.title) + '</div>' : '') +
      '</div>';

    // All discrepancy texts reference
    var discRows = Object.keys(DISCREPANCY_TEXTS).map(function (key) {
      var val = DISCREPANCY_TEXTS[key];
      var parts = key.split('-');
      var highIdx = parseInt(parts[0]);
      var lowIdx = parseInt(parts[1].replace('l', ''));
      var highStage = dimStages[highIdx];
      var lowStage = dimStages[lowIdx];
      var discrepancy = highStage - lowStage;
      var isActive = bn.type === 'single' && bn.title === val.title;
      return '<div class="debug-variant' + (isActive ? ' active' : '') + '">' +
        '<div class="debug-variant-badges">' +
          '<span class="debug-badge' + (discrepancy > 0 ? ' green' : '') + '">&Delta;' + discrepancy + '</span>' +
          (isActive ? '<span class="debug-badge orange">&#x2605; Active</span>' : '') +
          '<span class="debug-key">' + key + '</span>' +
        '</div>' +
        '<div class="debug-dims">' + escHtml(DIMENSIONS[highIdx]) + ' (L' + (highStage + 1) + ') &uarr; &times; ' + escHtml(DIMENSIONS[lowIdx]) + ' (L' + (lowStage + 1) + ') &darr;</div>' +
        '<div class="debug-variant-title">' + escHtml(val.title) + '</div>' +
      '</div>';
    }).join('');

    // Cluster texts reference
    var clusterRows = Object.keys(CLUSTER_TEXTS).map(function (key) {
      var val = CLUSTER_TEXTS[key];
      var isActive = bn.type === 'cluster' && bn.label === val.label;
      return '<div class="debug-variant' + (isActive ? ' active' : '') + '">' +
        '<div class="debug-variant-badges">' +
          (isActive ? '<span class="debug-badge orange">&#x2605; Active</span>' : '<span class="debug-badge">&#x2014;</span>') +
          '<span class="debug-key">' + key + '</span>' +
        '</div>' +
        '<div class="debug-variant-title">' + escHtml(val.label) + '</div>' +
        '<div class="debug-variant-text">' + escHtml(val.text) + '</div>' +
      '</div>';
    }).join('');

    // Outcome texts
    var outcomeRows = OUTCOME_TEXTS.map(function (text, i) {
      var isActive = bn.weakDims.indexOf(i) !== -1 && bn.type !== 'equal';
      return '<div class="debug-variant' + (isActive ? ' active' : '') + '">' +
        '<div class="debug-variant-badges">' +
          '<span class="debug-badge' + (isActive ? ' green' : '') + '">' + (isActive ? 'ACTIVE' : '\u2014') + '</span>' +
          '<span class="debug-key">' + DIM_SHORT[i] + '</span>' +
        '</div>' +
        '<div class="debug-variant-text">' + escHtml(text) + '</div>' +
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
      '<div class="debug-header">&#x1F6E0; Debug Output v2 \u2014 Multi-Bottleneck</div>' +
      '<div class="debug-intro">Gesamtlevel = Minimum aller Dimensions-Stufen. Bottleneck-Szenario, Outcome-Routing und Offer-Mapping basierend auf schwachen Dimensionen.</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x1F4D0; Raw Scores</div>' +
        '<table class="debug-table"><thead><tr><th class="debug-th">Dimension</th><th class="debug-th">Score (0\u20136)</th><th class="debug-th">Stufe</th><th class="debug-th">Label</th></tr></thead><tbody>' + scoreRows + '</tbody></table>' +
        '<div class="debug-dims" style="margin-top:8px">Min: Stufe ' + (minStage + 1) + ' \u2014 Max: Stufe ' + (maxStage + 1) + ' \u2014 &Delta;' + (maxStage - minStage) + '</div>' +
      '</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x26A1; Bottleneck-Szenario</div>' +
        scenarioHtml +
      '</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x1F50D; Discrepancy-Texte (20 Paare)</div>' +
        discRows +
      '</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x1F517; Cluster-Texte (10 Zweier-Kombinationen)</div>' +
        clusterRows +
      '</div>' +

      '<div class="debug-card">' +
        '<div class="debug-card-title">&#x1F3AF; Outcome-Texte (Next Steps)</div>' +
        '<div class="debug-intro">Outcome-Texte f\u00FCr schwache Dimensionen. Priorit\u00E4t: Prozesse &gt; Tools &gt; Daten &gt; Team &gt; F\u00FChrung</div>' +
        outcomeRows +
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
  if (!IS_CHECK_PAGE) return; // defensive: quiz.js should only be loaded on /quiz/check/

  if (SHARED_SCORES) {
    state.phase = 'results';
    state.name = '';
    show('results');
    renderResults(SHARED_SCORES);
    return;
  }

  // Bare /quiz/check/ (no hash, no ?s=) is a confusing entry point — users land
  // on an empty page with just a modal. If the visitor has saved mid-quiz state,
  // restore the URL hash from it and continue. Otherwise bounce to the landing.
  if (!location.hash) {
    var savedBare = loadState();
    if (savedBare && savedBare.phase !== 'contact') {
      Object.assign(state, savedBare);
      history.replaceState(null, '', location.pathname + location.search + stateToHash());
      _lastSyncedHash = location.hash;
      render();
      return;
    }
    location.replace('/quiz/');
    return;
  }

  var saved = loadState();
  var hasHash = !!location.hash;

  if (hasHash) {
    // Explicit URL hash wins. Carry over saved answer data so refresh mid-quiz
    // restores previously-given answers, but respect the URL position.
    applyHash();
    _lastSyncedHash = location.hash;
    if (saved) {
      state.scoredAnswers = saved.scoredAnswers || {};
      state.qualAnswers = saved.qualAnswers || {};
      state.freetext = saved.freetext || '';
      state.name = saved.name || '';
      state.email = saved.email || '';
      state.consent = !!saved.consent;
    }
  } else if (saved && saved.phase === 'results') {
    // Completed quiz — restore results directly, no banner
    Object.assign(state, saved);
  } else if (saved && saved.phase !== 'contact') {
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
