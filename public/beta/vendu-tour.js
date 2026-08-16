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

  function steps() {
    return [
      {
        intro: true,
        emoji: "🎓",
        title: "Let's walk the app",
        text: "A quick guided tour on the real app — you tap along. It runs once after you verify your school email, and you can replay it anytime from Profile → Replay tutorial.",
        next: "Show me around",
      },
      {
        before: goHome,
        target: function () {
          return $("#q") || $(".topbar");
        },
        title: "Search your campus",
        text: "Search any student by name or service, then narrow with the category chips below. Everything you see is from your own campus.",
        place: "below",
      },
      {
        before: goHome,
        target: function () {
          return $(".seg");
        },
        title: "Feed, Browse & Events",
        text: "Feed is what students are posting right now, Browse lists every hustle and storefront, Events shows what's happening on campus this week.",
        doit: "Tap Feed, Browse or Events",
        click: true,
        place: "below",
      },
      {
        before: goFeed,
        target: function () {
          return $("[data-cmt]");
        },
        title: "Like & comment",
        text: "Every post can be liked and commented on. Tap the comment icon to open the thread, then type a reply and hit Post.",
        doit: "Tap the comment icon",
        click: true,
        place: "below",
      },
      {
        before: openThread,
        target: function () {
          return $("[data-user]");
        },
        title: "Tap any student's name",
        text: "Names are tappable everywhere in VendU — in posts, comments, Market listings and communities. Tapping one opens that student's profile with their badges, active listings and a message button.",
        doit: "Tap a student's name",
        click: true,
        place: "below",
      },
      {
        before: openUserCard,
        target: function () {
          return $("#upBack");
        },
        title: "Their profile",
        text: "Here you see who they are, the communities and campus badges they carry, anything they have listed, and a button to message them. Back returns you to the feed.",
        doit: "Tap Back",
        click: true,
        place: "below",
      },
      {
        before: goBrowse,
        target: function () {
          return $(".card[data-open]");
        },
        title: "Open a storefront",
        text: "Every listing is a full storefront: services, prices, photos, reviews and payment options.",
        doit: "Tap this listing",
        click: true,
      },
      {
        before: openStore,
        target: function () {
          return $(".store-badges") || $(".shop-sign") || $(".up-badges");
        },
        title: "Badges tell you who's who",
        text: "This student carries a 🎓 Founder badge and a 💠 Vendor badge — plus deal badges like 🏷️ Sale, 🏷️ 20% off or ⏳ Ending soon when they run a promo. ★ marks VendU staff, and campus/community badges show which school, org or group a student belongs to.",
        place: "below",
      },
      {
        before: openStore,
        target: function () {
          return $(".paychips") || $(".paych") || $(".paych-btn");
        },
        title: "Pay a vendor directly",
        text: "Tap any cash-payment button on a storefront to pay the vendor directly through Cash App, Venmo, Zelle, or PayPal. The button opens their app or profile with the handle already filled in.",
        place: "below",
      },
      {
        before: openStore,
        target: function () {
          return $(".cta-bar");
        },
        title: "Save, message or book",
        text: "From any storefront you can save it, message the student directly, or book a time — messages live in Profile → Messages. After a booking you can leave an optional review.",
        lock: true,
        place: "above",
      },
      {
        before: openStore,
        target: function () {
          return $("#back");
        },
        title: "Close the storefront",
        text: "Back always returns you to where you were.",
        doit: "Tap Back",
        click: true,
        place: "below",
      },
      {
        before: goHome,
        target: function () {
          return nav("market");
        },
        title: "Buy, sell & trade",
        text: "Market is where students post items for sale, trades, campus housing and jobs — each one can be liked, commented on or messaged about.",
        doit: "Tap Market",
        click: true,
        place: "above",
      },
      {
        target: function () {
          return nav("add");
        },
        title: "Post in seconds",
        text: "The ＋ button posts a service, an item for sale, a request, or a campus event. A Request is a post for something you are looking for but do not already see on the app — like help, a specific item, or a service.",
        doit: "Tap ＋",
        click: true,
        place: "above",
      },
      {
        requires: '#nav .navitem[data-tab="venuU"]',
        target: function () {
          return nav("venuU");
        },
        title: "Communities & VendUniversity",
        text: "Join campus communities and student groups, post inside them, plan your classes and routes, and read free guides on trades, certs and starting a business.",
        doit: "Tap VendUni",
        click: true,
        place: "above",
      },
      {
        requires: '#nav .navitem[data-tab="venuU"]',
        before: goHub,
        target: function () {
          return $(".hubseg") || $("[data-hub]");
        },
        title: "Everything inside VendUniversity",
        text: "Resources are free guides, Community is campus orgs and the groups you can create, Planner holds your classes and to-dos, Routes maps your walk across campus. Joining a community adds that badge to your name.",
        doit: "Tap any tab up here",
        click: true,
        place: "below",
      },
      {
        before: goHome,
        target: function () {
          return $("#loc");
        },
        title: "Your campus",
        text: "Posts, feeds and events are funneled to the campus tied to your .edu email. Switching campuses here replaces your view with that campus — it never mixes two campuses together.",
        doit: "Tap your campus to switch",
        click: true,
        place: "below",
      },
      {
        before: goHome,
        target: function () {
          return nav("profile");
        },
        title: "Set up your profile",
        text: "Tap Profile to finish setting up your account. Upload a profile photo, set your name, and tap any vendor's cash-payment button to pay them directly. Everything is free — there are no subscriptions.",
        doit: "Tap Profile to finish",
        click: true,
        next: "Finish",
        place: "above",
      },
      {
        before: goProfile,
        target: function () {
          return $(".detail-av.up") || $(".photo-av.up");
        },
        title: "Your profile picture",
        text: "Tap the camera on your profile photo to upload a picture. Students will see it next to your posts, comments, and storefront.",
        place: "above",
      },
      {
        before: goProfile,
        target: function () {
          return $("#startsell") || $('[data-menu="setup"]') || $("#moretoggle");
        },
        title: "Your storefront tools",
        text: "Selling is free and optional. Turn on Vendor mode, or open Set up your storefront, to link your social accounts, upload, resize and delete storefront photos, and add payment handles like Cash App, Venmo, Zelle or PayPal. Student View and Vendor View are one account — just flip the switch.",
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
