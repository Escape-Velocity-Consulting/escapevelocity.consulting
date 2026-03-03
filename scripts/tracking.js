/* ===== ESCAPE VELOCITY — TRACKING LOADER ===== */
/* Scripts are loaded dynamically ONLY after consent. */

// Tracking IDs — replace with your actual IDs
const TRACKING = {
  GA_ID: 'G-XXXXXXXXXX',           // Google Analytics 4
  LINKEDIN_PARTNER_ID: '0000000',  // LinkedIn Insight Tag
  HUBSPOT_PORTAL_ID: '147929039',  // HubSpot Portal
};

// Guard flags against double-loading
const loaded = { ga: false, linkedin: false, hubspot: false };

function loadTracking(consent) {
  if (consent.analytics) loadGA();
  if (consent.marketing) {
    loadLinkedIn();
    loadHubSpot();
  }
}

function loadGA() {
  if (loaded.ga || TRACKING.GA_ID === 'G-XXXXXXXXXX') return;
  loaded.ga = true;

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + TRACKING.GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', TRACKING.GA_ID, { anonymize_ip: true });
}

function loadLinkedIn() {
  if (loaded.linkedin || TRACKING.LINKEDIN_PARTNER_ID === '0000000') return;
  loaded.linkedin = true;

  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(TRACKING.LINKEDIN_PARTNER_ID);

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  document.head.appendChild(s);
}

function loadHubSpot() {
  if (loaded.hubspot) return;
  loaded.hubspot = true;

  var s = document.createElement('script');
  s.async = true;
  s.defer = true;
  s.id = 'hs-script-loader';
  s.src = 'https://js-eu1.hs-scripts.com/' + TRACKING.HUBSPOT_PORTAL_ID + '.js';
  document.head.appendChild(s);
}
