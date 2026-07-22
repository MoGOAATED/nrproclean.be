/*
 * NR PROCLEAN — <nr-quote-configurator>
 *
 * Composant de devis intelligent multi-étapes. Il réutilise la logique et les
 * styles partagés existants et prépare les futurs intégrations CRM / espace
 * client / PDF sans les implémenter encore.
 */
(function () {
  'use strict';

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

  function loadJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('Configuration indisponible (' + res.status + ')');
      return res.json();
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

  function readQuoteContext(hostEl) {
    var stored = null;
    try { stored = window.sessionStorage && window.sessionStorage.getItem('nr-quote-preload'); } catch (error) {}
    var parsed = stored ? JSON.parse(stored) : null;
    return {
      sector: (hostEl && hostEl.getAttribute('secteur')) || (parsed && parsed.secteur) || null,
      surface: (hostEl && hostEl.getAttribute('surface')) || (parsed && parsed.surface) || null,
      frequence: (hostEl && hostEl.getAttribute('frequence')) || (parsed && parsed.frequence) || null,
      notes: (parsed && parsed.notes) || ''
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

  var STEP_DEFS = [
    { key: 'secteur', title: 'Secteur', description: 'Sélectionnez le type de site à nettoyer.' },
    { key: 'surface', title: 'Surface', description: 'Estimez la surface totale à entretenir.' },
    { key: 'frequence', title: 'Fréquence', description: 'Choisissez la cadence souhaitée.' },
    { key: 'sites', title: 'Nombre de sites', description: 'Précisez si une seule adresse ou plusieurs.' },
    { key: 'horaires', title: 'Horaires', description: 'Indiquez les plages de disponibilité.' },
    { key: 'prestations', title: 'Prestations', description: 'Sélectionnez les services attendus.' },
    { key: 'contraintes', title: 'Contraintes', description: 'Ajoutez les limites techniques ou logistiques.' },
    { key: 'coordonnees', title: 'Coordonnées', description: 'Renseignez votre nom, email et téléphone.' },
    { key: 'validation', title: 'Validation', description: 'Vérifiez le résumé et envoyez votre demande.' }
  ];

  function labelFor(config, group, key) {
    return (config[group] && config[group][key] && config[group][key].label) || key;
  }

  function formatPriceEstimate(range) {
    if (!range) return 'À déterminer';
    if (range.ponctuel) return 'Estimation sur mesure';
    return 'Entre ' + range.min + ' € et ' + range.max + ' € / mois';
  }

  function getRangeEstimate(pricingConfig, state) {
    if (!pricingConfig || !state || !state.secteur || !state.surface || !state.frequence) return null;
    var secteur = pricingConfig.secteurs[state.secteur];
    var surface = pricingConfig.surfaces[state.surface];
    var freq = pricingConfig.frequences[state.frequence];
    if (!secteur || !surface || !freq) return null;
    if (freq.ponctuel) return { ponctuel: true };
    var base = surface.base * secteur.coefficient * freq.coefficient;
    var marge = typeof pricingConfig.fourchette_marge === 'number' ? pricingConfig.fourchette_marge : 0.15;
    return {
      min: Math.round(base * (1 - marge) / 10) * 10,
      max: Math.round(base * (1 + marge) / 10) * 10
    };
  }

  function defineComponent() {
    class NrQuoteConfiguratorElement extends HTMLElement {
      connectedCallback() {
        if (this._initialized) return;
        this._initialized = true;

        var ctx = readQuoteContext(this);
        this._state = {
          secteur: ctx.sector || null,
          surface: ctx.surface || null,
          frequence: ctx.frequence || null,
          sites: '1',
          horaires: [],
          prestations: [],
          contraintes: [],
          contraintes_autre: '',
          coordonnees: { nom: '', email: '', telephone: '', message: '' },
          notes: ctx.notes || ''
        };
        this._stepIndex = 0;
        this._loading = true;
        this._config = null;
        this._lastRange = null;

        this._renderLoading();

        var self = this;
        var pricingUrl = resolveConfigUrl(this, 'assets/pricing-config.json');
        var specUrl = resolveConfigUrl(this, 'assets/cahier-des-charges-config.json');
        Promise.all([
          loadJson(pricingUrl),
          loadJson(specUrl)
        ]).then(function (results) {
          self._pricingConfig = results[0];
          self._specConfig = results[1];
          self._loading = false;
          self._renderStep();
          track('tool_quote_configurator_start', { secteur: self._state.secteur || 'non_precise' });
        }).catch(function (error) {
          console.error('[nr-quote-configurator] startup failed', error);
          self._loading = false;
          self._renderFallback();
        });
      }

      _renderLoading() {
        this.innerHTML = '';
        this.appendChild(el('div', { class: 'tool-card', 'aria-busy': 'true' }, [
          el('p', { class: 'tool-loading', text: 'Chargement du configurateur…' })
        ]));
      }

      _renderFallback() {
        this.innerHTML = '';
        this.appendChild(el('div', { class: 'tool-card' }, [
          el('p', { class: 'tool-fallback-text', text: 'Le configurateur est momentanément indisponible.' }),
          el('a', { class: 'tool-cta-secondary', href: rootPrefix() + 'index.html#contact', text: 'Demander un devis gratuit →' })
        ]));
      }

      _renderStep() {
        var self = this;
        if (!this._pricingConfig || !this._specConfig) return;
        var step = STEP_DEFS[this._stepIndex];
        this.innerHTML = '';

        var card = el('div', { class: 'tool-card' });
        card.appendChild(el('div', { class: 'tool-progress' }, [
          ...STEP_DEFS.map(function (item, index) {
            var cls = 'tool-progress-dot';
            if (index < self._stepIndex) cls += ' is-done';
            if (index === self._stepIndex) cls += ' is-current';
            return el('span', { class: cls });
          })
        ]));

        card.appendChild(el('span', { class: 'tool-step-eyebrow', text: 'Étape ' + (this._stepIndex + 1) + ' sur ' + STEP_DEFS.length }));
        card.appendChild(el('h3', { class: 'tool-title', text: step.title }));
        if (step.key === 'validation' && this._lastRange) {
          card.appendChild(el('p', { class: 'tool-result-price', text: formatPriceEstimate(this._lastRange) }));
        } else {
          card.appendChild(el('p', { class: 'tool-result-text', text: step.description }));
        }

        var body = el('div', { class: 'tool-step-body' });
        if (this._state.secteur && this._state.surface && this._state.frequence) {
          this._lastRange = getRangeEstimate(this._pricingConfig, this._state);
        }
        if (step.key === 'secteur') {
          body.appendChild(this._renderChoiceGroup(this._pricingConfig.secteurs, 'secteur'));
        } else if (step.key === 'surface') {
          body.appendChild(this._renderChoiceGroup(this._pricingConfig.surfaces, 'surface'));
        } else if (step.key === 'frequence') {
          body.appendChild(this._renderChoiceGroup(this._pricingConfig.frequences, 'frequence'));
        } else if (step.key === 'sites') {
          var sitesGroup = el('div', { class: 'tool-btn-group', role: 'group', 'aria-label': 'Nombre de sites' });
          ['1', '2', '3+'].forEach(function (value) {
            var btn = el('button', {
              type: 'button',
              class: 'tool-btn-select' + (self._state.sites === value ? ' is-active' : ''),
              'aria-pressed': self._state.sites === value ? 'true' : 'false',
              text: value === '3+' ? '3 sites ou plus' : value + ' site' + (value === '1' ? '' : 's')
            });
            btn.addEventListener('click', function () {
              self._state.sites = value;
              self._renderStep();
            });
            sitesGroup.appendChild(btn);
          });
          body.appendChild(sitesGroup);
        } else if (step.key === 'horaires') {
          body.appendChild(this._renderChecklist(this._specConfig.horaires, 'horaires'));
        } else if (step.key === 'prestations') {
          body.appendChild(this._renderChecklist(this._specConfig.prestations, 'prestations'));
        } else if (step.key === 'contraintes') {
          body.appendChild(this._renderChecklist(this._specConfig.contraintes, 'contraintes'));
          body.appendChild(this._renderTextArea('contraintes_autre', 'Autre contrainte à préciser (facultatif)'));
        } else if (step.key === 'coordonnees') {
          body.appendChild(this._renderContactForm());
        } else if (step.key === 'validation') {
          body.appendChild(this._renderSummary());
        }

        card.appendChild(body);

        var nav = el('div', { class: 'tool-step-nav' });
        if (step.key === 'validation' && this._lastRange) {
          body.appendChild(el('p', { class: 'tool-result-note', text: 'Cette estimation se met à jour automatiquement à chaque changement de secteur, surface ou fréquence.' }));
        }
        var prevBtn = el('button', { type: 'button', class: 'tool-btn-outline', text: '← Précédent' });
        prevBtn.disabled = this._stepIndex === 0;
        prevBtn.addEventListener('click', function () { self._stepIndex--; self._renderStep(); });
        nav.appendChild(prevBtn);

        var nextBtn = el('button', { type: 'button', class: 'tool-cta-primary', text: this._stepIndex === STEP_DEFS.length - 1 ? 'Envoyer la demande' : 'Suivant →' });
        if (step.key === 'coordonnees') {
          nextBtn.textContent = 'Voir le résumé';
        }
        nextBtn.addEventListener('click', function () {
          if (self._stepIndex === STEP_DEFS.length - 1) {
            self._submit();
          } else {
            self._stepIndex++; self._renderStep();
          }
        });
        nav.appendChild(nextBtn);
        card.appendChild(nav);

        this.appendChild(card);
      }

      _renderChoiceGroup(options, key) {
        var self = this;
        var group = el('div', { class: 'tool-btn-group', role: 'group', 'aria-label': key });
        Object.keys(options).forEach(function (itemKey) {
          var isActive = self._state[key] === itemKey;
          var btn = el('button', {
            type: 'button',
            class: 'tool-btn-select' + (isActive ? ' is-active' : ''),
            'aria-pressed': isActive ? 'true' : 'false',
            text: options[itemKey].label
          });
          btn.addEventListener('click', function () {
            self._state[key] = itemKey;
            self._renderStep();
          });
          group.appendChild(btn);
        });
        return group;
      }

      _renderChecklist(options, key) {
        var self = this;
        var group = el('div', { class: 'tool-checkbox-group' });
        Object.keys(options).forEach(function (itemKey) {
          var checked = self._state[key].indexOf(itemKey) !== -1;
          var label = el('label', { class: 'tool-checkbox-item' });
          var checkbox = el('input', { type: 'checkbox' });
          checkbox.checked = checked;
          checkbox.addEventListener('change', function () {
            var arr = self._state[key];
            var idx = arr.indexOf(itemKey);
            if (checkbox.checked && idx === -1) arr.push(itemKey);
            else if (!checkbox.checked && idx !== -1) arr.splice(idx, 1);
          });
          label.appendChild(checkbox);
          label.appendChild(el('span', { text: options[itemKey].label }));
          group.appendChild(label);
        });
        return group;
      }

      _renderTextArea(key, placeholder) {
        var self = this;
        var textarea = el('textarea', {
          class: 'tool-textarea',
          placeholder: placeholder,
          'aria-label': placeholder
        });
        textarea.value = this._state[key] || '';
        textarea.style.marginTop = '14px';
        textarea.addEventListener('input', function () {
          self._state[key] = textarea.value;
        });
        return textarea;
      }

      _renderContactForm() {
        var self = this;
        var form = el('div', { class: 'tool-lead-form' });
        var fields = [
          { key: 'nom', type: 'text', placeholder: 'Votre nom' },
          { key: 'email', type: 'email', placeholder: 'Votre email' },
          { key: 'telephone', type: 'tel', placeholder: 'Votre téléphone' }
        ];
        fields.forEach(function (field) {
          var input = el('input', {
            type: field.type,
            class: 'tool-input',
            placeholder: field.placeholder,
            'aria-label': field.placeholder
          });
          input.value = self._state.coordonnees[field.key] || '';
          input.addEventListener('input', function () {
            self._state.coordonnees[field.key] = input.value;
          });
          form.appendChild(input);
        });
        var notes = el('textarea', { class: 'tool-textarea', placeholder: 'Informations complémentaires (facultatif)', 'aria-label': 'Informations complémentaires (facultatif)' });
        notes.value = this._state.notes || '';
        notes.addEventListener('input', function () {
          self._state.notes = notes.value;
        });
        form.appendChild(notes);
        return form;
      }

      _renderSummary() {
        var s = this._state;
        var pricing = this._pricingConfig;
        var spec = this._specConfig;
        var range = null;
        if (s.secteur && s.surface && s.frequence) {
          var secteur = pricing.secteurs[s.secteur];
          var surface = pricing.surfaces[s.surface];
          var freq = pricing.frequences[s.frequence];
          if (secteur && surface && freq && !freq.ponctuel) {
            var base = surface.base * secteur.coefficient * freq.coefficient;
            var marge = typeof pricing.fourchette_marge === 'number' ? pricing.fourchette_marge : 0.15;
            range = {
              min: Math.round(base * (1 - marge) / 10) * 10,
              max: Math.round(base * (1 + marge) / 10) * 10
            };
          } else if (freq && freq.ponctuel) {
            range = { ponctuel: true };
          }
        }
        var summary = el('div', { class: 'tool-document' });
        if (this._lastRange) {
          summary.appendChild(el('p', { class: 'tool-result-price', text: formatPriceEstimate(this._lastRange) }));
        }
        summary.appendChild(el('h3', { text: 'Résumé de votre demande' }));
        summary.appendChild(el('dl', {}, [
          el('dt', { text: 'Secteur' }), el('dd', { text: labelFor(pricing, 'secteurs', s.secteur) || 'Non précisé' }),
          el('dt', { text: 'Surface' }), el('dd', { text: labelFor(pricing, 'surfaces', s.surface) || 'Non précisé' }),
          el('dt', { text: 'Fréquence' }), el('dd', { text: labelFor(pricing, 'frequences', s.frequence) || 'Non précisé' }),
          el('dt', { text: 'Nombre de sites' }), el('dd', { text: s.sites || '1' }),
          el('dt', { text: 'Estimation' }), el('dd', { text: formatPriceEstimate(range) })
        ]));
        summary.appendChild(el('h3', { text: 'Prestations et contraintes' }));
        var list = el('ul');
        var items = [];
        items = items.concat(s.horaires.map(function (item) { return labelFor(spec, 'horaires', item); }));
        items = items.concat(s.prestations.map(function (item) { return labelFor(spec, 'prestations', item); }));
        items = items.concat(s.contraintes.map(function (item) { return labelFor(spec, 'contraintes', item); }));
        if (s.contraintes_autre) items.push(s.contraintes_autre);
        if (items.length) items.forEach(function (item) { list.appendChild(el('li', { text: item })); }); else list.appendChild(el('li', { text: 'Aucune précision supplémentaire' }));
        summary.appendChild(list);
        return summary;
      }

      _submit() {
        var self = this;
        var s = this._state;
        var payload = {
          source: 'outil-configurateur-devis',
          identifiant: buildRequestId(s),
          secteur: this._pricingConfig.secteurs[s.secteur] ? this._pricingConfig.secteurs[s.secteur].label : s.secteur,
          surface: this._pricingConfig.surfaces[s.surface] ? this._pricingConfig.surfaces[s.surface].label : s.surface,
          frequence: this._pricingConfig.frequences[s.frequence] ? this._pricingConfig.frequences[s.frequence].label : s.frequence,
          sites: s.sites,
          horaires: s.horaires,
          prestations: s.prestations,
          contraintes: s.contraintes.concat(s.contraintes_autre ? [s.contraintes_autre] : []),
          coordonnees: s.coordonnees,
          notes: s.notes,
          resume: this._buildResume(),
          estimation: this._buildEstimate(),
          formulaire: this._buildFormPayload(),
          timestamp: new Date().toISOString()
        };

        this.innerHTML = '';
        this.appendChild(el('div', { class: 'tool-card' }, [
          el('p', { class: 'tool-success', text: 'Demande prête à être envoyée.' }),
          el('p', { class: 'tool-result-text', text: 'Identifiant de demande : ' + payload.identifiant }),
          el('p', { class: 'tool-result-text', text: 'Résumé : ' + payload.resume }),
          el('p', { class: 'tool-result-text', text: 'Estimation : ' + payload.estimation }),
          el('p', { class: 'tool-result-text', text: 'Payload formulaire : ' + JSON.stringify(payload.formulaire) })
        ]));
        track('tool_quote_configurator_submit', payload);
        if (window.sessionStorage) {
          try { window.sessionStorage.setItem('nr-quote-preload', JSON.stringify({ secteur: s.secteur, surface: s.surface, frequence: s.frequence, source: 'outil-configurateur-devis' })); } catch (error) {}
        }
      }

      _buildResume() {
        return [
          this._pricingConfig.secteurs[this._state.secteur] ? this._pricingConfig.secteurs[this._state.secteur].label : this._state.secteur,
          this._pricingConfig.surfaces[this._state.surface] ? this._pricingConfig.surfaces[this._state.surface].label : this._state.surface,
          this._pricingConfig.frequences[this._state.frequence] ? this._pricingConfig.frequences[this._state.frequence].label : this._state.frequence,
          'sites=' + this._state.sites
        ].join(' · ');
      }

      _buildEstimate() {
        var s = this._state;
        var pricing = this._pricingConfig;
        var secteur = pricing.secteurs[s.secteur];
        var surface = pricing.surfaces[s.surface];
        var freq = pricing.frequences[s.frequence];
        if (!secteur || !surface || !freq) return 'À déterminer';
        if (freq.ponctuel) return 'Estimation sur mesure';
        var base = surface.base * secteur.coefficient * freq.coefficient;
        var marge = typeof pricing.fourchette_marge === 'number' ? pricing.fourchette_marge : 0.15;
        var min = Math.round(base * (1 - marge) / 10) * 10;
        var max = Math.round(base * (1 + marge) / 10) * 10;
        return 'Entre ' + min + ' € et ' + max + ' € / mois';
      }

      _buildFormPayload() {
        var s = this._state;
        return {
          nom: s.coordonnees.nom,
          email: s.coordonnees.email,
          telephone: s.coordonnees.telephone,
          message: [
            'Demande via configurateur de devis',
            this._buildResume(),
            this._state.notes || ''
          ].filter(Boolean).join(' | ')
        };
      }
    }

    if (!customElements.get('nr-quote-configurator')) {
      customElements.define('nr-quote-configurator', NrQuoteConfiguratorElement);
    }
  }

  defineComponent();
})();
