(function () {
  'use strict';

  // ─── COMMON (nav, footer, buttons) ───────────────────────────────────────
  var C = {
    fr: {
      nav_home: 'Accueil', nav_services: 'Services', nav_why: 'Pourquoi nous\u00a0?',
      nav_contact: 'Contact', nav_cta: 'Devis gratuit',
      nav_svc_bureaux: 'Nettoyage de bureaux', nav_svc_vitres: 'Nettoyage de vitres',
      nav_svc_apres: 'Nettoyage après travaux', nav_svc_hotelier: 'Nettoyage hôtelier / hébergements',
      nav_svc_coworking: 'Coworking', nav_svc_magasins: 'Magasins',
      nav_svc_pharmacies: 'Pharmacies', nav_svc_cabinet: 'Cabinet médical & dentaire',
      nav_svc_industriel: 'Nettoyage industriel (usines)', nav_svc_autres: 'Autres prestations sur demande',
      btn_devis: 'Demander un devis gratuit', btn_devis_short: 'Devis gratuit',
      footer_copy: '© 2025 NR PROCLEAN. Tous droits réservés.',
      footer_tagline: 'Service de nettoyage professionnel sur mesure pour entreprises, commerces, hôtels et sites industriels en Belgique.',
    },
    en: {
      nav_home: 'Home', nav_services: 'Services', nav_why: 'Why us?',
      nav_contact: 'Contact', nav_cta: 'Free quote',
      nav_svc_bureaux: 'Office cleaning', nav_svc_vitres: 'Window cleaning',
      nav_svc_apres: 'Post-construction cleaning', nav_svc_hotelier: 'Hotel / accommodation cleaning',
      nav_svc_coworking: 'Coworking spaces', nav_svc_magasins: 'Retail stores',
      nav_svc_pharmacies: 'Pharmacies', nav_svc_cabinet: 'Medical & dental practices',
      nav_svc_industriel: 'Industrial cleaning', nav_svc_autres: 'Other services on request',
      btn_devis: 'Request a free quote', btn_devis_short: 'Free quote',
      footer_copy: '© 2025 NR PROCLEAN. All rights reserved.',
      footer_tagline: 'Professional cleaning service tailored for businesses, retail, hotels and industrial sites across Belgium.',
    },
    nl: {
      nav_home: 'Home', nav_services: 'Diensten', nav_why: 'Waarom wij?',
      nav_contact: 'Contact', nav_cta: 'Gratis offerte',
      nav_svc_bureaux: 'Kantoorschoonmaak', nav_svc_vitres: 'Ramenreiniging',
      nav_svc_apres: 'Schoonmaak na werken', nav_svc_hotelier: 'Hotel / accommodatiereiniging',
      nav_svc_coworking: 'Coworkingruimtes', nav_svc_magasins: 'Winkels',
      nav_svc_pharmacies: 'Apotheken', nav_svc_cabinet: 'Medische & tandartspraktijken',
      nav_svc_industriel: 'Industriële reiniging', nav_svc_autres: 'Andere diensten op aanvraag',
      btn_devis: 'Vraag een gratis offerte', btn_devis_short: 'Gratis offerte',
      footer_copy: '© 2025 NR PROCLEAN. Alle rechten voorbehouden.',
      footer_tagline: 'Professionele schoonmaakdienst op maat voor bedrijven, winkels, hotels en industriële sites in België.',
    }
  };

  // ─── PAGE-SPECIFIC HERO TRANSLATIONS ─────────────────────────────────────
  var P = {
    index: {
      fr: { eyebrow: 'NETTOYAGE PROFESSIONNEL B2B — BELGIQUE',
            h1: 'Nettoyage professionnel<br/>en province de Liège —<br/><em>fiable</em> et <em>exigeant</em>',
            lead: 'NR PROCLEAN intervient dans vos bureaux, commerces, hôtels et sites industriels à travers la Belgique. Des équipes formées, des protocoles rigoureux, un résultat irréprochable — chaque fois.',
            t1:'Équipes certifiées', t2:'Contrats sur mesure', t3:'Réponse sous 24h', t4:'Toute la Belgique',
            cta1:'Demander un devis gratuit', cta2:'Voir nos services' },
      en: { eyebrow: 'PROFESSIONAL B2B CLEANING — BELGIUM',
            h1: 'Professional cleaning<br/>in the province of Liège —<br/><em>reliable</em> and <em>demanding</em>',
            lead: 'NR PROCLEAN operates in your offices, retail spaces, hotels and industrial sites across Belgium. Trained teams, rigorous protocols, flawless results — every time.',
            t1:'Certified teams', t2:'Tailored contracts', t3:'Response within 24h', t4:'All of Belgium',
            cta1:'Request a free quote', cta2:'View our services' },
      nl: { eyebrow: 'PROFESSIONELE B2B REINIGING — BELGIË',
            h1: 'Professionele reiniging<br/>in de provincie Luik —<br/><em>betrouwbaar</em> en <em>veeleisend</em>',
            lead: 'NR PROCLEAN is actief in uw kantoren, winkels, hotels en industriële locaties door heel België. Opgeleide teams, strenge protocollen, onberispelijke resultaten — elke keer.',
            t1:'Gecertificeerde teams', t2:'Maatwerk contracten', t3:'Reactie binnen 24u', t4:'Heel België',
            cta1:'Vraag een gratis offerte', cta2:'Bekijk onze diensten' }
    },
    bureaux: {
      fr: { eyebrow:'NETTOYAGE DE BUREAUX', h1:'Des bureaux <em>impeccables</em>.<br/>Chaque matin,<br/>sans effort.',
            lead:'Open-spaces, salles de réunion, accueil — NR PROCLEAN entretient vos espaces de travail à Liège et en province avec rigueur, discrétion et un planning calé sur votre organisation.',
            t1:'Devis sous 48h', t2:'Planning flexible', t3:'Équipe formée & encadrée' },
      en: { eyebrow:'OFFICE CLEANING', h1:'<em>Impeccable</em> offices.<br/>Every morning,<br/>effortlessly.',
            lead:'Open spaces, meeting rooms, reception — NR PROCLEAN maintains your workspaces in Liège with rigour, discretion and a schedule tailored to your organisation.',
            t1:'Quote within 48h', t2:'Flexible schedule', t3:'Trained & supervised team' },
      nl: { eyebrow:'KANTOORSCHOONMAAK', h1:'<em>Onberispelijke</em> kantoren.<br/>Elke ochtend,<br/>moeiteloos.',
            lead:'Openruimtes, vergaderzalen, receptie — NR PROCLEAN onderhoudt uw werkruimtes in Luik met strengheid, discretie en een planning afgestemd op uw organisatie.',
            t1:'Offerte binnen 48u', t2:'Flexibele planning', t3:'Opgeleid & begeleid team' }
    },
    vitres: {
      fr: { eyebrow:'NETTOYAGE DE VITRES', h1:'Des vitres <em>sans traces</em>.<br/>Un reflet <em>parfait</em>.',
            lead:'Vitrines, baies vitrées, façades — NR PROCLEAN assure le nettoyage de vos surfaces vitrées à Liège et en province avec des techniques et produits professionnels.',
            t1:'Sans traces garanties', t2:'Intérieur & extérieur', t3:'Accès en hauteur' },
      en: { eyebrow:'WINDOW CLEANING', h1:'Windows <em>without streaks</em>.<br/>A <em>perfect</em> reflection.',
            lead:'Shop fronts, bay windows, facades — NR PROCLEAN ensures the cleaning of your glazed surfaces in Liège and the province with professional techniques and products.',
            t1:'Streak-free guaranteed', t2:'Interior & exterior', t3:'High-access cleaning' },
      nl: { eyebrow:'RAMENREINIGING', h1:'Ramen <em>zonder strepen</em>.<br/>Een <em>perfecte</em> weerspiegeling.',
            lead:'Etalageramen, raampartijen, gevels — NR PROCLEAN verzorgt de reiniging van uw glazen oppervlakken in Luik met professionele technieken en producten.',
            t1:'Streepvrij gegarandeerd', t2:'Binnen- & buitenkant', t3:'Hoogtereiniging' }
    },
    'apres-travaux': {
      fr: { eyebrow:'NETTOYAGE APRÈS TRAVAUX', h1:'Chantier terminé.<br/>Place au <em>propre</em>.<br/><em>Sous 48h.</em>',
            lead:'Poussières, résidus de plâtre, projections de peinture — NR PROCLEAN prend le relais après votre chantier à Liège et en Wallonie pour une remise en état complète.',
            t1:'Mobilisation sous 48h', t2:'Aspirateurs HEPA', t3:'Remise en état clé en main' },
      en: { eyebrow:'POST-CONSTRUCTION CLEANING', h1:'Construction done.<br/>Time for <em>clean</em>.<br/><em>Within 48h.</em>',
            lead:'Dust, plaster residue, paint splatter — NR PROCLEAN takes over after your construction in Liège and Wallonia for a complete restoration, ready to be handed over.',
            t1:'Mobilised within 48h', t2:'HEPA vacuums', t3:'Turnkey restoration' },
      nl: { eyebrow:'SCHOONMAAK NA WERKEN', h1:'Werken gedaan.<br/>Tijd voor <em>properheid</em>.<br/><em>Binnen 48u.</em>',
            lead:'Stof, pleisterresten, verfspetters — NR PROCLEAN neemt het over na uw bouwwerken in Luik en Wallonië voor een volledige herstelservice.',
            t1:'Inzet binnen 48u', t2:'HEPA-stofzuigers', t3:'Kant-en-klare oplevering' }
    },
    hotelier: {
      fr: { eyebrow:'NETTOYAGE HÔTELIER', h1:'Chaque client mérite<br/>un accueil <em>sans défaut</em>.<br/>Toujours.',
            lead:'Hôtels, gîtes, hébergements premium — NR PROCLEAN assure une propreté irréprochable à chaque rotation, dans les délais, pour que vos clients vivent une expérience sans faille.',
            t1:'Respect des rotations', t2:'Équipes discrètes', t3:'Standards hôteliers' },
      en: { eyebrow:'HOTEL CLEANING', h1:'Every guest deserves<br/>a <em>flawless</em> welcome.<br/>Always.',
            lead:'Hotels, guesthouses, premium accommodations — NR PROCLEAN ensures impeccable cleanliness at every turnover, on time, so your guests experience a seamless stay.',
            t1:'Turnover schedules met', t2:'Discreet teams', t3:'Hotel standards' },
      nl: { eyebrow:'HOTELREINIGING', h1:'Elke gast verdient<br/>een <em>vlekkeloze</em> ontvangst.<br/>Altijd.',
            lead:'Hotels, gastenkamers, premium accommodaties — NR PROCLEAN zorgt voor onberispelijke netheid bij elke wisseling, op tijd, zodat uw gasten een naadloze ervaring beleven.',
            t1:'Wisselingen op tijd', t2:'Discrete teams', t3:'Hotelstandaarden' }
    },
    industriel: {
      fr: { eyebrow:'NETTOYAGE INDUSTRIEL', h1:'Votre site industriel.<br/>Propre, <em>sans impact</em><br/>sur votre production.',
            lead:'Halls d\'ateliers, zones de production — NR PROCLEAN intervient avec votre planning. Autolaveuses industrielles, haute pression, désinfection de zones réglementées.',
            t1:'Zéro impact production', t2:'Équipements industriels', t3:'Zones réglementées' },
      en: { eyebrow:'INDUSTRIAL CLEANING', h1:'Your industrial site.<br/>Clean, <em>without impacting</em><br/>your production.',
            lead:'Workshop halls, production areas — NR PROCLEAN operates according to your schedule. Industrial scrubbers, high pressure, disinfection of regulated zones.',
            t1:'Zero production impact', t2:'Industrial equipment', t3:'Regulated zones' },
      nl: { eyebrow:'INDUSTRIËLE REINIGING', h1:'Uw industriële site.<br/>Proper, <em>zonder impact</em><br/>op uw productie.',
            lead:'Werkplaatsen, productiehallen — NR PROCLEAN werkt volgens uw planning. Industriële schrobmachines, hogedruk, desinfectie van gereglementeerde zones.',
            t1:'Nul impact op productie', t2:'Industrieel materieel', t3:'Gereglementeerde zones' }
    },
    coworking: {
      fr: { eyebrow:'ESPACES DE COWORKING', h1:'Un espace partagé<br/><em>impeccable</em>. Chaque jour.',
            lead:'Postes de travail partagés, salles de réunion, cuisine commune — NR PROCLEAN adapte ses interventions à la fréquentation et au rythme de votre espace.',
            t1:'Fréquence adaptable', t2:'Espaces partagés/privatifs', t3:'Reporting mensuel' },
      en: { eyebrow:'COWORKING SPACES', h1:'A shared space that\'s<br/><em>impeccable</em>. Every day.',
            lead:'Shared workstations, meeting rooms, communal kitchen — NR PROCLEAN adapts its service to your space\'s footfall and rhythm. Total flexibility, consistent results.',
            t1:'Adaptable frequency', t2:'Shared/private spaces', t3:'Monthly reporting' },
      nl: { eyebrow:'COWORKINGRUIMTES', h1:'Een gedeelde ruimte<br/><em>onberispelijk</em>. Elke dag.',
            lead:'Gedeelde werkplekken, vergaderzalen, gemeenschappelijke keuken — NR PROCLEAN past zijn interventies aan aan de bezetting en het ritme van uw ruimte.',
            t1:'Aanpasbare frequentie', t2:'Gedeelde/private ruimtes', t3:'Maandelijkse rapportage' }
    },
    magasins: {
      fr: { eyebrow:'NETTOYAGE DE MAGASINS', h1:'Un magasin <em>propre</em><br/>attire — et fait <em>revenir</em>.',
            lead:'Sols brillants, vitrines sans traces, allées impeccables — NR PROCLEAN entretient vos espaces de vente à Liège, avant ouverture ou après fermeture.',
            t1:'Avant ouverture', t2:'Vitrine sans traces', t3:'Discret et efficace' },
      en: { eyebrow:'RETAIL STORE CLEANING', h1:'A <em>clean</em> store<br/>attracts — and brings <em>customers back</em>.',
            lead:'Shiny floors, spotless windows, immaculate aisles — NR PROCLEAN maintains your retail spaces in Liège, before opening or after closing.',
            t1:'Before opening', t2:'Streak-free windows', t3:'Discreet and efficient' },
      nl: { eyebrow:'WINKELSCHOONMAAK', h1:'Een <em>proper</em> winkel<br/>trekt aan — en doet <em>terugkomen</em>.',
            lead:'Glanzende vloeren, spiegelende etalages, onberispelijke gangpaden — NR PROCLEAN onderhoudt uw verkoopruimtes in Luik, voor opening of na sluiting.',
            t1:'Voor opening', t2:'Streepvrije etalages', t3:'Discreet en efficiënt' }
    },
    pharmacies: {
      fr: { eyebrow:'NETTOYAGE DE PHARMACIES', h1:'Une pharmacie <em>irréprochable</em>.<br/>La confiance de vos <em>patients</em>.',
            lead:'Officines, réserves, espaces de conseil — NR PROCLEAN assure l\'entretien et la désinfection de votre pharmacie avec des protocoles adaptés aux exigences réglementaires.',
            t1:'Protocoles certifiés', t2:'Avant ouverture', t3:'Désinfection réglementaire' },
      en: { eyebrow:'PHARMACY CLEANING', h1:'An <em>irreproachable</em> pharmacy.<br/>Your patients\' <em>trust</em>.',
            lead:'Dispensaries, stockrooms, consultation areas — NR PROCLEAN ensures the maintenance and disinfection of your pharmacy with protocols adapted to regulatory requirements.',
            t1:'Certified protocols', t2:'Before opening', t3:'Regulatory disinfection' },
      nl: { eyebrow:'APOTHEEKSCHOONMAAK', h1:'Een <em>onberispelijke</em> apotheek.<br/>Het vertrouwen van uw <em>patiënten</em>.',
            lead:'Apotheken, magazijnen, adviesruimtes — NR PROCLEAN zorgt voor het onderhoud en de desinfectie van uw apotheek met protocollen afgestemd op de wettelijke vereisten.',
            t1:'Gecertificeerde protocollen', t2:'Voor opening', t3:'Wettelijke desinfectie' }
    },
    'cabinet-medical': {
      fr: { eyebrow:'CABINETS MÉDICAUX & PARAMÉDICAUX', h1:'Un cabinet <em>désinfecté</em>.<br/>La confiance de vos patients, <em>préservée</em>.',
            lead:'Médecins, dentistes, kinésithérapeutes, psychologues — NR PROCLEAN applique des protocoles de désinfection certifiés. Votre cabinet propre avant votre premier patient.',
            t1:'Produits bactéricides & virucides', t2:'Avant l\'ouverture du cabinet', t3:'Protocoles certifiés' },
      en: { eyebrow:'MEDICAL & PARAMEDICAL PRACTICES', h1:'A <em>disinfected</em> practice.<br/>Your patients\' trust, <em>preserved</em>.',
            lead:'GPs, dentists, physiotherapists, psychologists — NR PROCLEAN applies certified disinfection protocols. Your practice clean before your first patient.',
            t1:'Bactericidal & virucidal products', t2:'Before practice opening', t3:'Certified protocols' },
      nl: { eyebrow:'MEDISCHE & PARAMEDISCHE PRAKTIJKEN', h1:'Een <em>gedesinfecteerde</em> praktijk.<br/>Het vertrouwen van uw patiënten, <em>bewaard</em>.',
            lead:'Huisartsen, tandartsen, kinesisten, psychologen — NR PROCLEAN past gecertificeerde desinfectieprotocollen toe. Uw praktijk proper voor uw eerste patiënt.',
            t1:'Bacteriedodende & virucide producten', t2:'Voor opening praktijk', t3:'Gecertificeerde protocollen' }
    },
    autres: {
      fr: { eyebrow:'AUTRES PRESTATIONS', h1:'Votre besoin.<br/>Notre <em>solution</em>.',
            lead:'Nettoyage de véhicules, remise en état, événements — NR PROCLEAN adapte son intervention à chaque situation spécifique.',
            t1:'Sur devis', t2:'Intervention rapide', t3:'Solution sur mesure' },
      en: { eyebrow:'OTHER SERVICES', h1:'Your need.<br/>Our <em>solution</em>.',
            lead:'Vehicle cleaning, restoration, events — NR PROCLEAN adapts its service to every specific situation.',
            t1:'Custom quote', t2:'Rapid response', t3:'Tailored solution' },
      nl: { eyebrow:'ANDERE DIENSTEN', h1:'Uw behoefte.<br/>Onze <em>oplossing</em>.',
            lead:'Voertuigreiniging, herstelwerk, evenementen — NR PROCLEAN past zijn dienstverlening aan elke specifieke situatie aan.',
            t1:'Op maat offerte', t2:'Snelle interventie', t3:'Maatoplossing' }
    },
    pourquoi: {
      fr: { eyebrow:'POURQUOI NR PROCLEAN', h1:'Pas un prestataire.<br/>Un <em>partenaire</em> de propreté.',
            lead:'Depuis plus de 20 ans, NR PROCLEAN répond avec rigueur et bienveillance à toutes vos exigences.' },
      en: { eyebrow:'WHY NR PROCLEAN', h1:'Not just a provider.<br/>A cleaning <em>partner</em>.',
            lead:'For over 20 years, NR PROCLEAN has responded with rigour and care to all your requirements.' },
      nl: { eyebrow:'WAAROM NR PROCLEAN', h1:'Niet zomaar een leverancier.<br/>Een schoonmaak<em>partner</em>.',
            lead:'Meer dan 20 jaar lang heeft NR PROCLEAN met strengheid en zorgzaamheid aan al uw eisen voldaan.' }
    }
  };

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return document.querySelectorAll(sel); }

  function setHTML(sel, html) {
    var el = qs(sel);
    if (el && html) el.innerHTML = html;
  }
  function setText(sel, text) {
    var el = qs(sel);
    if (el && text) el.textContent = text;
  }
  function setNodeText(el, text) {
    // Update first text node only (keeps SVG children intact)
    if (!el || !text) return;
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim()) {
        el.childNodes[i].textContent = text;
        return;
      }
    }
    el.insertBefore(document.createTextNode(text), el.firstChild);
  }
  function setLastTextNode(el, text) {
    if (!el || !text) return;
    var nodes = Array.from(el.childNodes).filter(function(n){ return n.nodeType === 3 && n.textContent.trim(); });
    if (nodes.length) nodes[nodes.length-1].textContent = text;
  }

  // ─── APPLY TRANSLATIONS ───────────────────────────────────────────────────
  function apply(lang) {
    var c = C[lang];
    if (!c) return;

    // --- NAV ---
    var navHomeLinks = qsa('.nav-home a');
    if (navHomeLinks[0]) setNodeText(navHomeLinks[0], c.nav_home);
    var svcA = qs('.nav-services > a');
    if (svcA) setNodeText(svcA, c.nav_services);
    var whyA = qs('.nav-why > a, .nav-links .nav-why a');
    if (whyA) setNodeText(whyA, c.nav_why);
    if (navHomeLinks[navHomeLinks.length-1] && navHomeLinks.length > 1)
      setNodeText(navHomeLinks[navHomeLinks.length-1], c.nav_contact);
    var cta = qs('.nav-cta');
    if (cta) setNodeText(cta, c.nav_cta);

    var dropMap = {
      'bureaux': c.nav_svc_bureaux, 'vitres': c.nav_svc_vitres,
      'apres-travaux': c.nav_svc_apres, 'hotelier': c.nav_svc_hotelier,
      'coworking': c.nav_svc_coworking, 'magasins': c.nav_svc_magasins,
      'pharmacies': c.nav_svc_pharmacies, 'cabinet-medical': c.nav_svc_cabinet,
      'industriel': c.nav_svc_industriel, 'autres': c.nav_svc_autres
    };
    qsa('.dropdown a').forEach(function(a) {
      var href = a.getAttribute('href') || '';
      Object.keys(dropMap).forEach(function(key) {
        if (href.indexOf(key) !== -1) a.textContent = dropMap[key];
      });
    });

    // --- PAGE-SPECIFIC HERO ---
    var path = window.location.pathname;
    var file = path.split('/').pop().replace('.html','') || 'index';
    var pt = P[file] && P[file][lang];
    if (pt) {
      // Eyebrow: homepage uses .hero-eyebrow, service pages use .eyebrow
      var eyeEl = qs('.eyebrow') || qs('.hero-eyebrow');
      if (eyeEl && pt.eyebrow) eyeEl.textContent = pt.eyebrow;

      // H1: homepage h1 is direct child of section, service pages use .hero-content h1
      var h1El = qs('.hero-content h1') || qs('section.hero h1') || qs('.hero h1');
      if (h1El && pt.h1) h1El.innerHTML = pt.h1;

      // Lead: homepage uses .hero-desc, service pages use .hero-lead
      var leadEl = qs('.hero-lead') || qs('.hero-desc');
      if (leadEl && pt.lead) leadEl.textContent = pt.lead;

      // Trust items: service pages use .trust-item, homepage uses .badge
      var trustItems = qsa('.hero-trust .trust-item');
      var badges = qsa('.hero-badges .badge');
      var items = trustItems.length ? trustItems : badges;
      [pt.t1, pt.t2, pt.t3, pt.t4].forEach(function(text, i) {
        if (items[i] && text) setLastTextNode(items[i], text);
      });

      // CTAs: homepage uses .hero-btns, service pages use .hero-ctas
      if (pt.cta1) {
        var b1 = qs('.hero-btns .btn-primary') || qs('.hero-ctas .btn-primary');
        if (b1) setNodeText(b1, pt.cta1);
      }
      if (pt.cta2) {
        var b2 = qs('.hero-btns .btn-ghost') || qs('.hero-ctas .btn-secondary');
        if (b2) b2.textContent = pt.cta2;
      }
    }

    // --- FOOTER ---
    var ftCopy = qs('.footer-bottom p, footer .copyright');
    if (ftCopy) ftCopy.textContent = c.footer_copy;
    var ftTagline = qs('.footer-brand p');
    if (ftTagline) ftTagline.textContent = c.footer_tagline;

    // --- LANG SWITCHER ACTIVE STATE ---
    qsa('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.documentElement.lang = lang === 'nl' ? 'nl' : lang === 'en' ? 'en' : 'fr';
  }

  // ─── INIT ────────────────────────────────────────────────────────────────
  function getLang() {
    return localStorage.getItem('nr_lang') || 'fr';
  }
  function setLang(lang) {
    localStorage.setItem('nr_lang', lang);
    apply(lang);
  }

  // Inject switcher CSS
  var style = document.createElement('style');
  style.textContent = [
    '.lang-switcher{display:flex;align-items:center;gap:3px;margin-right:10px}',
    '.lang-btn{background:none;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.45);',
    'font-size:11px;font-weight:700;letter-spacing:0.08em;padding:5px 9px;border-radius:6px;',
    'cursor:pointer;transition:all 0.15s;font-family:inherit;line-height:1}',
    '.lang-btn:hover{background:rgba(0,212,216,0.1);border-color:rgba(0,212,216,0.3);color:rgba(0,212,216,0.8)}',
    '.lang-btn.active{background:rgba(0,212,216,0.15);border-color:rgba(0,212,216,0.5);color:#00D4D8}'
  ].join('');
  document.head.appendChild(style);

  // Inject switcher HTML into nav (before nav-cta)
  document.addEventListener('DOMContentLoaded', function() {
    var navCta = qs('.nav-cta');
    if (navCta && !qs('.lang-switcher')) {
      var sw = document.createElement('div');
      sw.className = 'lang-switcher';
      sw.innerHTML = '<button class="lang-btn" data-lang="fr">FR</button>' +
                     '<button class="lang-btn" data-lang="en">EN</button>' +
                     '<button class="lang-btn" data-lang="nl">NL</button>';
      navCta.parentNode.insertBefore(sw, navCta);
      sw.addEventListener('click', function(e) {
        if (e.target.dataset.lang) setLang(e.target.dataset.lang);
      });
    }
    // Apply on load
    apply(getLang());
  });
})();
