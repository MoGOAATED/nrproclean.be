window.__sharedLoaded = 'start';
(function () {
  'use strict';

  window.__sharedLoaded = 'loaded';
  var shared = window.NRTools = window.NRTools || {};

  function rootPrefix() {
    var p = window.location.pathname || '';
    var inSubfolder = p.indexOf('/services/') !== -1 || p.indexOf('/zones/') !== -1 || p.indexOf('/outils/') !== -1;
    return inSubfolder ? '../' : '';
  }

  function resolveConfigUrl(hostEl, fallbackPath) {
    if (hostEl && hostEl.getAttribute('data-config')) return hostEl.getAttribute('data-config');
    if (!fallbackPath) return '';
    if (fallbackPath.indexOf('http') === 0 || fallbackPath.indexOf('/') === 0) return fallbackPath;
    return rootPrefix() + fallbackPath;
  }

  var configCache = shared._configCache || {};

  function loadConfig(url) {
    if (!url) return Promise.reject(new Error('Aucune URL de configuration fournie'));
    if (configCache[url]) return Promise.resolve(configCache[url]);
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('Configuration indisponible (' + res.status + ')');
      return res.json();
    }).then(function (json) {
      configCache[url] = json;
      return json;
    });
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'class') node.className = attrs[key];
        else if (key === 'text') node.textContent = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    (children || []).forEach(function (child) { node.appendChild(child); });
    return node;
  }

  function track(name, params) {
    document.dispatchEvent(new CustomEvent('nr-tool-event', { detail: { name: name, params: params || {} } }));
  }

  function getQueryValue(name) {
    return new URLSearchParams(window.location.search || '').get(name);
  }

  function inferSectorFromLocation() {
    var path = window.location.pathname || '';
    var fileName = path.split('/').pop().replace(/\.html$/i, '');
    var known = {
      bureaux: 'bureaux',
      'cabinet-medical': 'cabinet-medical',
      coworking: 'coworking',
      hotelier: 'hotelier',
      magasins: 'magasins',
      pharmacies: 'pharmacies',
      industriel: 'industriel',
      vitres: 'autres',
      autres: 'autres',
      apres-travaux: 'autres'
    };
    return known[fileName] || null;
  }

  function readQuoteContext(hostEl) {
    var stored = null;
    try {
      stored = window.sessionStorage && window.sessionStorage.getItem('nr-quote-preload');
    } catch (error) {
      stored = null;
    }

    var parsed = stored ? JSON.parse(stored) : null;
    return {
      sector: (hostEl && hostEl.getAttribute('secteur')) || getQueryValue('secteur') || (parsed && parsed.secteur) || inferSectorFromLocation() || null,
      surface: (hostEl && hostEl.getAttribute('surface')) || getQueryValue('surface') || (parsed && parsed.surface) || null,
      frequence: (hostEl && hostEl.getAttribute('frequence')) || getQueryValue('frequence') || (parsed && parsed.frequence) || null,
      source: (parsed && parsed.source) || getQueryValue('source') || null,
      notes: (parsed && parsed.notes) || null
    };
  }

  function buildRequestId(state) {
    var seed = [state.secteur || 'n', state.surface || 'n', state.frequence || 'n', state.sites || 'n', state.coordonnees && state.coordonnees.nom ? state.coordonnees.nom : 'anon']
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 10);
    var stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return 'NR-' + stamp + '-' + seed + '-' + String(Math.floor(Math.random() * 900 + 100));
  }

  shared.rootPrefix = rootPrefix;
  shared.resolveConfigUrl = resolveConfigUrl;
  shared.loadConfig = loadConfig;
  shared.el = el;
  shared.track = track;
  shared.getQueryValue = getQueryValue;
  shared.readQuoteContext = readQuoteContext;
  shared.buildRequestId = buildRequestId;
  shared._configCache = configCache;
})();
