/*
 * NR PROCLEAN — <nr-price-calculator>
 *
 * Web Component natif (aucune dépendance, aucun build step), cohérent avec le
 * standard d'architecture validé pour tous les outils interactifs du site :
 *   - un fichier JS isolé par outil (celui-ci ne connaît que lui-même)
 *   - une seule source de données (assets/pricing-config.json), jamais dupliquée
 *   - rendu en light DOM plutôt qu'en Shadow DOM, pour réutiliser telles quelles
 *     les variables CSS déjà définies par chaque page (--cyan, --card, --border...)
 *     au lieu de les redéclarer dans chaque composant
 *   - dégradation gracieuse si le JSON ou le réseau est indisponible
 *
 * Attributs supportés :
 *   secteur         (optionnel) — présélectionne un secteur (ex. "bureaux")
 *   lock-secteur    (optionnel) — masque le sélecteur de secteur, l'affiche en lecture seule
 *   data-config     (optionnel) — surcharge le chemin vers pricing-config.json
 *
 * Usage :
 *   <nr-price-calculator></nr-price-calculator>
 *   <nr-price-calculator secteur="bureaux" lock-secteur></nr-price-calculator>
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
    return shared.resolveConfigUrl ? shared.resolveConfigUrl(hostEl, 'assets/pricing-config.json') : (hostEl.getAttribute('data-config') || (rootPrefix() + 'assets/pricing-config.json'));
  }

  var configCache = null;
  var configPromise = null;
  function loadConfig(url) {
    if (shared.loadConfig) return shared.loadConfig(url);
    if (configCache) return Promise.resolve(configCache);
    if (configPromise) return configPromise;
    configPromise = fetch(url).then(function (res) {
      if (!res.ok) throw new Error('pricing-config indisponible (' + res.status + ')');
      return res.json();
    }).then(function (json) {
      configCache = json;
      return json;
    });
    return configPromise;
  }

  function fmtPrice(n) {
    return Math.round(n / 10) * 10;
  }

  function computeRange(config, secteurKey, surfaceKey, freqKey) {
    var secteur = config.secteurs[secteurKey];
    var surface = config.surfaces[surfaceKey];
    var freq = config.frequences[freqKey];
    if (!secteur || !surface || !freq) {
      // Ne devrait jamais arriver via l'UI (les clés viennent des boutons générés
      // depuis ce même config) — signale une incohérence de pricing-config.json
      // (clé renommée/supprimée) plutôt que d'échouer silencieusement pour la
      // personne qui maintiendra ce fichier dans le futur.
      console.warn('[nr-price-calculator] clé de configuration introuvable', { secteurKey, surfaceKey, freqKey });
      return null;
    }
    if (freq.ponctuel) return { ponctuel: true };

    var base = surface.base * secteur.coefficient * freq.coefficient;
    var marge = typeof config.fourchette_marge === 'number' ? config.fourchette_marge : 0.15;
    return { min: fmtPrice(base * (1 - marge)), max: fmtPrice(base * (1 + marge)) };
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

  /* Émet un événement générique capté par cookie-consent.js, qui applique déjà
     la logique de consentement RGPD centralisée — le composant ne duplique
     jamais cette logique lui-même. */
  var track = shared.track || function (name, params) {
    document.dispatchEvent(new CustomEvent('nr-tool-event', { detail: { name: name, params: params || {} } }));
  };

  function defineComponent() {
    class NrPriceCalculatorElement extends HTMLElement {
      connectedCallback() {
        if (this._initialized) return;
        this._initialized = true;

        this._state = {
          secteur: this.getAttribute('secteur') || null,
          surface: null,
          frequence: null
        };
        this._lockSecteur = this.hasAttribute('lock-secteur');

        this._renderLoading();

        var self = this;
        loadConfig(resolveConfigUrl(this))
          .then(function (config) {
            self._config = config;
            self._renderForm();
            track('tool_price_calc_start', { secteur: self._state.secteur || 'non_precise' });
          })
          .catch(function () {
            self._renderFallback();
          });
      }

      _renderLoading() {
        this.innerHTML = '';
        this.appendChild(el('div', { class: 'tool-card', 'aria-busy': 'true' }, [
          el('p', { class: 'tool-loading', text: "Chargement de l'estimateur…" })
        ]));
      }

      _renderFallback() {
        this.innerHTML = '';
        this.appendChild(el('div', { class: 'tool-card' }, [
          el('p', { class: 'tool-fallback-text', text: "L'estimateur est momentanément indisponible." }),
          el('a', {
            class: 'tool-cta-secondary',
            href: rootPrefix() + 'index.html#contact',
            text: 'Demander un devis gratuit →'
          })
        ]));
      }

      _renderForm() {
        var self = this;
        var config = this._config;
        this.innerHTML = '';

        var card = el('div', { class: 'tool-card' });
        card.appendChild(el('h3', { class: 'tool-title', text: 'Estimez votre prix en 30 secondes' }));

        if (!this._lockSecteur) {
          var stepSecteur = el('div', { class: 'tool-step' });
          stepSecteur.appendChild(el('span', { class: 'tool-step-label', text: 'Secteur' }));
          var groupSecteur = el('div', { class: 'tool-btn-group', role: 'group', 'aria-label': 'Choix du secteur' });
          Object.keys(config.secteurs).forEach(function (key) {
            var btn = el('button', {
              type: 'button', class: 'tool-btn-select', 'aria-pressed': 'false',
              text: config.secteurs[key].label
            });
            btn.addEventListener('click', function () { self._select('secteur', key, groupSecteur, btn); });
            groupSecteur.appendChild(btn);
          });
          stepSecteur.appendChild(groupSecteur);
          card.appendChild(stepSecteur);
        } else if (config.secteurs[this._state.secteur]) {
          card.appendChild(el('p', {
            class: 'tool-locked-secteur',
            text: 'Secteur : ' + config.secteurs[this._state.secteur].label
          }));
        }

        var stepSurface = el('div', { class: 'tool-step' });
        stepSurface.appendChild(el('span', { class: 'tool-step-label', text: 'Surface à entretenir' }));
        var groupSurface = el('div', { class: 'tool-btn-group', role: 'group', 'aria-label': 'Choix de la surface' });
        Object.keys(config.surfaces).forEach(function (key) {
          var btn = el('button', {
            type: 'button', class: 'tool-btn-select', 'aria-pressed': 'false',
            text: config.surfaces[key].label
          });
          btn.addEventListener('click', function () { self._select('surface', key, groupSurface, btn); });
          groupSurface.appendChild(btn);
        });
        stepSurface.appendChild(groupSurface);
        card.appendChild(stepSurface);

        var stepFreq = el('div', { class: 'tool-step' });
        stepFreq.appendChild(el('span', { class: 'tool-step-label', text: 'Fréquence souhaitée' }));
        var groupFreq = el('div', { class: 'tool-btn-group', role: 'group', 'aria-label': 'Choix de la fréquence' });
        Object.keys(config.frequences).forEach(function (key) {
          var btn = el('button', {
            type: 'button', class: 'tool-btn-select', 'aria-pressed': 'false',
            text: config.frequences[key].label
          });
          btn.addEventListener('click', function () { self._select('frequence', key, groupFreq, btn); });
          groupFreq.appendChild(btn);
        });
        stepFreq.appendChild(groupFreq);
        card.appendChild(stepFreq);

        var result = el('div', { class: 'tool-result', 'aria-live': 'polite' });
        card.appendChild(result);
        this._resultEl = result;

        this.appendChild(card);
      }

      _select(dimension, key, group, btn) {
        this._state[dimension] = key;
        Array.prototype.forEach.call(group.children, function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        this._maybeCompute();
      }

      _maybeCompute() {
        var s = this._state;
        if (!s.secteur || !s.surface || !s.frequence) return;
        var range = computeRange(this._config, s.secteur, s.surface, s.frequence);
        this._renderResult(range);
        track('tool_price_calc_result', { secteur: s.secteur, surface: s.surface, frequence: s.frequence });
      }

      _renderResult(range) {
        this._resultEl.innerHTML = '';
        if (!range) return;

        if (range.ponctuel) {
          this._resultEl.appendChild(el('p', {
            class: 'tool-result-text',
            text: 'Cette prestation ponctuelle est chiffrée sur mesure selon l\'ampleur du chantier.'
          }));
          this._resultEl.appendChild(this._buildLeadCta());
          return;
        }

        this._resultEl.appendChild(el('p', {
          class: 'tool-result-price',
          text: 'Entre ' + range.min + ' € et ' + range.max + ' € / mois'
        }));
        this._resultEl.appendChild(el('p', {
          class: 'tool-result-note',
          text: 'Estimation indicative hors options spécifiques. Devis exact après visite gratuite de vos locaux.'
        }));
        this._resultEl.appendChild(this._buildLeadCta());
      }

      _buildLeadCta() {
        var self = this;
        var wrap = el('div', { class: 'tool-cta-row' });
        var ctaLead = el('button', {
          type: 'button', class: 'tool-cta-primary',
          text: 'Recevoir cette estimation + parler à un conseiller'
        });
        ctaLead.addEventListener('click', function () {
          track('tool_price_calc_lead_open', self._state);
          // Verrouille les boutons de sélection pendant que le formulaire est ouvert :
          // sans ça, un clic accidentel sur "surface"/"fréquence" reconstruit .tool-result
          // et efface silencieusement le formulaire en cours de saisie (nom/email/tél perdus).
          self.querySelectorAll('.tool-btn-select').forEach(function (b) { b.disabled = true; });
          self._renderLeadForm();
        });
        wrap.appendChild(ctaLead);
        return wrap;
      }

      _renderLeadForm() {
        var self = this;
        var s = this._state;
        var config = this._config;

        var form = el('form', { class: 'tool-lead-form' });

        // Honeypot anti-spam — même pattern que le formulaire de contact principal
        var honeypot = el('input', {
          type: 'text', name: '_gotcha', class: 'tool-hp', tabindex: '-1', autocomplete: 'off'
        });
        form.appendChild(honeypot);

        var nomInput = el('input', {
          type: 'text', name: 'nom', class: 'tool-input', placeholder: 'Votre nom',
          required: 'required', autocomplete: 'name'
        });
        var emailInput = el('input', {
          type: 'email', name: 'email', class: 'tool-input', placeholder: 'Votre email',
          required: 'required', autocomplete: 'email'
        });
        var telInput = el('input', {
          type: 'tel', name: 'telephone', class: 'tool-input', placeholder: 'Votre téléphone',
          required: 'required', autocomplete: 'tel'
        });
        form.appendChild(nomInput);
        form.appendChild(emailInput);
        form.appendChild(telInput);

        var submitBtn = el('button', { type: 'submit', class: 'tool-cta-primary', text: 'Envoyer ma demande' });
        form.appendChild(submitBtn);

        var rgpdNote = el('p', { class: 'tool-result-note' });
        rgpdNote.appendChild(document.createTextNode('Vos données sont utilisées uniquement pour vous recontacter, conformément à notre '));
        rgpdNote.appendChild(el('a', {
          class: 'tool-cta-secondary', href: rootPrefix() + 'politique-confidentialite.html', text: 'politique de confidentialité'
        }));
        rgpdNote.appendChild(document.createTextNode('.'));
        form.appendChild(rgpdNote);

        var errorEl = el('p', { class: 'tool-error', role: 'alert' });
        errorEl.style.display = 'none';
        form.appendChild(errorEl);

        var loadedAt = Date.now();

        form.addEventListener('submit', function (e) {
          e.preventDefault();

          if (honeypot.value) return; // bot détecté : ignoré silencieusement
          if (Date.now() - loadedAt < 1500) return; // soumission trop rapide : probable bot

          try {
            window.sessionStorage.setItem('nr-quote-preload', JSON.stringify({
              secteur: s.secteur,
              surface: s.surface,
              frequence: s.frequence,
              source: 'outil-estimation-devis'
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
            source: 'outil-estimation-devis',
            nom: nom,
            email: email,
            telephone: tel,
            secteur: (config.secteurs[s.secteur] && config.secteurs[s.secteur].label) || s.secteur,
            surface: (config.surfaces[s.surface] && config.surfaces[s.surface].label) || s.surface,
            frequence: (config.frequences[s.frequence] && config.frequences[s.frequence].label) || s.frequence,
            message: "Demande envoyée depuis l'outil d'estimation de prix du site."
          };

          // NOTE (dette assumée, documentée) : réutilise le point de collecte Formspree
          // déjà en place pour le formulaire de contact principal, plutôt que d'introduire
          // un nouveau service dès la V1. Seul changement si le volume augmente : remplacer
          // cette URL par un endpoint dédié — un seul point de code à modifier.
          fetch('https://formspree.io/f/meeplgey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          }).then(function (response) {
            if (response.ok) {
              track('tool_price_calc_lead_submit', s);
              document.dispatchEvent(new CustomEvent('nr-form-submitted'));
              form.innerHTML = '';
              form.appendChild(el('p', {
                class: 'tool-success',
                text: 'Merci ! Nous revenons vers vous sous 24 à 48h ouvrables.'
              }));
            } else {
              errorEl.textContent = 'Une erreur est survenue. Réessayez ou appelez-nous au 0484 44 24 21.';
              errorEl.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Envoyer ma demande';
            }
          }).catch(function () {
            errorEl.textContent = 'Impossible d\'envoyer la demande. Vérifiez votre connexion.';
            errorEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Envoyer ma demande';
          });
        });

        this._resultEl.appendChild(form);
        // Déplace le focus vers le premier champ : sans ça, un utilisateur clavier
        // ou lecteur d'écran ne sait pas qu'un nouveau formulaire vient d'apparaître
        // au-delà de l'annonce aria-live du texte, et doit le chercher manuellement.
        nomInput.focus();
      }
    }

    if (!customElements.get('nr-price-calculator')) {
      customElements.define('nr-price-calculator', NrPriceCalculatorElement);
    }
  }

  defineComponent();
})();
