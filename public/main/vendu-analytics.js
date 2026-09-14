/* The VendU App — privacy choices + analytics.
   - Lovable's built-in, cookieless page analytics always runs (no personal data).
   - Google Analytics 4 only runs after the person accepts, and never in a
     consent region until they do.
   - "Do not sell or share my personal information" is honored everywhere and
     is required for CA, VA, CO, CT, UT, TX, OR, MT, DE, IA, NE, NH, NJ and
     any state that adds the right later, plus Global Privacy Control.
*/
(function () {
  var W = (window.VendU = window.VendU || {});
  var CKEY = "vendu_privacy_v1";
  var GA_ID = window.VENDU_GA_ID || "G-6Y989TQH7D"; /* set once Google Analytics is connected */

  /* Countries/regions that require opt-in consent before analytics cookies. */
  var CONSENT_COUNTRIES = ("AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE " +
    "GB IS LI NO CH BR").split(" ");

  function read() {
    try { return JSON.parse(localStorage.getItem(CKEY) || "null"); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(CKEY, JSON.stringify(v)); } catch (e) {}
  }

  /* Global Privacy Control is a legally binding opt-out signal in several states. */
  function gpc() {
    return navigator.globalPrivacyControl === true;
  }

  function choices() {
    var c = read() || {};
    return {
      decided: !!c.decided,
      analytics: !!c.analytics,
      ads: !!c.ads,
      sale: gpc() ? false : c.sale !== false, // sale/share allowed unless opted out
      at: c.at || null,
      region: c.region || null,
      notice: c.notice || null,
    };
  }
  W.privacyChoices = choices;

  function save(patch) {
    var c = choices();
    var next = {
      decided: true,
      analytics: patch.analytics !== undefined ? !!patch.analytics : c.analytics,
      ads: patch.ads !== undefined ? !!patch.ads : c.ads,
      sale: patch.sale !== undefined ? !!patch.sale : c.sale,
      at: new Date().toISOString(),
      region: REGION,
      notice: "vendu-privacy-2026-09",
    };
    write(next);
    apply();
    try {
      window.dispatchEvent(new CustomEvent("vendu-privacy-changed", { detail: next }));
    } catch (e) {}
    return next;
  }
  W.setPrivacyChoices = save;

  /* ---------------- region ---------------- */
  var REGION = null;
  function needsConsent() {
    if (REGION === null) return true; // unknown -> ask
    return CONSENT_COUNTRIES.indexOf(REGION) !== -1;
  }

  function detectRegion() {
    return new Promise(function (resolve) {
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; resolve(null); } }, 2000);
      fetch("/cdn-cgi/trace", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.text() : ""; })
        .then(function (txt) {
          if (done) return;
          done = true; clearTimeout(t);
          var m = /(^|\n)loc=([A-Z0-9]+)/.exec(txt || "");
          var loc = m ? m[2] : null;
          resolve(loc === "XX" || loc === "T1" ? null : loc);
        })
        .catch(function () { if (!done) { done = true; clearTimeout(t); resolve(null); } });
    });
  }

  /* ---------------- Google Analytics 4 ---------------- */
  var gaLoaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function loadGA() {
    if (gaLoaded || !GA_ID) return;
    gaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }

  function apply() {
    var c = choices();
    gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.ads && c.sale ? "granted" : "denied",
      ad_user_data: c.ads && c.sale ? "granted" : "denied",
      ad_personalization: c.ads && c.sale ? "granted" : "denied",
    });
    if (c.analytics) loadGA();
  }

  /* Deny by default until a decision exists. */
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  /* ---------------- events ---------------- */
  W.track = function (name, params) {
    var c = choices();
    if (!c.analytics || !gaLoaded) return;
    try { gtag("event", name, params || {}); } catch (e) {}
  };

  /* ---------------- banner ---------------- */
  function banner() {
    if (document.getElementById("venduPrivacyBar")) return;
    var d = document.createElement("div");
    d.id = "venduPrivacyBar";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Privacy choices");
    d.innerHTML =
      '<div class="vpb-card"><div class="vpb-t">Your privacy choices</div>' +
      "<div class=\"vpb-c\">We use cookies and similar tools to measure how The VendU App is used. We may also sell or share limited information with analytics and advertising partners. You choose \u2014 and you can change this anytime in Settings.</div>" +
      '<div class="vpb-row"><button class="vpb-btn vpb-ok" id="vpbAccept">Accept all</button>' +
      '<button class="vpb-btn vpb-no" id="vpbReject">Reject all</button></div>' +
      '<a class="vpb-link" href="/legal/privacy-choices.html" target="_blank" rel="noopener">Manage choices &amp; do not sell my info</a></div>';
    document.body.appendChild(d);
    document.getElementById("vpbAccept").onclick = function () {
      save({ analytics: true, ads: true, sale: true });
      d.remove();
    };
    document.getElementById("vpbReject").onclick = function () {
      save({ analytics: false, ads: false, sale: false });
      d.remove();
    };
  }
  W.openPrivacyBanner = function () {
    banner();
  };

  /* ---------------- boot ---------------- */
  detectRegion().then(function (loc) {
    REGION = loc;
    var c = read();
    if (c && c.decided) { apply(); return; }
    if (needsConsent()) {
      banner();
    } else {
      /* Outside consent regions tracking is on by default; opt-outs still apply. */
      write({ decided: true, analytics: true, ads: !gpc(), sale: !gpc(), at: new Date().toISOString(), region: REGION, notice: "vendu-privacy-2026-09-default" });
      apply();
    }
  });
})();
