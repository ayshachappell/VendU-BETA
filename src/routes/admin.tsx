import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "The VendU App Moderation Console" },
      { name: "description", content: "Admin-only console to review reported VendU profiles and listings." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "The VendU App Moderation Console" },
      { property: "og:description", content: "Admin-only console for VendU trust & safety." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminConsole,
});

type Report = {
  id: string;
  kind: string;
  target_id: string;
  target_name: string | null;
  build: string;
  campus: string | null;
  reporter_email: string | null;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
};
type Block = { id: string; kind: string; target_id: string; build: string; action: string };

const TOKEN_KEY = "vendu_admin_token";

async function api(body: Record<string, unknown>) {
  const res = await fetch("/api/public/admin/moderate", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json().catch(() => ({ ok: false, message: "Network error." }))) as {
    ok: boolean;
    message?: string;
    token?: string;
    reports?: Report[];
    blocks?: Block[];
  };
}

function AdminConsole() {
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("open");
  const [reports, setReports] = useState<Report[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY) ?? "");
  }, []);

  async function load(t = token, s = status) {
    if (!t) return;
    const r = await api({ action: "list", token: t, status: s });
    if (!r.ok) {
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setMsg(r.message ?? "Session expired.");
      return;
    }
    setReports(r.reports ?? []);
    setBlocks(r.blocks ?? []);
  }

  useEffect(() => {
    void load(token, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  async function act(rep: Report, decision: string) {
    await api({
      action: "act",
      token,
      reportId: rep.id,
      kind: rep.kind,
      targetId: rep.target_id,
      build: rep.build,
      decision,
    });
    void load();
  }

  if (!token) {
    return (
      <main style={wrap}>
        <h1 style={h1}>VendU moderation</h1>
        <p style={sub}>Admin addresses only. We email you a one-time code.</p>
        <input
          style={input}
          placeholder="you@integroservicegroup.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {sent && (
          <input
            style={input}
            placeholder="6-digit code"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        )}
        <button
          style={btn}
          onClick={async () => {
            setMsg("");
            if (!sent) {
              const r = await api({ action: "login", email });
              setMsg(r.ok ? "Code sent — check your email." : (r.message ?? "Failed."));
              if (r.ok) setSent(true);
              return;
            }
            const r = await api({ action: "loginVerify", email, code });
            if (r.ok && r.token) {
              localStorage.setItem(TOKEN_KEY, r.token);
              setToken(r.token);
            } else setMsg(r.message ?? "That code didn't work.");
          }}
        >
          {sent ? "Sign in" : "Email me a code"}
        </button>
        {msg && <p style={sub}>{msg}</p>}
      </main>
    );
  }

  return (
    <main style={wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={h1}>Reported content</h1>
        <button
          style={{ ...btn, marginLeft: "auto", width: "auto", padding: "8px 14px" }}
          onClick={() => {
            localStorage.removeItem(TOKEN_KEY);
            setToken("");
          }}
        >
          Sign out
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, margin: "10px 0 18px" }}>
        {["open", "actioned", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{ ...pill, ...(status === s ? { background: "#5A2BE0", color: "#fff" } : {}) }}
          >
            {s}
          </button>
        ))}
      </div>

      {reports.length === 0 && <p style={sub}>Nothing here right now.</p>}
      {reports.map((r) => (
        <article key={r.id} style={card}>
          <div style={{ fontWeight: 700 }}>
            {r.target_name || r.target_id}{" "}
            <span style={{ color: "#6B6480", fontWeight: 500 }}>
              · {r.kind} · {r.build}
            </span>
          </div>
          <div style={{ fontSize: 14, margin: "6px 0" }}>
            <b>{r.reason}</b>
            {r.details ? ` — ${r.details}` : ""}
          </div>
          <div style={{ fontSize: 12, color: "#6B6480" }}>
            reported by {r.reporter_email} · {new Date(r.created_at).toLocaleString()}
          </div>
          {r.status === "open" && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button style={pill} onClick={() => act(r, "hide")}>
                Deactivate
              </button>
              <button style={{ ...pill, borderColor: "#E11D48", color: "#E11D48" }} onClick={() => act(r, "remove")}>
                Delete content
              </button>
              <button style={pill} onClick={() => act(r, "dismiss")}>
                Dismiss
              </button>
              {r.reporter_email && (
                <a style={{ ...pill, textDecoration: "none" }} href={`mailto:support@venduapp.com?subject=VendU report ${r.id}`}>
                  Email support
                </a>
              )}
            </div>
          )}
        </article>
      ))}

      <h2 style={{ ...h1, fontSize: 20, marginTop: 30 }}>Blocked content</h2>
      {blocks.length === 0 && <p style={sub}>None.</p>}
      {blocks.map((b) => (
        <div key={b.id} style={{ ...card, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14 }}>
            {b.kind} · {b.target_id} · {b.build} · {b.action}
          </span>
          <button
            style={{ ...pill, marginLeft: "auto" }}
            onClick={async () => {
              await api({
                action: "act",
                token,
                decision: "restore",
                kind: b.kind,
                targetId: b.target_id,
                build: b.build,
              });
              void load();
            }}
          >
            Restore
          </button>
        </div>
      ))}
    </main>
  );
}

const wrap: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "36px 20px 80px",
  fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
  color: "#1B1626",
  background: "#FBF8F3",
  minHeight: "100vh",
};
const h1: React.CSSProperties = { fontSize: 26, margin: "0 0 4px", letterSpacing: "-0.02em" };
const sub: React.CSSProperties = { color: "#6B6480", fontSize: 14 };
const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px 14px",
  margin: "10px 0",
  border: "1px solid #e6e1d8",
  borderRadius: 12,
  fontSize: 15,
  background: "#fff",
};
const btn: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#5A2BE0",
  color: "#fff",
  border: 0,
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};
const pill: React.CSSProperties = {
  padding: "7px 13px",
  borderRadius: 999,
  border: "1px solid #e6e1d8",
  background: "#fff",
  fontSize: 13,
  fontWeight: 700,
  color: "#1B1626",
  cursor: "pointer",
};
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e6e1d8",
  borderRadius: 14,
  padding: "14px 16px",
  marginBottom: 12,
};
