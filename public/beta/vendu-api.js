/* VendU — talks to the VendU backend for students-only .edu verification. */
(function () {
  var W = (window.VendU = window.VendU || {});
  var KEY = "vendu_beta_student_v1";

  var SKEY = "vendu_session_v1";

  /* ---- signed session (proof of identity for every write) ---- */
  function saveSession(session) {
    if (!session || !session.access_token) return;
    try {
      localStorage.setItem(SKEY, JSON.stringify(session));
    } catch (e) {}
  }
  function session() {
    try {
      return JSON.parse(localStorage.getItem(SKEY) || "null");
    } catch (e) {
      return null;
    }
  }
  function clearSession() {
    try {
      localStorage.removeItem(SKEY);
    } catch (e) {}
  }
  W.saveSession = saveSession;
  W.session = session;

  function refreshSession() {
    var s = session();
    if (!s || !s.refresh_token) return Promise.resolve(null);
    return fetch("/api/public/verify/refresh", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok && res.session) {
          saveSession(res.session);
          return res.session.access_token;
        }
        /* Keep the remembered sign-in on temporary refresh failures. A user
           remains signed in until they explicitly choose Log out. */
        return null;
      })
      .catch(function () { return null; });
  }

  /* Refresh long-lived sessions before their short access token expires.
     The rotating refresh token remains in localStorage across app restarts. */
  function keepSessionAlive() {
    var s = session();
    if (!s || !s.refresh_token) return;
    var expiresAt = Number(s.expires_at || 0) * 1000;
    if (!expiresAt || expiresAt - Date.now() < 10 * 60 * 1000) refreshSession();
  }
  keepSessionAlive();
  setInterval(keepSessionAlive, 5 * 60 * 1000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") keepSessionAlive();
  });

  function request(path, body, token, retried) {
    var headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    return fetch(path, {
      method: "POST",
      cache: "no-store",
      headers: headers,
      body: JSON.stringify(body || {}),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false, message: "Something went wrong. Try again." };
        }).then(function (data) {
          if (r.status === 401 && data && data.needsAuth && !retried) {
            return refreshSession().then(function (fresh) {
              if (!fresh) return data;
              return request(path, body, fresh, true);
            });
          }
          return data;
        });
      })
      .catch(function () {
        return { ok: false, message: "No connection. Check your internet and try again." };
      });
  }

  /* Unauthenticated call (public reads: search, campus lookup, verification). */
  function post(path, body) {
    return request(path, body, null, true);
  }

  /* Authenticated call — sends the session token issued at verification.
     The server trusts that token, not any email in the body. */
  function authPost(path, body) {
    var s = session();
    if (!s || !s.access_token) {
      return refreshSession().then(function (fresh) {
        if (!fresh) {
          return {
            ok: false,
            needsAuth: true,
            message: "Sign in with your school email to continue.",
          };
        }
        return request(path, body, fresh, true);
      });
    }
    return request(path, body, s.access_token, false);
  }
  W.authPost = authPost;

  W.looksLikeEdu = function (email) {
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(String(email || "").trim().toLowerCase()) &&
      String(email).trim().toLowerCase().endsWith(".edu");
  };

  W.looksLikeEmail = function (email) {
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(String(email || "").trim().toLowerCase());
  };

  W.sendCode = function (email, build) {
    try {
      localStorage.setItem("vendu_return_build", build === "beta" ? "beta" : "main");
    } catch (e) {}
    return post("/api/public/verify/send", {
      email: email,
      build: build,
      path: location.pathname,
    });
  };

  /* Fallback: if the student tapped the emailed link instead of typing the code,
     the auth service returns them here with tokens in the URL hash. */
  W.consumeMagicLink = function () {
    var h = location.hash || "";
    if (h.indexOf("access_token=") === -1) return null;
    var params = new URLSearchParams(h.replace(/^#/, ""));
    var token = params.get("access_token");
    history.replaceState(null, "", location.pathname + location.search);
    if (!token) return null;
    try {
      var payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (!payload.email) return null;
      localStorage.setItem(KEY, JSON.stringify({ email: payload.email, at: Date.now() }));
      saveSession({
        access_token: token,
        refresh_token: params.get("refresh_token") || "",
        expires_at: Number(params.get("expires_at") || 0),
      });
      try { W.finishEmailChange(); } catch (e) {}
      return payload.email;
    } catch (e) {
      return null;
    }
  };

  W.checkCode = function (email, code, build, gradYear) {
    return post("/api/public/verify/check", {
      email: email,
      code: code,
      build: build,
      gradYear: gradYear,
    }).then(function (res) {
      if (res && res.ok) {
        saveSession(res.session);
        try {
          localStorage.setItem(
            KEY,
            JSON.stringify({ email: res.email, at: Date.now(), build: build }),
          );
        } catch (e) {}
        try { W.finishEmailChange(); } catch (e) {}
      }
      return res;
    });
  };

  /* Ask the backend whether this address finished verifying anywhere (any
     browser, phone or desktop). Unlocks devices that never saw the link. */
  W.checkVerified = function (email) {
    return post("/api/public/verify/lookup", { email: email }).then(function (res) {
      if (res && res.verified) {
        try {
          localStorage.setItem(
            KEY,
            JSON.stringify({ email: res.email || email, at: Date.now() }),
          );
        } catch (e) {}
        return true;
      }
      return false;
    });
  };

  /* Moving to a new school email: the change only lands after the student
     opens the sign-in link sent to the new address. */
  W.startEmailChange = function (email) {
    return authPost("/api/public/account/email-change", { action: "start", email: email });
  };
  W.finishEmailChange = function () {
    return authPost("/api/public/account/email-change", { action: "complete" }).catch(function () {
      return { ok: false };
    });
  };

  W.student = function () {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch (e) {
      return null;
    }
  };

  W.signOut = function () {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
    clearSession();
  };

  /* ---- password sign-in (set once after verifying, then log in anywhere) ---- */
  var PWKEY = "vendu_has_password_v1";
  W.hasPassword = function () {
    try { return !!localStorage.getItem(PWKEY); } catch (e) { return false; }
  };
  W.setPassword = function (password, confirm) {
    return authPost("/api/public/auth/password", {
      action: "set", password: password, confirm: confirm,
    }).then(function (r) {
      if (r && r.ok) { try { localStorage.setItem(PWKEY, "1"); } catch (e) {} }
      return r;
    });
  };
  W.loginPassword = function (email, password, build) {
    return post("/api/public/auth/password", {
      action: "login", email: email, password: password, build: build,
    }).then(function (res) {
      if (res && res.ok) {
        saveSession(res.session);
        try {
          localStorage.setItem(KEY, JSON.stringify({ email: res.email, at: Date.now(), build: build }));
          localStorage.setItem(PWKEY, "1");
        } catch (e) {}
      }
      return res;
    });
  };
  W.signOutEverywhere = function () {
    return authPost("/api/public/auth/password", { action: "logoutAll" })
      .then(function (r) { if (r && r.ok) W.signOut(); return r; })
      .catch(function () { return { ok: false }; });
  };

  /* ---- shared activity: bookings, reviews, referrals (cross-device) ---- */
  function myEmail() {
    var s = W.student();
    return (s && s.email) || "";
  }
  function activity(payload) {
    return post("/api/public/community/activity", payload);
  }
  function myActivity(payload) {
    return authPost("/api/public/community/activity", payload);
  }
  W.recordBooking = function (vendorId, service, build) {
    if (!myEmail()) return Promise.resolve({ ok: false });
    return myActivity({ action: "book", vendorId: vendorId, service: service, build: build });
  };
  W.postReview = function (vendorId, stars, body, build) {
    if (!myEmail()) return Promise.resolve({ ok: false });
    return myActivity({ action: "review", vendorId: vendorId, stars: stars, body: body, build: build });
  };
  W.vendorStats = function (vendorIds, build) {
    return activity({ action: "stats", vendorIds: vendorIds, build: build });
  };
  W.recordReferral = function (refCode, campus, build) {
    if (!myEmail() || !refCode) return Promise.resolve({ ok: false });
    return myActivity({ action: "referral", refCode: refCode, campus: campus, build: build });
  };
  W.referralCount = function (refCode, build) {
    if (!myEmail()) return Promise.resolve({ ok: false });
    return myActivity({ action: "referralCount", refCode: refCode, build: build });
  };

  /* ---- founder spots & leaderboard math (per school, live) ---- */
  W.founderStats = function (domain, refCode, build) {
    return activity({ action: "founders", domain: domain, refCode: refCode, build: build });
  };

  /* ---- appointment notifications (SMS when a text provider is connected) ---- */
  W.notifyAppointment = function (appt) {
    return authPost("/api/public/notify/appointment", {
      vendorId: appt.vendorId,
      when: appt.when,
      phone: appt.phone,
      build: appt.build,
    });
  };

  /* ---- persistent, participant-only direct messages and transactions ---- */
  W.messageAction = function (payload) {
    payload = payload || {};
    payload.build = payload.build || (location.pathname.indexOf("/beta") === 0 ? "beta" : "main");
    return authPost("/api/public/messages", payload);
  };
  W.listMessages = function (build) { return W.messageAction({ action: "list", build: build }); };
  W.openConversation = function (peerEmail, peerName, myName, build) { return W.messageAction({ action: "open", peerEmail: peerEmail, peerName: peerName, myName: myName, build: build }); };
  W.sendMessage = function (payload) { payload.action = "send"; return W.messageAction(payload); };
  W.markConversationRead = function (conversationId, build) { return W.messageAction({ action: "read", conversationId: conversationId, build: build }); };
  W.createMessageTransaction = function (payload) { payload.action = "createTransaction"; return W.messageAction(payload); };
  W.messageTransactionAction = function (payload) { payload.action = "transactionAction"; return W.messageAction(payload); };
  W.messageAttachmentUrl = function (conversationId, path, build) { return W.messageAction({ action: "attachmentUrl", conversationId: conversationId, path: path, build: build }); };

  /* ---- account deletion (only ever deletes the signed-in student) ---- */
  W.deleteAccount = function (build) {
    return authPost("/api/public/account/delete", { build: build });
  };

  /* ---- campuses: universal .edu support, search, theming, events ---- */
  W.resolveCampus = function (emailOrDomain, patch) {
    var body = { email: emailOrDomain, domain: emailOrDomain };
    if (patch) {
      if (patch.display_name) body.display_name = patch.display_name;
      if (patch.mascot !== undefined) body.mascot = patch.mascot;
      if (patch.accent_color) body.accent_color = patch.accent_color;
    }
    return (patch ? authPost : post)("/api/public/campus/resolve", body);
  };
  W.searchSchools = function (q) {
    var query = String(q || "").trim();
    var url = "/api/public/campus/search?q=" + encodeURIComponent(query) + "&_=" + Date.now();
    return fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { "Accept": "application/json", "Cache-Control": "no-cache" },
    }).then(function (r) {
      if (!r.ok) throw new Error("School search failed");
      return r.json();
    }).catch(function () {
      return post("/api/public/campus/search", { q: query });
    });
  };
  W.campusEvents = function (domain) {
    return post("/api/public/campus/events", { domain: domain });
  };

  /* ---- live student events, interest counts, and creator notifications ---- */
  W.eventActivity = function (payload) {
    return authPost("/api/public/events/activity", payload || {});
  };

  /* ---- real profiles (saved on the server, follow you to any device) ---- */
  W.myProfile = function () { return authPost("/api/public/profile", { action: "me" }); };
  W.saveProfile = function (patch) {
    var body = patch || {};
    body.action = "save";
    return authPost("/api/public/profile", body);
  };
  W.getProfile = function (email) { return post("/api/public/profile", { action: "get", email: email }); };
  W.presencePing = function () { return authPost("/api/public/profile", { action: "ping" }); };

  /* ---- real storefronts ---- */
  W.listVendors = function (domain, build) {
    return post("/api/public/vendor", { action: "list", domain: domain, build: build });
  };
  W.getVendor = function (id, build) {
    return post("/api/public/vendor", { action: "get", id: id, build: build });
  };
  W.myVendor = function (build) {
    return authPost("/api/public/vendor", { action: "mine", build: build });
  };
  W.publishVendor = function (vendor, build) {
    var body = vendor || {};
    body.action = "publish";
    body.build = build;
    return authPost("/api/public/vendor", body);
  };
  W.renameVendor = function (shopName, build) {
    return authPost("/api/public/vendor", { action: "rename", shopName: shopName, build: build });
  };

  /* ---- real feed: posts, likes, comments ---- */
  W.listFeed = function (domain, build) {
    var s = W.student();
    return post("/api/public/feed", {
      action: "list", domain: domain, build: build, me: (s && s.email) || "",
    });
  };
  W.createPost = function (post_, build) {
    var body = post_ || {};
    body.action = "post";
    body.build = build;
    return authPost("/api/public/feed", body);
  };
  W.likePost = function (postId, build) {
    return authPost("/api/public/feed", { action: "like", postId: postId, build: build });
  };
  W.commentPost = function (postId, text, build, identityMode) {
    return authPost("/api/public/feed", { action: "comment", postId: postId, body: text, build: build, identityMode: identityMode });
  };
  W.deletePost = function (postId, build) {
    return authPost("/api/public/feed", { action: "delete", postId: postId, build: build });
  };
  W.markSold = function (postId, sold, build) {
    return authPost("/api/public/feed", { action: "sold", postId: postId, sold: sold, build: build });
  };

  /* ---- referrals: one permanent code per account ---- */
  W.referralMe = function (build) {
    return authPost("/api/public/referral", { action: "me", build: build });
  };
  W.creditReferral = function (code, build) {
    return authPost("/api/public/referral", { action: "credit", code: code, build: build });
  };

  /* Keep the green "using the app now" dot honest. */
  setInterval(function () {
    if (document.visibilityState === "visible" && W.student()) W.presencePing();
  }, 60000);

})();
