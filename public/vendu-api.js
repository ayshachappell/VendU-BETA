/* VendU — talks to the VendU backend for students-only .edu verification. */
(function () {
  var W = (window.VendU = window.VendU || {});
  var KEY = "vendu_student_v1";

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

  W.sendCode = function (email, build) {
    return post("/api/public/verify/send", { email: email, build: build });
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
})();
