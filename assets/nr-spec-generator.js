/*
 * NR PROCLEAN — <nr-spec-generator>
 *
 * Générateur de cahier des charges de nettoyage professionnel, en 9 étapes.
 * Suit le standard d'architecture validé au Sprint 1 :
 *   - Web Component natif, isolé, aucune dépendance externe
 *   - une seule source de données (assets/cahier-des-charges-config.json)
 *   - rendu en light DOM, réutilise les tokens CSS de la page hôte
 *   - dégradation gracieuse si le JSON est indisponible
 *   - tracking via l'événement générique nr-tool-event (capté par cookie-consent.js)
 *
 * Décision structurante de ce composant : le document généré n'est JAMAIS
 * reconstruit à deux endroits différents. _buildDocumentData() produit une
 * structure de données unique, consommée à la fois par le rendu HTML (écran/
 * impression) et par la version texte (email, devis). Ça évite qu'une future
 * modification du contenu du document ne soit appliquée à un seul des deux
 * rendus par oubli.
 *
 * Attributs supportés :
 *   secteur       (optionnel) — présélectionne un secteur (ex. "bureaux")
 *   data-config   (optionnel) — surcharge le chemin vers le fichier de config
 *
 * Le secteur peut aussi être fourni via l'URL : ?secteur=bureaux (utilisé pour
 * le lien "Générer mon cahier des charges" depuis les pages de service).
 *
 * Usage :
 *   <nr-spec-generator></nr-spec-generator>
 *   <nr-spec-generator secteur="bureaux"></nr-spec-generator>
 */
