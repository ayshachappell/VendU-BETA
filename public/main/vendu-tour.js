/* VendU — mandatory interactive guided tour of the real app.
   Highlights real controls, lets the student tap them, and advances.
   Identical steps in the Main and BETA builds; steps whose target does not
   exist in a build (e.g. VendUniversity in BETA) are skipped automatically. */
(function () {
  var W = (window.VendU = window.VendU || {});
  var KEY = "vendu_tour_done_v1";

  function $(sel) {
    return document.querySelector(sel);
  }
  function nav(tab) {
    return document.querySelector('#nav .navitem[data-tab="' + tab + '"]');
  }
  function goHome() {
    var n = nav("home");
    if (n && n.className.indexOf("on") === -1) n.click();
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
        doit: "Type anything in the search box",
        event: "input",
        place: "below",
      },
      {
        before: goHome,
        target: function () {
          return $(".seg");
        },
        title: "Feed, Browse & Events",
        text: "Feed is what students are posting right now, Browse lists every hustle and storefront, Events shows what's happening on campus this week.",
        place: "below",
      },
      {
        before: goFeed,
        target: function () {
          return $("[data-cmt]");
        },
        title: "Like & comment",
        text: "Every post can be liked and commented on. Tap the comment icon to open the thread, then type a reply and hit Post — tapping a name opens that student's profile.",
        doit: "Tap the comment icon",
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
        target: function () {
          return $(".storefront") || $(".awning") || $(".card");
        },
        title: "Badges tell you who's who",
        text: "🎓 marks a Founder, ★ marks VendU staff, and campus/community badges show which school, org or group a student belongs to. Badges show on names, profiles and storefronts.",
        place: "below",
      },
      {
        target: function () {
          return $(".cta-bar");
        },
        title: "Save, message or book",
        text: "From any storefront you can save it, message the student directly, or book a time — messages live in Profile → Messages.",
        place: "above",
      },
      {
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
        text: "The ＋ button posts a service, an item for sale, a request, or a campus event.",
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
        target: function () {
          return $('[data-hub="communities"]') || $("[data-hub]");
        },
        title: "Join a community",
        text: "Communities are campus orgs; groups are smaller circles you can create. Joining adds that badge to your name so students can see what you're part of.",
        place: "below",
      },
      {
        before: goHome,
        target: function () {
          return $("#loc");
        },
        title: "Your campus",
        text: "Posts, feeds and events are funneled to the campus tied to your .edu email. Switching campuses here replaces your view with that campus — it never mixes two campuses together.",
        place: "below",
      },
      {
        intro: true,
        emoji: "🛍️",
        title: "One account, two views",
        text: "Selling is optional and free — browsing, buying, trading and booking always are. If you do want a storefront, flip on Vendor mode in Profile: it's the same account, you just switch between Student view and Vendor view to reach bookings, services and payouts.",
        next: "Got it",
      },
      {
        intro: true,
        emoji: "🏆",
        title: "Founders & the leaderboard",
        text: "Founders are the first verified student vendors on a campus. Refer other vendors with your invite link to claim a founder spot — founders keep a 🎓 badge everywhere they post, plus a monthly Boost. The leaderboard in Profile ranks students by vendors referred so you can see where you stand.",
        next: "Last step",
      },
      {
        before: goHome,
        target: function () {
          return nav("profile");
        },
        title: "Set up your profile",
        text: "Profile is your account, storefront, Student/Vendor switch, bookings, saved hustles, messages, leaderboard, Replay tutorial and Log out. Finish here and you're live.",
        doit: "Tap Profile to set up your account",
        click: true,
        place: "above",
      },
    ];
  }
  var running = false;
  var list = [],
    i = 0,
    ring,
    pulse,
    card,
    modal,
    onTargetClick,
    boundEl,
    boundEvent,
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
    return (
      '<div class="tour-dots">' +
      list
        .map(function (_, n) {
          return '<span class="tour-dot' + (n === i ? " on" : "") + '"></span>';
        })
        .join("") +
      "</div>"
    );
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
      if (n < 8)
        return setTimeout(function () {
          show(n);
        }, 150);
      i++;
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
    card.innerHTML =
      '<div class="tour-step">Step ' +
      realIndex() +
      " of " +
      realSteps() +
      '</div><div class="tour-title">' +
      st.title +
      '</div><div class="tour-text">' +
      st.text +
      "</div>" +
      (st.doit ? '<div class="tour-do">👆 ' + st.doit + "</div>" : "") +
      '<div class="tour-actions">' +
      dots() +
      (st.click ? "" : '<button class="tour-next" data-tour="next">Next</button>') +
      "</div>";
    document.body.appendChild(ring);
    document.body.appendChild(pulse);
    document.body.appendChild(card);

    var nx = card.querySelector('[data-tour="next"]');
    if (nx)
      nx.onclick = function () {
        i++;
        show();
      };

    if (st.click || st.event) {
      boundEl = el;
      boundEvent = st.event || "click";
      onTargetClick = function () {
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
      '</div><div class="tour-actions"><button class="tour-next" data-tour="next">' +
      st.next +
      "</button></div></div>";
    document.body.appendChild(modal);
    modal.querySelector('[data-tour="next"]').onclick = function () {
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
