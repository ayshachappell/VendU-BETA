/* VendU — interactive guided tour of the real app.
   Highlights real controls, lets the student tap them, and advances. */
(function () {
  var W = (window.VendU = window.VendU || {});
  var KEY = "vendu_beta_tour_done_v1";

  function $(sel) {
    return document.querySelector(sel);
  }
  function nav(tab) {
    return document.querySelector('#nav .navitem[data-tab="' + tab + '"]');
  }

  function goHome() {
    var n = nav("home");
    if (!n) return;
    if (n.className.indexOf("on") === -1 || !document.querySelector("#q")) n.click();
  }
  function goBrowse() {
    goHome();
    var t = document.querySelector('.seg [data-home="browse"]');
    if (t && t.className.indexOf("on") === -1) t.click();
  }

  function closeEl() {
    var sels = ["#msgBack", "#inbClose", "#cpClose", "#back", ".backbtn", "#doneEdit"];
    for (var k = 0; k < sels.length; k++) {
      var el = document.querySelector(sels[k]);
      if (el && el.offsetParent !== null) return el;
    }
    return null;
  }
  function closeOverlays() {
    for (var k = 0; k < 5; k++) {
      var el = closeEl();
      if (!el) break;
      try { el.click(); } catch (e) {}
    }
  }

  function steps() {
    var s = [
      {
        intro: true,
        emoji: "\ud83c\udf93",
        title: "Let's take the tour",
        text: "Two quick minutes on the real app \u2014 you tap along as we go. You can replay it anytime from Profile \u2192 Replay tutorial.",
        next: "Show me around",
      },
      {
        before: goHome,
        target: function () {
          return $("#q") || $(".topbar");
        },
        title: "Search your campus",
        text: "Type a name, a service or a keyword \u2014 \u201cbraids\u201d, \u201ctutor\u201d, \u201cnails\u201d \u2014 and results filter instantly. The category chips just below narrow it further.",
        doit: "Type anything in the search box",
        event: "input",
        place: "below",
      },
      {
        before: goHome,
        target: function () {
          return document.querySelector('.seg [data-home="browse"]');
        },
        title: "Feed, Browse & Events",
        text: "Feed is what's happening now, Browse is every vendor on your campus, and Events shows what's coming up.",
        doit: "Tap Browse",
        click: true,
        place: "below",
      },
      {
        target: function () {
          return $(".card[data-open]");
        },
        title: "Open a storefront",
        text: "Every listing opens a full storefront: services and prices, photos of past work, reviews, payment apps accepted, and a Book button.",
        doit: "Tap this card",
        click: true,
      },
      {
        target: function () {
          return $("#bookBtn") || $("#msgBtn") || $("#bookLink") || $(".detail-cta");
        },
        title: "Book or message",
        text: "From here you can message the vendor with questions, save them for later, or book a time straight into their calendar.",
        place: "above",
      },
      {
        target: closeEl,
        title: "Close what's open",
        text: "Storefronts, message threads, comments and group pages all open on top of the app. Their Back / \u2039 button closes them and frees the Home, Market, VendU and Profile tabs at the bottom.",
        doit: "Tap Back (or \u2039) to close this screen",
        click: true,
        place: "below",
      },
      {
        optional: true,
        target: closeEl,
        title: "Back to the main tabs",
        text: "If another screen is still stacked on top, close that one too \u2014 you're done when the bottom tab bar is fully visible.",
        doit: "Tap Back again to reach the tabs",
        click: true,
        place: "below",
      },
      {
        before: closeOverlays,
        target: function () {
          return nav("market");
        },
        title: "Buy, sell & trade",
        text: "The Market is student-to-student: textbooks, dorm gear, sneakers, plus trades and \u201clooking for\u201d requests. You meet on campus, so no shipping.",
        doit: "Tap Market",
        click: true,
        place: "above",
      },
      {
        before: closeOverlays,
        target: function () {
          return nav("add");
        },
        title: "Post in seconds",
        text: "The \uff0b button is how you list a service, sell an item, post a trade, or ask the campus for what you need. Add a photo, a price, and you're live.",
        doit: "Tap \uff0b",
        click: true,
        place: "above",
      },
            {
        before: goHome,
        target: function () {
          return $("#loc");
        },
        title: "Switch campuses",
        text: "Everything you see \u2014 vendors, market posts, events \u2014 is filtered to your school. Tap your campus name to look at another one.",
        doit: "Tap your campus name",
        event: "click",
        place: "below",
      },
      {
        before: function(){closeOverlays();goHome();},
        target: function () {
          return nav("profile");
        },
        title: "Your profile",
        text: "Profile holds your bookings, saved hustles, messages, market posts \u2014 and Vendor mode when you're ready to sell.",
        doit: "Tap Profile",
        click: true,
        place: "above",
      },
      {
        target: function () {
          return $("#profSave") || $("#startsell") || $(".submit");
        },
        title: "Save your changes",
        text: "Edit your name, photo and details, then tap Save \u2014 nothing is stored until you do. Vendors get the same Save button on their storefront setup.",
        place: "above",
      },
      {
        intro: true,
        emoji: "\ud83d\ude80",
        title: "That's it \u2014 go get seen",
        text: "You're verified and ready. Replay this tour anytime from Profile \u2192 Replay tutorial.",
        next: "Start using VendU",
      },
    ];
    return s;
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
      if (n < (st.optional ? 2 : 10))
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
      i +
      " of " +
      (list.length - 2) +
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

    var nextBtn = card.querySelector('[data-tour="next"]');
    if (nextBtn)
      nextBtn.onclick = function () {
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
    list = steps();
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