(function () {
  'use strict';

  var shared = window.NRTools || {};
  var rootPrefix = shared.rootPrefix || function () {
    var p = window.location.pathname;
    var inSubfolder = p.indexOf('/services/') !== -1 || p.indexOf('/zones/') !== -1 || p.indexOf('/outils/') !== -1;
    return inSubfolder ? '../' : '';
  };

  function resolveConfigUrl(hostEl) {
    return shared.resolveConfigUrl ? shared.resolveConfigUrl(hostEl, 'assets/cahier-des-charges-config.json') : (hostEl.getAttribute('data-config') || (rootPrefix() + 'assets/cahier-des-charges-config.json'));
  }

  var configCache = null;
  var configPromise = null;
  function loadConfig(url) {
    if (shared.loadConfig) return shared.loadConfig(url);
    if (configCache) return Promise.resolve(configCache);
    if (configPromise) return configPromise;
    configPromise = fetch(url).then(function (res) {
      if (!res.ok) throw new Error('cahier-des-charges-config indisponible (' + res.status + ')');
      return res.json();
    }).then(function (json) {
      configCache = json;
      return json;
    });
    return configPromise;
  }

  var el = shared.el || function (tag, attrs, children) {
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
  };

  var track = shared.track || function (name, params) {
    document.dispatchEvent(new CustomEvent('nr-tool-event', { detail: { name: name, params: params || {} } }));
  };

  function labelsFor(config, configKey, keys) {
    var dict = config[configKey] || {};
    return (keys || []).map(function (k) { return dict[k] ? dict[k].label : k; });
  }

  /* Définition des 9 étapes — piloté par données : ajouter une étape future
     (ex. "type de sol") consiste à ajouter une entrée ici, pas à écrire un
     nouveau bloc de rendu. */
  var STEPS = [
    { key: 'secteur', title: "Quel est votre secteur d'activité ?", type: 'single', configKey: 'secteurs', required: true },
    { key: 'type_batiment', title: "Quel type de bâtiment ou d'espace ?", type: 'single', configKey: 'types_batiment', required: true },
    { key: 'surface', title: 'Quelle est la surface totale à entretenir ?', type: 'number', required: true, unit: 'm²' },
    { key: 'frequence', title: 'Quelle fréquence de passage souhaitez-vous ?', type: 'single', configKey: 'frequences', required: true },
    { key: 'horaires', title: "À quels horaires l'intervention peut-elle avoir lieu ?", type: 'multi', configKey: 'horaires', required: false },
    { key: 'contraintes', title: 'Avez-vous des contraintes particulières ?', type: 'multi', configKey: 'contraintes', required: false, hasOther: true },
    { key: 'prestations', title: 'Quelles prestations souhaitez-vous inclure ?', type: 'multi', configKey: 'prestations', required: false },
    { key: 'zones', title: 'Quelles zones doivent être nettoyées ?', type: 'multi', configKey: 'zones', required: false },
    { key: 'options', title: 'Souhaitez-vous des options complémentaires ?', type: 'multi', configKey: 'options', required: false }
  ];

  function defineComponent() {
    class NrSpecGeneratorElement extends HTMLElement {
      connectedCallback() {
        if (this._initialized) return;
        this._initialized = true;

        var urlSecteur = new URLSearchParams(window.location.search).get('secteur');
        this._state = {
          secteur: this.getAttribute('secteur') || urlSecteur || null,
          type_batiment: null,
          surface: '',
          frequence: null,
          horaires: [],
          contraintes: [],
          contraintes_autre: '',
          prestations: [],
          zones: [],
          options: []
        };
        this._stepIndex = 0;
        this._documentMode = false;

        this._renderLoading();

        var self = this;
        loadConfig(resolveConfigUrl(this))
          .then(function (config) {
            self._config = config;
            self._renderStep();
            track('tool_spec_gen_start', { secteur: self._state.secteur || 'non_precise' });
          })
          .catch(function () {
            self._renderFallback();
          });
      }

      _renderLoading() {
        this.innerHTML = '';
        this.appendChild(el('div', { class: 'tool-card', 'aria-busy': 'true' }, [
          el('p', { class: 'tool-loading', text: 'Chargement du générateur…' })
        ]));
      }

      _renderFallback() {
        this.innerHTML = '';
        this.appendChild(el('div', { class: 'tool-card' }, [
          el('p', { class: 'tool-fallback-text', text: 'Le générateur est momentanément indisponible.' }),
          el('a', {
            class: 'tool-cta-secondary',
            href: rootPrefix() + 'index.html#contact',
            text: 'Demander un devis gratuit →'
          })
        ]));
      }

      /* ── Étapes ── */

      _isStepValid(step) {
        if (!step.required) return true;
        var v = this._state[step.key];
        if (step.type === 'number') return v !== '' && !isNaN(v) && Number(v) > 0;
        return !!v;
      }

      _renderStep() {
        var self = this;
        var config = this._config;
        var step = STEPS[this._stepIndex];
        this.innerHTML = '';

        var card = el('div', { class: 'tool-card' });

        var progress = el('div', { class: 'tool-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(STEPS.length), 'aria-valuenow': String(this._stepIndex + 1) });
        STEPS.forEach(function (s, i) {
          var dotClass = 'tool-progress-dot' + (i < self._stepIndex ? ' is-done' : i === self._stepIndex ? ' is-current' : '');
          progress.appendChild(el('span', { class: dotClass }));
        });
        card.appendChild(progress);

        card.appendChild(el('span', { class: 'tool-step-eyebrow', text: 'Étape ' + (this._stepIndex + 1) + ' sur ' + STEPS.length }));
        card.appendChild(el('h3', { class: 'tool-title', text: step.title }));

        var body = el('div', { class: 'tool-step-body' });

        if (step.type === 'single') {
          var group = el('div', { class: 'tool-btn-group', role: 'group', 'aria-label': step.title });
          Object.keys(config[step.configKey]).forEach(function (key) {
            var isActive = self._state[step.key] === key;
            var btn = el('button', {
              type: 'button',
              class: 'tool-btn-select' + (isActive ? ' is-active' : ''),
              'aria-pressed': isActive ? 'true' : 'false',
              text: config[step.configKey][key].label
            });
            btn.addEventListener('click', function () {
              self._state[step.key] = key;
              self._renderStep();
            });
            group.appendChild(btn);
          });
          body.appendChild(group);
        } else if (step.type === 'number') {
          var input = el('input', {
            type: 'number', min: '1', step: '1', class: 'tool-input',
            placeholder: 'Ex : 350', 'aria-label': step.title
          });
          input.value = this._state[step.key];
          input.addEventListener('input', function () {
            self._state[step.key] = input.value;
            self._updateNavState();
          });
          body.appendChild(input);
          if (step.unit) body.appendChild(el('span', { class: 'tool-step-eyebrow', text: 'Surface exprimée en ' + step.unit }));
        } else if (step.type === 'multi') {
          var checkGroup = el('div', { class: 'tool-checkbox-group' });
          Object.keys(config[step.configKey]).forEach(function (key) {
            var checked = self._state[step.key].indexOf(key) !== -1;
            var label = el('label', { class: 'tool-checkbox-item' });
            var checkbox = el('input', { type: 'checkbox' });
            checkbox.checked = checked;
            checkbox.addEventListener('change', function () {
              var arr = self._state[step.key];
              var idx = arr.indexOf(key);
              if (checkbox.checked && idx === -1) arr.push(key);
              else if (!checkbox.checked && idx !== -1) arr.splice(idx, 1);
            });
            label.appendChild(checkbox);
            label.appendChild(el('span', { text: config[step.configKey][key].label }));
            checkGroup.appendChild(label);
          });
          body.appendChild(checkGroup);

          if (step.hasOther) {
            var otherTextarea = el('textarea', {
              class: 'tool-textarea',
              placeholder: 'Autre contrainte à préciser (facultatif)',
              'aria-label': 'Autre contrainte à préciser'
            });
            otherTextarea.value = this._state[step.key + '_autre'] || '';
            otherTextarea.style.marginTop = '14px';
            otherTextarea.addEventListener('input', function () {
              self._state[step.key + '_autre'] = otherTextarea.value;
            });
            body.appendChild(otherTextarea);
          }
        }

        card.appendChild(body);

        var nav = el('div', { class: 'tool-step-nav' });
        var prevBtn = el('button', { type: 'button', class: 'tool-btn-outline', text: '← Précédent' });
        prevBtn.disabled = this._stepIndex === 0;
        prevBtn.addEventListener('click', function () { self._prev(); });

        var isLast = this._stepIndex === STEPS.length - 1;
        var nextBtn = el('button', {
          type: 'button', class: 'tool-cta-primary',
          text: isLast ? 'Générer mon cahier des charges' : 'Suivant →'
        });
        nextBtn.addEventListener('click', function () { self._next(); });

        nav.appendChild(prevBtn);
        nav.appendChild(nextBtn);
        card.appendChild(nav);

        this._nextBtn = nextBtn;
        this._updateNavState();

        this.appendChild(card);
      }

      _updateNavState() {
        if (!this._nextBtn) return;
        var step = STEPS[this._stepIndex];
        this._nextBtn.disabled = !this._isStepValid(step);
      }

      _prev() {
        if (this._stepIndex === 0) return;
        this._stepIndex--;
        this._renderStep();
      }

      _next() {
        var step = STEPS[this._stepIndex];
        if (!this._isStepValid(step)) return;

        if (this._stepIndex === STEPS.length - 1) {
          track('tool_spec_gen_complete', { secteur: this._state.secteur });
          this._renderDocument();
          return;
        }
        this._stepIndex++;
        this._renderStep();
      }

      /* ── Génération du document ──
         Une seule structure de données, consommée par le rendu écran ET par
         la version texte (email / devis) — jamais reconstruite deux fois. */
      _buildDocumentData() {
        var s = this._state;
        var config = this._config;
        var secteurLabel = (config.secteurs[s.secteur] && config.secteurs[s.secteur].label) || 'Non précisé';
        var typeLabel = (config.types_batiment[s.type_batiment] && config.types_batiment[s.type_batiment].label) || 'Non précisé';
        var freqLabel = (config.frequences[s.frequence] && config.frequences[s.frequence].label) || 'Non précisé';

        var contraintesListe = labelsFor(config, 'contraintes', s.contraintes);
        if (s.contraintes_autre && s.contraintes_autre.trim()) contraintesListe.push(s.contraintes_autre.trim());

        return {
          genereLe: new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' }),
          sections: [
            {
              title: 'Présentation du site',
              fields: [
                { label: "Secteur d'activité", value: secteurLabel },
                { label: 'Type de bâtiment', value: typeLabel },
                { label: 'Surface totale', value: (s.surface || 'Non précisée') + (s.surface ? ' m²' : '') }
              ]
            },
            {
              title: 'Fréquence souhaitée',
              fields: [{ label: 'Fréquence', value: freqLabel }]
            },
            { title: "Horaires d'intervention possibles", list: labelsFor(config, 'horaires', s.horaires) },
            { title: 'Contraintes particulières', list: contraintesListe },
            { title: 'Prestations attendues', list: labelsFor(config, 'prestations', s.prestations) },
            { title: 'Zones à nettoyer', list: labelsFor(config, 'zones', s.zones) },
            { title: 'Options complémentaires souhaitées', list: labelsFor(config, 'options', s.options) }
          ]
        };
      }

      _documentToText(doc) {
        var lines = [];
        lines.push('CAHIER DES CHARGES — NETTOYAGE PROFESSIONNEL');
        lines.push('Généré le ' + doc.genereLe + ' via l\'outil gratuit NR PROCLEAN (nrproclean.be/outils/cahier-des-charges.html)');
        lines.push('Ce document peut être transmis à plusieurs prestataires pour comparaison.');
        lines.push('');
        doc.sections.forEach(function (section) {
          lines.push('— ' + section.title.toUpperCase() + ' —');
          if (section.fields) {
            section.fields.forEach(function (f) { lines.push(f.label + ' : ' + f.value); });
          }
          if (section.list) {
            if (section.list.length === 0) lines.push('(non précisé)');
            else section.list.forEach(function (item) { lines.push('- ' + item); });
          }
          lines.push('');
        });
        return lines.join('\n');
      }

      _renderDocument() {
        var self = this;
        this._documentMode = true;
        var doc = this._buildDocumentData();
        this._lastDocument = doc;

        this.innerHTML = '';
        var card = el('div', { class: 'tool-card' });
        var docEl = el('div', { class: 'tool-document' });

        docEl.appendChild(el('h2', { text: 'Cahier des charges — Nettoyage professionnel' }));
        docEl.appendChild(el('p', {
          class: 'tool-document-subtitle',
          text: 'Généré le ' + doc.genereLe + ' · Document libre d\'usage, transmissible à plusieurs prestataires'
        }));

        doc.sections.forEach(function (section) {
          docEl.appendChild(el('h3', { text: section.title }));
          if (section.fields) {
            var dl = el('dl');
            section.fields.forEach(function (f) {
              dl.appendChild(el('dt', { text: f.label }));
              dl.appendChild(el('dd', { text: f.value }));
            });
            docEl.appendChild(dl);
          }
          if (section.list) {
            if (section.list.length === 0) {
              docEl.appendChild(el('p', { class: 'tool-document-empty', text: 'Non précisé' }));
            } else {
              var ul = el('ul');
              section.list.forEach(function (item) { ul.appendChild(el('li', { text: item })); });
              docEl.appendChild(ul);
            }
          }
        });

        card.appendChild(docEl);

        var actions = el('div', { class: 'tool-actions-row' });

        var printBtn = el('button', { type: 'button', class: 'tool-cta-primary', text: 'Imprimer / Enregistrer en PDF' });
        printBtn.addEventListener('click', function () { track('tool_spec_gen_print', {}); window.print(); });

        var emailBtn = el('button', { type: 'button', class: 'tool-btn-outline', text: 'Recevoir par email' });
        emailBtn.addEventListener('click', function () { self._openMailto(); });

        var devisBtn = el('button', { type: 'button', class: 'tool-btn-outline', text: 'Demander un devis avec ces informations' });
        devisBtn.addEventListener('click', function () { self._renderLeadForm(); });

        var editBtn = el('button', { type: 'button', class: 'tool-cta-secondary', text: '← Modifier mes réponses' });
        editBtn.style.marginLeft = 'auto';
        editBtn.addEventListener('click', function () {
          self._documentMode = false;
          self._stepIndex = 0;
          self._renderStep();
        });

        actions.appendChild(printBtn);
        actions.appendChild(emailBtn);
        actions.appendChild(devisBtn);
        card.appendChild(actions);
        card.appendChild(editBtn);

        this._leadZone = el('div');
        card.appendChild(this._leadZone);

        this.appendChild(card);
      }

      /* ── Envoi par email ──
         Zéro dépendance externe : ouvre le client mail de l'utilisateur avec
         le document complet pré-rempli en corps de message. Alternative honnête
         à un envoi automatisé, dont on ne peut pas garantir le rendu via le
         template EmailJS existant (conçu pour un message court, pas un document). */
      _openMailto() {
        track('tool_spec_gen_email', {});
        var text = this._documentToText(this._lastDocument);
        var subject = 'Cahier des charges nettoyage — NR PROCLEAN';
        var url = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
        window.location.href = url;
      }

      /* ── Demande de devis pré-remplie ──
         Même pattern que le formulaire de lead du calculateur de prix (Sprint 1) :
         honeypot, délai anti-bot, Formspree. Le payload inclut le document complet. */
      _renderLeadForm() {
        var self = this;
        if (this._leadFormOpen) return;
        this._leadFormOpen = true;
        track('tool_spec_gen_lead_open', {});

        this.querySelectorAll('.tool-actions-row button').forEach(function (b) { b.disabled = true; });

        var form = el('form', { class: 'tool-lead-form' });

        var honeypot = el('input', { type: 'text', name: '_gotcha', class: 'tool-hp', tabindex: '-1', autocomplete: 'off' });
        form.appendChild(honeypot);

        var nomInput = el('input', { type: 'text', name: 'nom', class: 'tool-input', placeholder: 'Votre nom', required: 'required', autocomplete: 'name' });
        var emailInput = el('input', { type: 'email', name: 'email', class: 'tool-input', placeholder: 'Votre email', required: 'required', autocomplete: 'email' });
        var telInput = el('input', { type: 'tel', name: 'telephone', class: 'tool-input', placeholder: 'Votre téléphone', required: 'required', autocomplete: 'tel' });
        form.appendChild(nomInput);
        form.appendChild(emailInput);
        form.appendChild(telInput);

        var submitBtn = el('button', { type: 'submit', class: 'tool-cta-primary', text: 'Envoyer ma demande de devis' });
        form.appendChild(submitBtn);

        var rgpdNote = el('p', { class: 'tool-result-note' });
        rgpdNote.appendChild(document.createTextNode('Vos données sont utilisées uniquement pour vous recontacter, conformément à notre '));
        rgpdNote.appendChild(el('a', { class: 'tool-cta-secondary', href: rootPrefix() + 'politique-confidentialite.html', text: 'politique de confidentialité' }));
        rgpdNote.appendChild(document.createTextNode('.'));
        form.appendChild(rgpdNote);

        var errorEl = el('p', { class: 'tool-error', role: 'alert' });
        errorEl.style.display = 'none';
        form.appendChild(errorEl);

        var loadedAt = Date.now();

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          if (honeypot.value) return;
          if (Date.now() - loadedAt < 1500) return;

          try {
            window.sessionStorage.setItem('nr-quote-preload', JSON.stringify({
              secteur: self._state.secteur,
              surface: self._state.surface,
              frequence: self._state.frequence,
              source: 'outil-cahier-des-charges'
            }));
          } catch (error) {}

          var nom = nomInput.value.trim();
          var email = emailInput.value.trim();
          var tel = telInput.value.trim();
          if (!nom || !email || !tel) {
            errorEl.textContent = 'Merci de renseigner votre nom, email et téléphone.';
            errorEl.style.display = 'block';
            return;
          }

          submitBtn.disabled = true;
          submitBtn.textContent = 'Envoi en cours…';
          errorEl.style.display = 'none';

          var payload = {
            source: 'outil-cahier-des-charges',
            nom: nom,
            email: email,
            telephone: tel,
            message: self._documentToText(self._lastDocument)
          };

          fetch('https://formspree.io/f/meeplgey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          }).then(function (response) {
            if (response.ok) {
              track('tool_spec_gen_lead_submit', {});
              document.dispatchEvent(new CustomEvent('nr-form-submitted'));
              form.innerHTML = '';
              form.appendChild(el('p', { class: 'tool-success', text: 'Merci ! Nous revenons vers vous sous 24 à 48h ouvrables avec un devis basé sur votre cahier des charges.' }));
            } else {
              errorEl.textContent = 'Une erreur est survenue. Réessayez ou appelez-nous au 0484 44 24 21.';
              errorEl.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Envoyer ma demande de devis';
            }
          }).catch(function () {
            errorEl.textContent = 'Impossible d\'envoyer la demande. Vérifiez votre connexion.';
            errorEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Envoyer ma demande de devis';
          });
        });

        this._leadZone.appendChild(form);
        nomInput.focus();
      }
    }

    if (!customElements.get('nr-spec-generator')) {
      customElements.define('nr-spec-generator', NrSpecGeneratorElement);
    }
  }

  defineComponent();
})();
