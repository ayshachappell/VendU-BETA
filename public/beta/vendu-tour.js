/* VendU — mandatory interactive guided tour of the real app.
   Highlights real controls, lets the student tap them, and advances.
   Identical steps in the Main and BETA builds; steps whose target does not
   exist in a build (e.g. VendUniversity in BETA) are skipped automatically. */
(function () {
  var W = (window.VendU = window.VendU || {});
  var KEY = "vendu_beta_tour_done_v1";

  function $(sel) {
    return document.querySelector(sel);
  }
  function nav(tab) {
    return document.querySelector('#nav .navitem[data-tab="' + tab + '"]');
  }
  function tapNav(tab) {
    var n = nav(tab);
    if (n && n.className.indexOf("on") === -1) n.click();
  }
  function goHome() {
    closeStore();
    closeUser();
    tapNav("home");
  }
  function goFeed() {
    goHome();
    var t = document.querySelector('.seg [data-home="feed"]');
    if (t && t.className.indexOf("on") === -1) t.click();
  }
  function goBrowse() {
    goHome();
    var t = document.querySelector('.seg [data-home="browse"]');
    if (t && t.className.indexOf("on") === -1) t.click();
  }
  function closeStore() {
    var b = $("#back");
    if (b) b.click();
  }
  function closeUser() {
    var b = $("#upBack");
    if (b) b.click();
  }
  function openThread() {
    if ($("[data-user]")) return;
    goFeed();
    var c = $("[data-cmt]");
    if (c) c.click();
  }
  function openUserCard() {
    if ($("#upBack")) return;
    openThread();
    var n = $("[data-user]");
    if (n) n.click();
  }
  function openStore() {
    if ($(".cta-bar") || $(".storefront")) return;
    goBrowse();
    var c = $(".card[data-open]");
    if (c) c.click();
  }
  function goHub() {
    closeStore();
    closeUser();
    tapNav("venuU");
  }
  function goProfile() {
    closeStore();
    closeUser();
    tapNav("profile");
  }

  function postBadge() {
    return (
      $(".p-name .dealpill") ||
      $(".p-name .soonpill") ||
      $(".p-name .founderpill") ||
      $(".p-name .vendorpill") ||
      $(".p-name")
    );
  }

  function steps() {
    return [
      {
        intro: true,
        emoji: "🎓",
        title: "Let's walk the app",
        text: "A short guided tour on the real app — you tap along. Replay it anytime from Profile → Replay tutorial.",
        next: "Show me around",
      },
      {
        before: goHome,
        target: function () { return $("#q") || $(".topbar"); },
        title: "Your campus home",
        text: "Search students and services, narrow with the category chips, and tap your campus name up top to switch schools. Everything you see belongs to one campus at a time — the one tied to your .edu email.",
        place: "below",
      },
      {
        before: goHome,
        target: function () { return $(".seg"); },
        title: "Feed, Browse & Events",
        text: "Feed is what students are posting now, Browse lists every hustle and storefront, Events shows what's happening on campus.",
        doit: "Tap Feed, Browse or Events",
        click: true,
        place: "below",
      },
      {
        before: goFeed,
        target: function () { return $("[data-cmt]"); },
        title: "Like, comment & tap any name",
        text: "Every post can be liked and commented on. Names are tappable everywhere and open that student's profile, badges and listings.",
        doit: "Tap the comment icon",
        click: true,
        place: "below",
      },
      {
        before: goFeed,
        target: postBadge,
        title: "Badges tell you who's who",
        text: "🎓 Founder is one of the first 10 verified vendors on a campus, 💠 Vendor sells, ★ is VendU staff, and the campus badge shows their school. 🏷️ Sale, 🏷️ 20% off and ⏳ Ending soon show while a promo is running. Posts show up to two.",
        place: "below",
      },
      {
        before: goBrowse,
        target: function () { return $(".card[data-open]"); },
        title: "Open a storefront",
        text: "Every listing is a full storefront: services, prices, photos, reviews and payment options.",
        doit: "Tap this listing",
        click: true,
      },
      {
        before: openStore,
        target: function () { return $(".cta-bar"); },
        title: "Pay, save, message or book",
        text: "Services and prices sit at the top, then photos and reviews. Under Accepts, tap Cash App, Venmo, Zelle or PayPal to pay the vendor directly. Down here you can save the storefront, message the student or book a time — messages live in Profile → Messages, and Back returns you where you were.",
        lock: true,
        place: "above",
      },
      {
        before: goHome,
        target: function () { return nav("add"); },
        title: "Market & posting",
        text: "Market is where students post items for sale, trades, housing and jobs. The ＋ button posts a service, an item, a Request (something you're looking for that isn't on the app yet) or a campus event — add photos, then delete or mark sold anytime.",
        doit: "Tap ＋",
        click: true,
        place: "above",
      },
      {
        before: goHome,
        target: function () { return nav("profile"); },
        title: "Finish in Profile",
        text: "Everything about your account lives here — and it is all free.",
        doit: "Tap Profile to finish",
        click: true,
        place: "above",
      },
      {
        before: goProfile,
        target: function () { return $("#startsell") || $('[data-menu="setup"]') || $("#moretoggle"); },
        title: "Your profile & storefront",
        text: "Upload your photo and display name, use View my profile or View my VendU to see yourself as students do, and check 🏆 Leaderboard for the top vendors this month. Set up your storefront is where you link socials, add and resize photos, list services and prices, set a sale with an end date, and add Cash App, Venmo, Zelle or PayPal handles. Selling is optional — switching between Student and Vendor view keeps the same account.",
        next: "Finish",
        place: "above",
      },
    ];
  }

  var running = false;
  var dir = 1;
  var list = [],
    i = 0,
    ring,
    pulse,
    card,
    modal,
    onTargetClick,
    boundEl,
    boundEvent,
    lockEl,
    lockHandler,
    raf;

  function realSteps() {
    return list.filter(function (s) {
      return !s.intro;
    }).length;
  }
  function realIndex() {
    var n = 0;
    for (var k = 0; k <= i && k < list.length; k++) if (!list[k].intro) n++;
    return n;
  }

  function cleanup() {
    [ring, pulse, card, modal].forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    ring = pulse = card = modal = null;
    if (boundEl && onTargetClick) boundEl.removeEventListener(boundEvent || "click", onTargetClick);
    if (lockEl && lockHandler) lockEl.removeEventListener("click", lockHandler, true);
    lockEl = null;
    lockHandler = null;
    boundEl = null;
    boundEvent = null;
    onTargetClick = null;
    window.removeEventListener("resize", position);
    window.removeEventListener("scroll", position, true);
    boundTarget = null;
    if (tick) clearInterval(tick);
    tick = null;
    cancelAnimationFrame(raf);
  }

  function end(done) {
    running = false;
    try { if (W.onTour) W.onTour(false); } catch (e) {}
    cleanup();
    if (done !== false) {
      try {
        localStorage.setItem(KEY, "1");
      } catch (e) {}
    }
  }

  function dots() {
    var pct = Math.round(((i + 1) / Math.max(1, list.length)) * 100);
    return '<div class="tour-prog"><i style="width:' + pct + '%"></i></div>';
  }

  function show(tries) {
    cleanup();
    if (i >= list.length) return end();
    var st = list[i];
    if (st.intro) return showModal(st);
    if (st.before) {
      try {
        st.before();
      } catch (e) {}
    }

    var el = st.target();
    if (!el) {
      // The screen may still be rendering — wait a beat before giving up.
      var n = (tries || 0) + 1;
      if (n < 12)
        return setTimeout(function () {
          show(n);
        }, 150);
      // Going backwards we never skip past steps — the user asked for the
      // previous step, so show its card centred instead of rewinding further.
      if (dir < 0) return showCentered(st);
      i += dir;
      if (i >= list.length) return end();
      return show();
    }
    try {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch (e) {}

    ring = document.createElement("div");
    ring.className = "tour-ring";
    pulse = document.createElement("div");
    pulse.className = "tour-pulse";
    card = document.createElement("div");
    card.className = "tour-card";
    card.innerHTML = cardHTML(st, true);
    document.body.appendChild(ring);
    document.body.appendChild(pulse);
    document.body.appendChild(card);

    wireCard(st);

    if (st.lock) {
      lockEl = el;
      lockHandler = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
      };
      lockEl.addEventListener("click", lockHandler, true);
    }

    if (st.click || st.event) {
      boundEl = el;
      boundEvent = st.event || "click";
      onTargetClick = function () {
        dir = 1;
        i++;
        cleanup();
        setTimeout(show, 420);
      };
      el.addEventListener(boundEvent, onTargetClick);
    }

    boundTarget = el;
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    tick = setInterval(position, 250);
  }

  var boundTarget = null;
  var tick = null;
  function position() {
    if (!ring || !card) return;
    // The app re-renders whole screens; re-resolve the highlight target if it
    // was swapped out, so the tour keeps following the real control.
    if (!boundTarget || !document.body.contains(boundTarget)) {
      var st0 = list[i];
      var again = null;
      try {
        again = st0 && st0.target ? st0.target() : null;
      } catch (e) {}
      if (again) {
        if (boundEl && onTargetClick) boundEl.removeEventListener(boundEvent || "click", onTargetClick);
        boundTarget = again;
        if (onTargetClick) {
          boundEl = again;
          again.addEventListener(boundEvent || "click", onTargetClick);
        }
      } else {
        ring.style.opacity = "0";
        pulse.style.opacity = "0";
        return;
      }
    }
    ring.style.opacity = "";
    pulse.style.opacity = "";
    var r = boundTarget.getBoundingClientRect();
    var pad = 6;
    var box = {
      top: r.top - pad,
      left: r.left - pad,
      w: r.width + pad * 2,
      h: r.height + pad * 2,
    };
    [ring, pulse].forEach(function (el) {
      el.style.top = box.top + "px";
      el.style.left = box.left + "px";
      el.style.width = box.w + "px";
      el.style.height = box.h + "px";
    });
    var ch = card.offsetHeight || 180;
    var below = box.top + box.h + 14;
    var above = box.top - ch - 14;
    var top = list[i].place === "above" || below + ch > window.innerHeight - 12 ? above : below;
    if (top < 12) top = 12;
    if (top + ch > window.innerHeight - 12) top = Math.max(12, window.innerHeight - ch - 12);
    card.style.top = top + "px";
    var host = document.querySelector(".device") || document.body;
    var hr = host.getBoundingClientRect();
    var cw = card.offsetWidth || 320;
    card.style.left = Math.max(12, hr.left + (hr.width - cw) / 2) + "px";
  }


  function showCentered(st) {
    cleanup();
    card = document.createElement("div");
    card.className = "tour-card tour-card-center";
    card.innerHTML = cardHTML(st, false);
    document.body.appendChild(card);
    wireCard(st);
    var host = document.querySelector(".device") || document.body;
    var hr = host.getBoundingClientRect();
    var cw = card.offsetWidth || 320;
    card.style.left = Math.max(12, hr.left + (hr.width - cw) / 2) + "px";
    card.style.top = Math.max(12, (window.innerHeight - (card.offsetHeight || 200)) / 2) + "px";
  }

  function cardHTML(st, withDo) {
    return (
      '<div class="tour-step">Step ' +
      realIndex() +
      " of " +
      realSteps() +
      '</div><div class="tour-title">' +
      st.title +
      '</div><div class="tour-text">' +
      st.text +
      "</div>" +
      (withDo && st.doit ? '<div class="tour-do">👆 ' + st.doit + "</div>" : "") +
      '<div class="tour-actions">' +
      (i > 0 ? '<button class="tour-back" data-tour="back">Back</button>' : '<span class="tour-spacer"></span>') +
      dots() +
      (withDo && (st.click || st.event)
        ? '<span class="tour-spacer"></span>'
        : '<button class="tour-next" data-tour="next">Next</button>') +
      "</div>"
    );
  }

  function wireCard() {
    var bk = card.querySelector('[data-tour="back"]');
    if (bk) bk.onclick = goBack;
    var nx = card.querySelector('[data-tour="next"]');
    if (nx)
      nx.onclick = function () {
        dir = 1;
        i++;
        show();
      };
  }

  function goBack() {
    if (i <= 0) return;
    dir = -1;
    i--;
    cleanup();
    setTimeout(show, 120);
  }

  function showModal(st) {
    modal = document.createElement("div");
    modal.className = "tour-modal";
    modal.innerHTML =
      '<div class="tour-card"><div class="tour-emoji">' +
      st.emoji +
      '</div><div class="tour-title">' +
      st.title +
      '</div><div class="tour-text">' +
      st.text +
      '</div><div class="tour-actions">' +
      (i > 0 ? '<button class="tour-back" data-tour="back">Back</button>' : '<span class="tour-spacer"></span>') +
      dots() +
      '<button class="tour-next" data-tour="next">' +
      st.next +
      "</button></div></div>";
    document.body.appendChild(modal);
    var mb = modal.querySelector('[data-tour="back"]');
    if (mb) mb.onclick = goBack;
    modal.querySelector('[data-tour="next"]').onclick = function () {
      dir = 1;
      i++;
      show();
    };
  }

  W.startTour = function (force) {
    try {
      if (!force && localStorage.getItem(KEY)) return;
    } catch (e) {}
    if (running) return;
    running = true;
    try { if (W.onTour) W.onTour(true); } catch (e) {}
    list = steps().filter(function (s) {
      return !s.requires || document.querySelector(s.requires);
    });
    i = 0;
    setTimeout(show, 500);
  };
  W.tourSeen = function () {
    try {
      return !!localStorage.getItem(KEY);
    } catch (e) {
      return false;
    }
  };
  W.endTour = end;
})();
