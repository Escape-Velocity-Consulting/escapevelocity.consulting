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
  // IMPORTANT: Use the GLOBAL window.gtag defined inline in base.njk <head>.
  // A local gtag stub here would bypass any wrapping GTM adds later and result
  // in a raw dataLayer entry that the Consent API does NOT process as a state
  // change (symptom: "On-page update" stays empty in Tag Assistant even though
  // dataLayer shows the consent entry).
  function updateConsent(consent) {
    if (typeof window.gtag !== 'function') {
      // Fallback only if the head gtag stub somehow failed to define.
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
    window.gtag('consent', 'update', {
      ad_storage:         consent.marketing ? 'granted' : 'denied',
      ad_user_data:       consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
      analytics_storage:  consent.analytics ? 'granted' : 'denied'
    });
  }

  window.updateConsent = updateConsent;
})();
