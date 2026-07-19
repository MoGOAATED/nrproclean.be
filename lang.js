(function () {
  'use strict';

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return document.querySelectorAll(sel); }

  // Inject shared CSS (mobile nav + floating call button)
  var style = document.createElement('style');
  style.textContent = [
    /* ─── Mobile nav (hamburger) ─── */
    '.nav-toggle{display:none;flex-direction:column;justify-content:center;align-items:center;gap:5px;',
    'width:38px;height:38px;border-radius:8px;border:1px solid rgba(255,255,255,0.14);',
    'background:rgba(255,255,255,0.05);cursor:pointer;flex-shrink:0;margin-left:8px;padding:0;}',
    '.nav-toggle:hover{background:rgba(255,255,255,0.1)}',
    '.nav-toggle:focus-visible{outline:2px solid #00D4D8;outline-offset:2px}',
    '.nav-toggle-bar{display:block;width:18px;height:2px;background:#fff;border-radius:2px;',
    'transition:transform 0.25s ease,opacity 0.2s ease}',
    '.nav-toggle.is-open .nav-toggle-bar:nth-child(1){transform:translateY(7px) rotate(45deg)}',
    '.nav-toggle.is-open .nav-toggle-bar:nth-child(2){opacity:0}',
    '.nav-toggle.is-open .nav-toggle-bar:nth-child(3){transform:translateY(-7px) rotate(-45deg)}',
    '@media(max-width:768px){',
      'nav{padding:0 16px !important}',
      '.nav-toggle{display:flex}',
      '.nav-links{display:flex !important;position:absolute;top:100%;left:0;right:0;',
      'flex-direction:column;align-items:stretch;gap:0;background:rgba(8,13,26,0.98);',
      'backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,0.08);',
      'max-height:0;overflow:hidden;opacity:0;padding:0 8px;',
      'transition:max-height 0.32s cubic-bezier(0.22,1,0.36,1),opacity 0.28s ease}',
      '.nav-links.mobile-open{max-height:70vh;opacity:1;overflow-y:auto;padding:8px}',
      '.nav-links>li{width:100%}',
      '.nav-links>li>a{width:100%;padding:14px 12px}',
      '.dropdown{position:static !important;opacity:1 !important;pointer-events:auto !important;',
      'transform:none !important;background:rgba(255,255,255,0.03) !important;box-shadow:none !important;',
      'border:none !important;padding-left:12px !important;display:none}',
      '.nav-services.dropdown-open .dropdown{display:block}',
    '}',
    /* ─── Bouton d'appel flottant (mobile) ─── */
    '.fab-call{display:none;position:fixed;right:16px;',
    'bottom:calc(16px + env(safe-area-inset-bottom));z-index:400;width:56px;height:56px;',
    'border-radius:50%;background:#00D4D8;align-items:center;justify-content:center;',
    'box-shadow:0 10px 28px rgba(0,0,0,0.35);text-decoration:none;',
    'transition:transform 0.18s,opacity 0.18s}',
    '.fab-call:hover{opacity:0.9;transform:translateY(-2px)}',
    '.fab-call:focus-visible{outline:2px solid #00D4D8;outline-offset:3px}',
    '.fab-call svg{width:24px;height:24px;stroke:#080D1A;fill:none;stroke-width:2.2}',
    '@media(max-width:768px){.fab-call{display:flex}}'
  ].join('');
  document.head.appendChild(style);

  // ─── MOBILE NAV (hamburger) ────────────────────────────────────────────
  function initMobileNav() {
    var nav = qs('nav');
    var links = qs('.nav-links');
    if (!nav || !links) return; // zones/*.html: no collapsible nav-links

    if (!links.id) links.id = 'primary-nav';
    if (!nav.hasAttribute('role')) nav.setAttribute('role', 'navigation');
    if (!nav.hasAttribute('aria-label')) nav.setAttribute('aria-label', 'Navigation principale');

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', links.id);
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    toggle.innerHTML = '<span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span>';
    nav.appendChild(toggle);

    function closeMenu() {
      links.classList.remove('mobile-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      qsa('.nav-services.dropdown-open').forEach(function (li) { li.classList.remove('dropdown-open'); });
    }
    function openMenu() {
      links.classList.add('mobile-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function () {
      if (links.classList.contains('mobile-open')) closeMenu(); else openMenu();
    });

    links.addEventListener('click', function (e) {
      var servicesLink = e.target.closest && e.target.closest('.nav-services > a');
      if (servicesLink && window.matchMedia('(max-width:768px)').matches) {
        e.preventDefault();
        servicesLink.parentElement.classList.toggle('dropdown-open');
        return;
      }
      var a = e.target.closest && e.target.closest('a');
      if (a) closeMenu();
    });

    document.addEventListener('click', function (e) {
      if (!links.classList.contains('mobile-open')) return;
      if (nav.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('mobile-open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initMobileNav);

  // ─── BOUTON D'APPEL FLOTTANT (mobile) ──────────────────────────────────
  function initFabCall() {
    if (qs('.fab-call')) return;
    var a = document.createElement('a');
    a.className = 'fab-call';
    a.href = 'tel:+32484442421';
    a.setAttribute('aria-label', 'Appeler NR PROCLEAN');
    a.innerHTML = '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    document.body.appendChild(a);
  }

  document.addEventListener('DOMContentLoaded', initFabCall);
})();
