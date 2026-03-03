/* ===== ESCAPE VELOCITY — COOKIE CONSENT ===== */

(function () {
  'use strict';

  var STORAGE_KEY = 'ev_consent';
  var COOKIE_NAME = 'ev_consent_given';
  var CONSENT_LOG_URL = '/api/consent-log';

  // --- Helpers ---

  function getConsent() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(categories, action) {
    var consentId = getConsentId();
    var record = {
      necessary: true,
      analytics: !!categories.analytics,
      marketing: !!categories.marketing,
      timestamp: new Date().toISOString(),
      consentId: consentId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    setCookie(COOKIE_NAME, '1', 365);
    logConsent(action, record);
  }

  function getConsentId() {
    var existing = getConsent();
    if (existing && existing.consentId) return existing.consentId;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function logConsent(action, record) {
    try {
      fetch(CONSENT_LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          categories: {
            necessary: record.necessary,
            analytics: record.analytics,
            marketing: record.marketing,
          },
          timestamp: record.timestamp,
          consentId: record.consentId,
        }),
      }).catch(function () {});
    } catch (e) {
      // Fire-and-forget
    }
  }

  // --- UI ---

  function getBanner() {
    return document.getElementById('cookie-consent-banner');
  }

  function getSettings() {
    return document.getElementById('cookie-consent-settings');
  }

  function showBanner() {
    var el = getBanner();
    if (el) el.style.display = 'block';
  }

  function hideBanner() {
    var el = getBanner();
    if (el) el.style.display = 'none';
  }

  function showSettings() {
    var panel = getSettings();
    if (panel) panel.style.display = 'block';
    // Sync toggles: show saved state, or default all on for first visit
    var consent = getConsent();
    var ta = document.getElementById('cc-toggle-analytics');
    var tm = document.getElementById('cc-toggle-marketing');
    if (consent) {
      if (ta) ta.checked = consent.analytics;
      if (tm) tm.checked = consent.marketing;
    } else {
      if (ta) ta.checked = true;
      if (tm) tm.checked = true;
    }
  }

  function hideSettings() {
    var panel = getSettings();
    if (panel) panel.style.display = 'none';
  }

  // --- Actions ---

  function acceptAll() {
    var action = getConsent() ? 'update' : 'grant';
    saveConsent({ analytics: true, marketing: true }, action);
    hideBanner();
    hideSettings();
    loadTracking({ analytics: true, marketing: true });
  }

  function rejectOptional() {
    var action = getConsent() ? 'update' : 'grant';
    saveConsent({ analytics: false, marketing: false }, action);
    hideBanner();
    hideSettings();
  }

  function saveSelection() {
    var ta = document.getElementById('cc-toggle-analytics');
    var tm = document.getElementById('cc-toggle-marketing');
    var categories = {
      analytics: ta ? ta.checked : false,
      marketing: tm ? tm.checked : false,
    };
    var hadConsent = getConsent();
    var action = hadConsent ? 'update' : 'grant';
    saveConsent(categories, action);
    hideBanner();
    hideSettings();
    // Reload to ensure scripts are loaded/unloaded correctly
    if (hadConsent) {
      window.location.reload();
    } else {
      loadTracking(categories);
    }
  }

  // --- Global function for footer/datenschutz link ---

  window.openCookieSettings = function () {
    showBanner();
    showSettings();
  };

  // --- Init ---

  function initConsent() {
    var consent = getConsent();
    if (consent) {
      // Returning visitor — load scripts per consent, no banner
      loadTracking(consent);
    } else {
      // First visit — show banner
      showBanner();
    }

    // Wire up buttons
    var btnAccept = document.getElementById('cc-accept-all');
    var btnReject = document.getElementById('cc-reject');
    var btnToggle = document.getElementById('cc-toggle-settings');
    var btnSave = document.getElementById('cc-save-selection');

    if (btnAccept) btnAccept.addEventListener('click', acceptAll);
    if (btnReject) btnReject.addEventListener('click', rejectOptional);
    if (btnToggle)
      btnToggle.addEventListener('click', function (e) {
        e.preventDefault();
        var panel = getSettings();
        if (panel && panel.style.display === 'block') {
          hideSettings();
        } else {
          showSettings();
        }
      });
    if (btnSave) btnSave.addEventListener('click', saveSelection);
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsent);
  } else {
    initConsent();
  }
})();
