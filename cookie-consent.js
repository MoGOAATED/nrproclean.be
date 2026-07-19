/* NR PROCLEAN — Consentement cookies (RGPD) + chargement conditionnel Google Analytics / Google Ads */
(function () {
  var CONSENT_KEY = 'nr_cookie_consent'; // 'all' | 'necessary'
  var GA_ID  = 'G-M0GP40T5SG';
  var ADS_ID = 'AW-18156226667';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }
  function isSubfolder() {
    return window.location.pathname.indexOf('/services/') !== -1 || window.location.pathname.indexOf('/zones/') !== -1;
  }
  function rootPath(p) { return (isSubfolder() ? '../' : '') + p; }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  var gtagLoaded = false;
  function loadGtag() {
    if (gtagLoaded) return;
    gtagLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ADS_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', ADS_ID);
    gtag('config', GA_ID);
  }

  if (getConsent() === 'all') loadGtag();

  /* Conserve le nom et la signature d'origine : appelé par le formulaire de contact existant */
  window.gtag_report_conversion = function (url) {
    var callback = function () {
      if (typeof url !== 'undefined') window.location = url;
    };
    if (getConsent() !== 'all') { callback(); return false; }
    gtag('event', 'conversion', {
      'send_to': 'AW-18156226667/vwf-CKezvKscEOuQyNFD',
      'value': 1.0,
      'currency': 'EUR',
      'event_callback': callback
    });
    return false;
  };

  function trackEvent(name, params) {
    if (getConsent() !== 'all') return;
    gtag('event', name, params || {});
  }

  /* Suivi conversion : clics tél / email / CTA devis, soumission formulaire */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) trackEvent('click_phone', { link: href });
    else if (href.indexOf('mailto:') === 0) trackEvent('click_email', { link: href });
    else if (a.classList.contains('nav-cta')) trackEvent('click_cta_devis', { link: href });
  });
  document.addEventListener('nr-form-submitted', function () { trackEvent('form_submit', {}); });

  /* ── Bannière cookies ── */
  var css = '.nr-cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;'
    + 'max-width:640px;margin:0 auto;background:#0C1220;border:1px solid rgba(255,255,255,0.12);'
    + 'border-radius:14px;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.45);'
    + 'font-family:"Onest",sans-serif;color:#fff;display:flex;flex-direction:column;gap:14px;}'
    + '.nr-cookie-text{font-size:13.5px;line-height:1.65;color:rgba(255,255,255,0.75);margin:0;}'
    + '.nr-cookie-text a{color:#00D4D8;text-decoration:underline;}'
    + '.nr-cookie-actions{display:flex;gap:10px;flex-wrap:wrap;}'
    + '.nr-cookie-btn{font-family:inherit;font-size:13.5px;font-weight:700;padding:10px 18px;border-radius:8px;'
    + 'cursor:pointer;border:1px solid rgba(255,255,255,0.16);background:transparent;color:#fff;'
    + 'transition:opacity 0.18s,transform 0.15s;}'
    + '.nr-cookie-btn:hover{opacity:0.85;}'
    + '.nr-cookie-btn:focus-visible{outline:2px solid #00D4D8;outline-offset:2px;}'
    + '.nr-cookie-accept{background:#00D4D8;color:#080D1A;border-color:transparent;}'
    + '@media(max-width:480px){.nr-cookie-banner{left:10px;right:10px;bottom:10px;padding:18px;}}';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var bannerEl = null;
  function showBanner() {
    if (bannerEl || getConsent()) return;
    bannerEl = document.createElement('div');
    bannerEl.className = 'nr-cookie-banner';
    bannerEl.setAttribute('role', 'dialog');
    bannerEl.setAttribute('aria-label', 'Préférences de cookies');
    bannerEl.innerHTML =
      '<p class="nr-cookie-text">Nous utilisons des cookies nécessaires au fonctionnement du site, et — avec votre accord — '
      + 'des cookies de mesure d’audience et de publicité (Google Analytics, Google Ads). '
      + '<a href="' + rootPath('politique-confidentialite.html') + '">En savoir plus</a>.</p>'
      + '<div class="nr-cookie-actions">'
      + '<button type="button" class="nr-cookie-btn nr-cookie-refuse">Refuser</button>'
      + '<button type="button" class="nr-cookie-btn nr-cookie-accept">Accepter tout</button>'
      + '</div>';
    document.body.appendChild(bannerEl);
    bannerEl.querySelector('.nr-cookie-accept').addEventListener('click', function () {
      setConsent('all'); loadGtag(); hideBanner();
    });
    bannerEl.querySelector('.nr-cookie-refuse').addEventListener('click', function () {
      setConsent('necessary'); hideBanner();
    });
  }
  function hideBanner() {
    if (bannerEl) { bannerEl.remove(); bannerEl = null; }
  }

  document.addEventListener('DOMContentLoaded', function () {
    showBanner();
    document.querySelectorAll('[data-cookie-manage]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        setConsent('');
        showBanner();
      });
    });
  });
})();
