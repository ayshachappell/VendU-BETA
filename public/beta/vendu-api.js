/* VendU — talks to the VendU backend for students-only .edu verification. */
(function () {
  var W = (window.VendU = window.VendU || {});
  var KEY = "vendu_beta_student_v1";

  function post(path, body) {
    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false, message: "Something went wrong. Try again." };
        });
      })
      .catch(function () {
        return { ok: false, message: "No connection. Check your internet and try again." };
      });
  }

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
        try {
          localStorage.setItem(
            KEY,
            JSON.stringify({ email: res.email, at: Date.now(), build: build }),
          );
        } catch (e) {}
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
  };

  /* ---- shared activity: bookings, reviews, referrals (cross-device) ---- */
  function myEmail() {
    var s = W.student();
    return (s && s.email) || "";
  }
  function activity(payload) {
    return post("/api/public/community/activity", payload);
  }
  W.recordBooking = function (vendorId, service, build) {
    if (!myEmail()) return Promise.resolve({ ok: false });
    return activity({ action: "book", email: myEmail(), vendorId: vendorId, service: service, build: build });
  };
  W.postReview = function (vendorId, stars, body, build) {
    if (!myEmail()) return Promise.resolve({ ok: false });
    return activity({ action: "review", email: myEmail(), vendorId: vendorId, stars: stars, body: body, build: build });
  };
  W.vendorStats = function (vendorIds, build) {
    return activity({ action: "stats", vendorIds: vendorIds, build: build });
  };
  W.recordReferral = function (refCode, campus, build) {
    if (!myEmail() || !refCode) return Promise.resolve({ ok: false });
    return activity({ action: "referral", email: myEmail(), refCode: refCode, campus: campus, build: build });
  };
  W.referralCount = function (refCode, build) {
    if (!myEmail()) return Promise.resolve({ ok: false });
    return activity({ action: "referralCount", email: myEmail(), refCode: refCode, build: build });
  };

})();
