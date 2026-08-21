/* VendU trust & safety: report buttons, payment warnings, moderation blocks.
   Shared by the Main and Beta builds; works with the tutorial views too. */
(function () {
  var W = (window.VendU = window.VendU || {});
  var BUILD = location.pathname.indexOf("/beta") === 0 ? "beta" : "main";
  var SUPPORT = "support@venduapp.com";
  var PAY_NOTE =
    "Payments happen directly between you and this person. VendU never holds or refunds money — double-check the handle before you send anything.";

  function myEmail() {
    try {
      var s = W.student && W.student();
      return (s && s.email) || "";
    } catch (e) {
      return "";
    }
  }

  /* ---------- report ---------- */
  W.reportContent = function (payload) {
    return fetch("/api/public/report", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: myEmail(),
        build: BUILD,
        kind: payload.kind,
        targetId: payload.targetId,
        targetName: payload.targetName || "",
        campus: payload.campus || "",
        reason: payload.reason,
        details: payload.details || "",
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .catch(function () {
        return { ok: false, message: "No connection. Try again." };
      });
  };

  var REASONS = [
    "Scam or fake payment request",
    "Harassment or hate",
    "Nudity or adult content",
    "Illegal or prohibited item",
    "Someone else's photos / impersonation",
    "Something else",
  ];

  function say(m) {
    if (typeof window.toast === "function") window.toast(m);
    else alert(m);
  }

  W.openReport = function (kind, targetId, targetName) {
    var back = document.createElement("div");
    back.className = "vu-report-back";
    back.innerHTML =
      '<div class="vu-report-card" role="dialog" aria-modal="true">' +
      '<div class="vu-report-h">Report ' +
      (targetName ? String(targetName).replace(/[<>]/g, "") : "this " + kind) +
      "</div>" +
      '<div class="vu-report-s">Reports go to VendU trust &amp; safety (' +
      SUPPORT +
      "). We review every one.</div>" +
      REASONS.map(function (r) {
        return '<button class="vu-report-r" data-reason="' + r + '">' + r + "</button>";
      }).join("") +
      '<textarea class="vu-report-t" placeholder="Anything else we should know? (optional)"></textarea>' +
      '<div class="vu-report-b"><button class="vu-report-x">Cancel</button><button class="vu-report-go" disabled>Send report</button></div>' +
      "</div>";
    document.body.appendChild(back);
    var chosen = "";
    back.querySelectorAll(".vu-report-r").forEach(function (b) {
      b.onclick = function () {
        chosen = b.dataset.reason;
        back.querySelectorAll(".vu-report-r").forEach(function (o) {
          o.classList.remove("on");
        });
        b.classList.add("on");
        back.querySelector(".vu-report-go").disabled = false;
      };
    });
    function close() {
      back.remove();
    }
    back.querySelector(".vu-report-x").onclick = close;
    back.onclick = function (e) {
      if (e.target === back) close();
    };
    back.querySelector(".vu-report-go").onclick = function () {
      if (!myEmail()) {
        say("Verify your .edu email first, then you can report.");
        return close();
      }
      var details = back.querySelector(".vu-report-t").value || "";
      close();
      W.reportContent({
        kind: kind,
        targetId: String(targetId || "unknown"),
        targetName: targetName || "",
        reason: chosen,
        details: details,
      }).then(function (res) {
        say(res && res.ok ? "Thanks — our team is reviewing this." : (res && res.message) || "Couldn't send that report.");
      });
    };
  };

  /* ---------- moderation blocks ---------- */
  var BLOCKS = { hidden: {}, deleted: {} };
  W.isBlocked = function (kind, id) {
    var k = kind + ":" + id;
    return !!(BLOCKS.hidden[k] || BLOCKS.deleted[k]);
  };
  function loadBlocks() {
    fetch("/api/public/report?build=" + BUILD + "&t=" + Date.now(), { cache: "no-store" })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res || !res.ok) return;
        BLOCKS = { hidden: {}, deleted: {} };
        (res.blocks || []).forEach(function (b) {
          BLOCKS[b.action === "deleted" ? "deleted" : "hidden"][b.kind + ":" + b.target_id] = 1;
        });
        applyBlocks();
      })
      .catch(function () {});
  }
  function applyBlocks() {
    document.querySelectorAll("[data-open]").forEach(function (el) {
      if (W.isBlocked("profile", el.dataset.open) || W.isBlocked("storefront", el.dataset.open)) el.style.display = "none";
    });
  }

  /* ---------- DOM enhancements (storefronts, payment blocks) ---------- */
  function enhance() {
    // payment safety note under every "Accepts" chip row
    document.querySelectorAll(".paychips").forEach(function (row) {
      if (row.nextElementSibling && row.nextElementSibling.classList.contains("vu-paywarn")) return;
      var n = document.createElement("div");
      n.className = "vu-paywarn";
      n.textContent = "⚠️ " + PAY_NOTE;
      row.parentNode.insertBefore(n, row.nextSibling);
    });

    // report link at the bottom of an open storefront
    document.querySelectorAll(".storefront").forEach(function (sf) {
      var body = document.querySelector(".detail-body");
      if (!body || body.querySelector(".vu-report-link")) return;
      var name = (document.querySelector(".store-name") || {}).textContent || "this storefront";
      var b = document.createElement("button");
      b.className = "vu-report-link";
      b.type = "button";
      b.textContent = "⚑ Report this storefront";
      b.onclick = function () {
        W.openReport("storefront", name.trim(), name.trim());
      };
      body.appendChild(b);
    });

    // report link on feed / market / request cards
    document.querySelectorAll(".card, .post").forEach(function (c) {
      if (c.querySelector(".vu-report-mini")) return;
      var nameEl = c.querySelector(".name, .gp-author");
      if (!nameEl) return;
      var who = (nameEl.textContent || "").trim();
      var b = document.createElement("button");
      b.className = "vu-report-mini";
      b.type = "button";
      b.title = "Report";
      b.textContent = "⚑";
      b.onclick = function (e) {
        e.stopPropagation();
        W.openReport(c.dataset.open ? "profile" : "listing", c.dataset.open || who, who);
      };
      c.appendChild(b);
    });

    applyBlocks();
  }

  function styles() {
    if (document.getElementById("vu-safety-css")) return;
    var s = document.createElement("style");
    s.id = "vu-safety-css";
    s.textContent =
      ".vu-paywarn{font-size:11.5px;line-height:1.45;color:#6B6480;margin:8px 0 2px}" +
      ".vu-report-link{display:block;width:100%;margin:14px 0 4px;padding:10px;border-radius:12px;border:1px solid #e6e1d8;background:#fff;color:#6B6480;font-size:13px;font-weight:700;cursor:pointer}" +
      ".card,.post{position:relative}" +
      ".vu-report-mini{position:absolute;top:8px;right:8px;border:0;background:transparent;color:#b6b0c2;font-size:13px;line-height:1;cursor:pointer;padding:4px;z-index:5}" +
      ".vu-report-mini:hover{color:#E11D48}" +
      ".vu-report-back{position:fixed;inset:0;background:rgba(20,14,34,.45);display:flex;align-items:flex-end;justify-content:center;z-index:9999}" +
      ".vu-report-card{background:#fff;width:100%;max-width:460px;border-radius:20px 20px 0 0;padding:20px 18px calc(18px + env(safe-area-inset-bottom,0px));max-height:86vh;overflow:auto}" +
      "@media(min-width:520px){.vu-report-back{align-items:center}.vu-report-card{border-radius:20px}}" +
      ".vu-report-h{font-weight:800;font-size:17px;margin-bottom:4px}" +
      ".vu-report-s{font-size:12.5px;color:#6B6480;margin-bottom:12px}" +
      ".vu-report-r{display:block;width:100%;text-align:left;padding:11px 13px;margin-bottom:7px;border-radius:12px;border:1px solid #e6e1d8;background:#fff;font-size:14px;font-weight:600;cursor:pointer}" +
      ".vu-report-r.on{border-color:#5A2BE0;background:#F1EBFF;color:#3f2b8c}" +
      ".vu-report-t{width:100%;min-height:64px;border:1px solid #e6e1d8;border-radius:12px;padding:10px;font:inherit;font-size:14px;margin-top:4px}" +
      ".vu-report-b{display:flex;gap:8px;margin-top:12px}" +
      ".vu-report-b button{flex:1;padding:12px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer}" +
      ".vu-report-x{border:1px solid #e6e1d8;background:#fff}" +
      ".vu-report-go{border:0;background:#5A2BE0;color:#fff}.vu-report-go:disabled{opacity:.45;cursor:default}";
    document.head.appendChild(s);
  }

  function boot() {
    styles();
    enhance();
    loadBlocks();
    var t;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(enhance, 60);
    }).observe(document.body, { childList: true, subtree: true });
    setInterval(loadBlocks, 60000);
    window.addEventListener("focus", loadBlocks);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
