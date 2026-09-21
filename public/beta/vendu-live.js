/* VendU live layer — brings real profiles, storefronts, feed posts and
   referrals from the backend into the app's screens. Demo content is left
   untouched; anything from the server is marked live:1. */
(function () {
  var L = (window.VenduLive = window.VenduLive || {});
  var ids = {}; /* uuid -> stable numeric id used by the screens */
  var nextId = 100000;

  function numId(uuid) {
    if (!uuid) return 0;
    if (!ids[uuid]) ids[uuid] = ++nextId;
    return ids[uuid];
  }
  function api() { return window.VendU || null; }
  function build() { return typeof BUILD === "string" ? BUILD : "main"; }
  function signedIn() {
    var s = api() && VendU.student();
    return !!(s && s.email);
  }
  function domain() {
    try {
      var e = String(state.acctEmail || "").toLowerCase();
      var d = e.split("@")[1] || "";
      if (d && d.indexOf("integroservicegroup") === -1 && /\.edu$/.test(d)) return d;
      return (state.campus && state.campus.domain) || d || "";
    } catch (e) { return ""; }
  }
  function campusId() {
    try { return (state.campus && state.campus.id) || ""; } catch (e) { return ""; }
  }
  /* campus the user is BROWSING (location pill) — reads follow this */
  function viewDomain() {
    try {
      var d = (state.campus && state.campus.domain) || "";
      return d || domain();
    } catch (e) { return domain(); }
  }
  function initialOf(n) { return String(n || "?").trim().charAt(0).toUpperCase() || "?"; }
  function ago(iso) {
    var t = Date.parse(iso || "") || Date.now();
    var m = Math.max(0, Math.round((Date.now() - t) / 60000));
    if (m < 1) return "Just now";
    if (m < 60) return m + "m ago";
    if (m < 1440) return Math.round(m / 60) + "h ago";
    return Math.round(m / 1440) + "d ago";
  }
  function money(cents, label) {
    if (label) return label;
    if (cents == null) return "";
    return "$" + (Number(cents) / 100).toFixed(Number(cents) % 100 ? 2 : 0);
  }
  function redraw() { try { render(); } catch (e) {} }

  /* ---- storefronts ---- */
  function applyVendors(list) {
    var cid = campusId();
    /* drop live vendors we are replacing */
    for (var i = HUSTLES.length - 1; i >= 0; i--) if (HUSTLES[i].live) HUSTLES.splice(i, 1);
    (list || []).forEach(function (v) {
      var me = api() && VendU.student();
      var mine = me && me.email && String(v.ownerEmail).toLowerCase() === String(me.email).toLowerCase();
      var services = (v.services || []).map(function (s) {
        return [s.title, money(s.priceCents, s.priceLabel)];
      });
      var prices = (v.services || [])
        .map(function (s) { return s.priceCents; })
        .filter(function (p) { return p != null; });
      var priceLabel = prices.length
        ? prices.length > 1 && Math.min.apply(null, prices) !== Math.max.apply(null, prices)
          ? money(Math.min.apply(null, prices)) + "–" + money(Math.max.apply(null, prices)).replace("$", "")
          : money(prices[0])
        : "";
      var pays = [];
      Object.keys(v.payments || {}).forEach(function (k) {
        if (v.payments[k]) pays.push({ app: k, handle: String(v.payments[k]) });
      });
      HUSTLES.push({
        id: numId(v.id),
        uuid: v.id,
        live: 1,
        me: !!mine,
        owner: String(v.ownerEmail || "").toLowerCase(),
        name: v.shopName,
        init: initialOf(v.shopName),
        cat: v.category || "Other",
        v: 1,
        lic: 0,
        dist: null,
        pickup: v.pickupLabel || "",
        lat: typeof v.pickupLat === "number" ? v.pickupLat : null,
        lng: typeof v.pickupLng === "number" ? v.pickupLng : null,
        offer: v.tagline || "",
        price: priceLabel,
        rating: "",
        reviews: 0,
        jobs: 0,
        since: String(new Date(v.createdAt || Date.now()).getFullYear()),
        c: 0,
        avatar: v.avatarUrl || "",
        avail: v.live ? 1 : 0,
        pays: pays,
        socials: v.socials || {},
        bio: v.tagline || "",
        badges: v.badges || [],
        boost: v.boosted ? 1 : 0,
        services: services,
        campus: cid,
        gallery: (v.photos || []).map(function (p) {
          return { src: p.url, fit: "cover", label: p.caption || "" };
        }),
      });
    });
  }

  /* ---- feed, items and requests ---- */
  function applyPosts(posts) {
    var cid = campusId();
    for (var i = FEED.length - 1; i >= 0; i--) if (FEED[i].live) FEED.splice(i, 1);
    for (var j = GOODS.length - 1; j >= 0; j--) if (GOODS[j].live) GOODS.splice(j, 1);
    for (var k = REQUESTS.length - 1; k >= 0; k--) if (REQUESTS[k].live) REQUESTS.splice(k, 1);

    (posts || []).forEach(function (p) {
      var who = p.authorName || String(p.authorEmail || "").split("@")[0];
      if (p.kind === "item") {
        GOODS.push({
          id: numId(p.id), uuid: p.id, live: 1, emoji: "🛍️", name: p.title,
          price: p.priceLabel || "", tag: (p.badges && p.badges[0]) || "Sell",
          c: 0, by: who, bi: initialOf(who), bc: 5, campus: cid,
          avatar: p.authorAvatar || "", avail: p.authorLive ? 1 : 0,
          img: p.imageUrl || "", sold: !!p.sold, mine: isMine(p.authorEmail),
        });
        return;
      }
      if (p.kind === "request") {
        REQUESTS.push({
          id: numId(p.id), uuid: p.id, live: 1, who: who, in: initialOf(who),
          c: 3, barter: 0, txt: p.body || p.title, campus: cid, img: p.imageUrl || "",
          mine: isMine(p.authorEmail), avatar: p.authorAvatar || "", avail: p.authorLive ? 1 : 0,
        });
        return;
      }
      /* service, promo and vendor updates ride the main feed */
      var vendor = HUSTLES.filter(function (h) { return h.uuid && h.uuid === p.vendorId; })[0];
      if (!vendor) {
        /* older or unlinked storefront updates: match the author's shop */
        var mail = String(p.authorEmail || "").toLowerCase();
        vendor = HUSTLES.filter(function (h) { return h.owner && mail && h.owner === mail; })[0];
      }
      if (!vendor && isMine(p.authorEmail)) {
        vendor = HUSTLES.filter(function (h) { return h.id === "me" || h.me === 1; })[0];
      }
      if (!vendor) return;
      FEED.push({
        id: numId(p.id), uuid: p.id, live: 1, s: vendor.id,
        promo: (p.badges && p.badges[0]) || "",
        when: ago(p.createdAt), ts: Date.parse(p.createdAt || "") || Date.now(),
        text: p.body || p.title, likes: p.likes || 0, liked: !!p.likedByMe,
        comments: (p.comments || []).map(function (c) { return [c.name || "A student", c.body]; }),
      });
    });
    FEED.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }

  function isMine(email) {
    var me = api() && VendU.student();
    return !!(me && me.email && String(email).toLowerCase() === String(me.email).toLowerCase());
  }

  /* ---- pull everything for the current campus ---- */
  var busy = false;
  L.pull = function (thenRender) {
    if (busy || !api()) return Promise.resolve();
    /* browse whatever campus the location pill shows; writes stay on the
       student's home campus (see domain() used by L.post/L.publish) */
    var dom = viewDomain();
    if (!dom) return Promise.resolve();
    busy = true;
    return Promise.all([
      VendU.listVendors(dom, build()),
      VendU.listFeed(dom, build()),
    ])
      .then(function (res) {
        if (res[0] && res[0].ok) applyVendors(res[0].vendors);
        if (res[1] && res[1].ok) applyPosts(res[1].posts);
        if (thenRender !== false) redraw();
      })
      .catch(function () {})
      .then(function () { busy = false; });
  };

  /* ---- my profile ---- */
  L.loadProfile = function () {
    if (!signedIn()) return Promise.resolve();
    return VendU.myProfile().then(function (r) {
      if (!r || !r.ok || !r.profile) return;
      var p = r.profile;
      if (p.studentName || p.displayName) state.studentName = state.studentName || p.studentName || p.displayName;
      if (p.avatarUrl) state.avatar = state.avatar || p.avatarUrl;
      if (p.bio) state.about = p.bio;
      if (p.socials && typeof p.socials === "object") {
        state.socials = Object.keys(p.socials).filter(function (k) { return p.socials[k]; }).map(function (k) {
          var labels = { instagram: "Instagram", tiktok: "TikTok", snapchat: "Snapchat", x: "X/Twitter", website: "Website" };
          return { type: labels[k] || k, url: String(p.socials[k]) };
        });
      }
      if (r.refCode) state.refCode = r.refCode;
      /* home school follows the account, not the device */
      if (p.campusDomain) {
        try {
          state.homeCampus = { domain: p.campusDomain, name: p.campusName || p.campusDomain };
          localStorage.setItem("vendu_home_campus", JSON.stringify(state.homeCampus));
          localStorage.setItem("vendu_home_campus_ok", "1");
        } catch (e) {}
      }
      redraw();
    }).catch(function () {});
  };

  /* Vendor Name typed before a storefront exists is kept on this device
     until publishing creates the storefront row. */
  function pendingKey() { return "vendu_vendor_name_" + build(); }
  function readPending() { try { return localStorage.getItem(pendingKey()) || ""; } catch (e) { return ""; } }
  function clearPending() { try { localStorage.removeItem(pendingKey()); } catch (e) {} }

  L.loadVendor = function () {
    if (!signedIn()) return Promise.resolve();
    return VendU.myVendor(build()).then(function (r) {
      if (!r || !r.ok || !r.vendor) {
        var pend = readPending();
        if (pend && !state.vendorName) { state.vendorName = pend; redraw(); }
        return;
      }
      state.vendorName = r.vendor.shopName || state.vendorName;
      state.vendorUuid = r.vendor.id || state.vendorUuid || "";
      state.pickupLabel = r.vendor.pickupLabel || state.pickupLabel || "";
      if (typeof r.vendor.pickupLat === "number") state.pickupLat = r.vendor.pickupLat;
      if (typeof r.vendor.pickupLng === "number") state.pickupLng = r.vendor.pickupLng;
      state.hasStore = true;
      clearPending();
      redraw();
    }).catch(function () {});
  };

  L.saveStudentName = function () {
    if (!signedIn()) return Promise.resolve({ ok: true });
    return VendU.saveProfile({ studentName: state.studentName || "" });
  };

  L.saveVendorName = function () {
    var name = String(state.vendorName || "").trim();
    if (!signedIn()) return Promise.resolve({ ok: true });
    if (state.hasStore && VendU.renameVendor) return VendU.renameVendor(name, build());
    try { localStorage.setItem(pendingKey(), name); } catch (e) {}
    return Promise.resolve({ ok: true });
  };

  L.saveProfile = function (extra) {
    if (!signedIn()) return Promise.resolve();
    var payments = {};
    (state.pays || []).forEach(function (p) {
      if (p && p.app) payments[String(p.app).toLowerCase().replace(/[^a-z]/g, "")] = p.handle || "";
    });
    var socials = {};
    (state.socials || []).forEach(function (s) {
      if (s && s.type) {
        var key = String(s.type).toLowerCase().replace(/[^a-z]/g, "");
        if (key === "xtwitter") key = "x";
        socials[key] = s.url || "";
      }
    });
    var body = {
      studentName: state.studentName || "",
      bio: state.about || "",
      avatarUrl: state.avatar || "",
      phone: state.phone || "",
      campusDomain: domain(),
      campusName: (state.campus && state.campus.name) || "",
      payments: payments,
      socials: socials,
    };
    Object.keys(extra || {}).forEach(function (k) { body[k] = extra[k]; });
    return VendU.saveProfile(body).catch(function () {});
  };

  /* ---- publish my storefront so everyone on campus sees it ---- */
  L.publish = function () {
    if (!signedIn()) return Promise.resolve();
    var payments = {};
    (state.pays || []).forEach(function (p) {
      if (p && p.app) payments[String(p.app).toLowerCase().replace(/[^a-z]/g, "")] = p.handle || "";
    });
    var services = (state.services || []).map(function (s) {
      var price = parseFloat(String(s[1] || "").replace(/[^0-9.]/g, ""));
      return {
        title: s[0],
        price: isNaN(price) ? null : price,
        priceLabel: s[1] || "",
        promo: state.promo && state.promo.type !== "none" ? String(state.promo.pct || "") + "% off" : "",
      };
    });
    var photos = (state.gallery || []).map(function (g) {
      return { url: g.src, caption: g.label || "" };
    });
    return VendU.publishVendor({
      shopName: state.vendorName || "",
      tagline: state.about || "",
      category: state.formCat || "Other",
      accentColor: state.themeColor || "",
      layout: state.sfView || "window",
      avatarUrl: state.avatar || "",
      badges: (state.badges || []).slice(0, 2),
      availability: "",
      pickupLabel: state.pickupLabel || "",
      pickupLat: state.pickupLat == null ? null : state.pickupLat,
      pickupLng: state.pickupLng == null ? null : state.pickupLng,
      payments: payments,
      campusDomain: domain(),
      services: services,
      photos: photos,
    }, build()).then(function (r) {
      if (r && r.ok) {
        if (r.vendor && r.vendor.id) state.vendorUuid = r.vendor.id;
        clearPending();
        L.saveProfile({ vendorMode: true });
        L.pull();
        L.referrals();
      } else if (r && r.message) {
        try { toast(r.message); } catch (e) {}
      }
      return r;
    }).catch(function () {});
  };

  /* ---- feed writes ---- */
  L.post = function (post) {
    if (!signedIn()) return Promise.resolve();
    post = post || {};
    post.domain = post.domain || viewDomain();
    post.authorName = post.identityMode === "vendor" ? (state.vendorName || "") : (state.studentName || "");
    post.identityMode = post.identityMode || "student";
    return VendU.createPost(post, build()).then(function (r) {
      if (r && r.ok) L.pull();
      return r;
    }).catch(function () {});
  };
  L.like = function (uuid) {
    if (!uuid || !signedIn()) return Promise.resolve();
    return VendU.likePost(uuid, build()).catch(function () {});
  };
  L.comment = function (uuid, text) {
    if (!uuid || !signedIn()) return Promise.resolve();
    return VendU.commentPost(uuid, text, build(), state.isSeller ? "vendor" : "student").catch(function () {});
  };

  /* ---- referrals & founder spots, straight from the backend ---- */
  L.referrals = function () {
    if (!signedIn() || !VendU.referralMe) return Promise.resolve();
    return VendU.referralMe(build()).then(function (r) {
      if (!r || !r.ok) return;
      state.refCode = r.code;
      state.refLink = r.link;
      state.referrals = r.myReferrals || 0;
      state.founderTotal = r.claimed || 0;
      try { FOUNDERS = Math.min(FOUNDER_CAP, r.claimed || 0); } catch (e) {}
      if (r.founderNumber) state.founderNum = r.founderNumber;
      state.lbRank = r.myRank || 0;
      state.lbRows = (r.leaderboard || [])
        .filter(function (x) { return (x.referrals || 0) > 0; })
        .map(function (x) { return [x.me ? "You" : x.name, x.referrals, !!x.founder]; });
      try { syncFounder(); } catch (e) {}
      redraw();
    }).catch(function () {});
  };

  /* Credit whoever invited this student — the server counts it once. */
  L.creditInvite = function () {
    if (!signedIn() || !VendU.creditReferral) return;
    var code = "";
    try { code = localStorage.getItem("vendu_ref_from") || ""; } catch (e) {}
    if (!code) return;
    VendU.creditReferral(code, build()).then(function (r) {
      if (r && r.ok) {
        try { localStorage.removeItem("vendu_ref_from"); } catch (e) {}
        L.referrals();
      }
    }).catch(function () {});
  };

  /* Everything a signed-in student needs, on start and after verifying. */
  L.start = function () {
    if (!signedIn()) return;
    L.loadProfile();
    L.loadVendor();
    L.creditInvite();
    L.referrals();
    L.pull();
  };

  setInterval(function () {
    if (document.visibilityState === "visible" && signedIn()) L.referrals();
  }, 60000);
})();
