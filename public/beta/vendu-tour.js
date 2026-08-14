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
    if (n && n.className.indexOf("on") === -1) n.click();
  }
  function goBrowse() {
    goHome();
    var t = document.querySelector('.seg [data-home="browse"]');
    if (t && t.className.indexOf("on") === -1) t.click();
  }

  function steps() {
    var s = [
      {
        intro: true,
        emoji: "🎓",
        title: "Quick tour?",
        text: "Two minutes, and you tap along on the real app. You can skip it anytime and restart it later from your profile.",
        next: "Show me around",
      },
      {
        before: goHome,
        target: function () {
          return $("#q") || $(".topbar");
        },
        title: "Find a hustle",
        text: "Search by name or service, then narrow it down with the category chips right below.",
        doit: "Try typing something",
        place: "below",
      },
      {
        before: goBrowse,
        target: function () {
          return $(".card[data-open]");
        },
        title: "Open a storefront",
        text: "Every listing opens a full storefront — services, prices, photos, reviews, and a Book button.",
        doit: "Tap this card",
        click: true,
      },
      {
        target: function () {
          return nav("market");
        },
        title: "Buy, sell & trade",
        text: "The Market is where students post items for sale, trades, and requests.",
        doit: "Tap Market",
        click: true,
        place: "above",
      },
      {
        target: function () {
          return nav("add");
        },
        title: "Post in seconds",
        text: "The ＋ button is how you list a service, sell something, or ask the campus for what you need.",
        doit: "Tap ＋",
        click: true,
        place: "above",
      },
      {
        target: function () {
          return nav("venuU");
        },
        title: "VendUniversity",
        text: "Communities, groups, your class planner, campus routes, and guides for trades, certs and starting a business.",
        doit: "Tap VendUniversity",
        click: true,
        place: "above",
      },
      {
        target: function () {
          return $("#loc");
        },
        title: "Your campus",
        text: "Everything you see is filtered to your school. Tap here to switch campuses anytime.",
        place: "below",
      },
      {
        target: function () {
          return nav("profile");
        },
        title: "You, and your storefront",
        text: "Profile holds your bookings, saved hustles, messages, and Vendor mode when you're ready to sell.",
        doit: "Tap Profile",
        click: true,
        place: "above",
      },
      {
        intro: true,
        emoji: "🚀",
        title: "That's it — go get seen",
        text: "You can replay this tour anytime from Profile → Replay tutorial.",
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
    raf;

  function cleanup() {
    [ring, pulse, card, modal].forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    ring = pulse = card = modal = null;
    if (boundEl && onTargetClick) boundEl.removeEventListener("click", onTargetClick);
    boundEl = null;
    onTargetClick = null;
    window.removeEventListener("resize", position);
    window.removeEventListener("scroll", position, true);
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
      if (n < 10)
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
      '<div class="tour-actions"><button class="tour-skip" data-tour="skip">Skip tour</button>' +
      dots() +
      '<button class="tour-next" data-tour="next">' +
      (st.click ? "Do it for me" : "Next") +
      "</button></div>";
    document.body.appendChild(ring);
    document.body.appendChild(pulse);
    document.body.appendChild(card);

    card.querySelector('[data-tour="skip"]').onclick = function () {
      end();
    };
    card.querySelector('[data-tour="next"]').onclick = function () {
      if (st.click) {
        var t = st.target();
        cleanup();
        if (t) t.click();
        i++;
        setTimeout(show, 420);
      } else {
        i++;
        show();
      }
    };

    if (st.click) {
      boundEl = el;
      onTargetClick = function () {
        i++;
        cleanup();
        setTimeout(show, 420);
      };
      el.addEventListener("click", onTargetClick);
    }

    boundTarget = el;
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
  }

  var boundTarget = null;
  function position() {
    if (!ring || !boundTarget) return;
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
    raf = requestAnimationFrame(function () {});
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
      '</div><div class="tour-actions"><button class="tour-skip" data-tour="skip">Not now</button><button class="tour-next" data-tour="next">' +
      st.next +
      "</button></div></div>";
    document.body.appendChild(modal);
    modal.querySelector('[data-tour="skip"]').onclick = function () {
      end();
    };
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
