/* ===== ESCAPE VELOCITY — CONSENT MODE v2 BRIDGE =====
 *
 * GTM container + Consent Mode v2 defaults are wired inline in base.njk <head>.
 * This file exposes window.updateConsent() so cookie-consent.js can propagate
 * user decisions (Alle akzeptieren / Nur notwendige / per-category toggles)
 * to Google's Consent Mode v2 API.
 *
 * Consent model — our 3 categories → Google Consent Mode v2 signals:
 *   necessary  → functionality_storage + security_storage  (always granted, in head)
 *   analytics  → analytics_storage
 *   marketing  → ad_storage + ad_user_data + ad_personalization
 *
 * Individual tags (GA4, LinkedIn, HubSpot, X) are configured in the GTM UI,
 * not in code. See website/docs/gtm-setup.md for the GTM container config.
 */

(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function updateConsent(consent) {
    gtag('consent', 'update', {
      ad_storage:         consent.marketing ? 'granted' : 'denied',
      ad_user_data:       consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
      analytics_storage:  consent.analytics ? 'granted' : 'denied'
    });
  }

  window.updateConsent = updateConsent;
  // Back-compat: any lingering loadTracking() call also routes through Consent Mode.
  window.loadTracking = updateConsent;
})();
