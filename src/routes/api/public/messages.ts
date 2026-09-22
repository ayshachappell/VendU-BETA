import { createFileRoute } from "@tanstack/react-router";
import { json, normalizeBuild, requireStudent } from "@/lib/edu-verification.server";
import { ensureProfile, str } from "@/lib/vendu-core.server";

type Body = Record<string, unknown>;
const MAX_TEXT = 4000;
const MAX_ATTACHMENT = 8 * 1024 * 1024;
const DATA_URL = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i;

/* Only these attachment types may be stored. Anything else is rejected, so a
   message can never carry an executable or script disguised as a file. */
const ALLOWED_TYPES: Record<string, RegExp[]> = {
  "image/jpeg": [/^\xFF\xD8\xFF/],
  "image/png": [/^\x89PNG\r\n\x1a\n/],
  "image/gif": [/^GIF8[79]a/],
  "image/webp": [/^RIFF.{4}WEBP/s],
  "image/heic": [/^.{4}ftyp/s],
  "application/pdf": [/^%PDF-/],
  "audio/webm": [/^\x1aE\xdf\xa3/],
  "video/webm": [/^\x1aE\xdf\xa3/],
  "audio/ogg": [/^OggS/],
  "audio/mpeg": [/^(ID3|\xFF)/],
  "audio/mp4": [/^.{4}ftyp/s],
  "audio/m4a": [/^.{4}ftyp/s],
  "video/mp4": [/^.{4}ftyp/s],
  "text/plain": [/^/],
};

/** True when the bytes really look like the declared attachment type. */
function bytesMatchType(type: string, bytes: Buffer): boolean {
  const signatures = ALLOWED_TYPES[type];
  if (!signatures) return false;
  const head = bytes.subarray(0, 16).toString("binary");
  return signatures.some((signature) => signature.test(head));
}

function safeName(value: unknown) {
  return str(value, 80).replace(/[^a-z0-9._-]+/gi, "-") || "attachment";
}

function pair(a: string, b: string) {
  return [a.toLowerCase(), b.toLowerCase()].sort();
}

function publicMessage(row: Record<string, unknown>) {
  return {
    id: row["id"],
    senderEmail: row["sender_email"],
    senderName: row["sender_name"],
    kind: row["kind"],
    body: row["body"] ?? "",
    attachment: row["attachment"] ?? null,
    createdAt: row["created_at"],
  };
}

export const Route = createFileRoute("/api/public/messages")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const email = auth.email.toLowerCase();
        let raw: Body;
        try {
          raw = (await request.json()) as Body;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }
        const action = str(raw["action"], 32);
        const build = normalizeBuild(raw["build"]);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (action === "gifSearch") {
          const query = str(raw["query"], 80);
          const lovableApiKey = process.env["LOVABLE_API_KEY"]!;
          const klipyApiKey = process.env["KLIPY_API_KEY"]!;
          if (!lovableApiKey || !klipyApiKey) return json({ ok: false, message: "GIF search is unavailable right now." }, 503);
          const params = new URLSearchParams({ customer_id: email, per_page: "24" });
          if (query) params.set("q", query);
          const endpoint = query ? "search" : "trending";
          const response = await fetch(`https://connector-gateway.lovable.dev/klipy/gifs/${endpoint}?${params}`, {
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "X-Connection-Api-Key": klipyApiKey,
            },
          });
          if (!response.ok) {
            const errorBody = await response.text();
            console.error(`KLIPY request failed [${response.status}]: ${errorBody}`);
            return json({ ok: false, message: "GIF search could not load. Try again." }, response.status);
          }
          const result = (await response.json()) as { result?: boolean; data?: { data?: Record<string, unknown>[] } };
          if (!result.result) return json({ ok: false, message: "GIF search could not load. Try again." }, 502);
          const gifs = (result.data?.data ?? []).flatMap((item) => {
            const file = item["file"] as Record<string, Record<string, { url?: string; width?: number; height?: number }>> | undefined;
            if (!file) return [];
            const variants = [file["md"], file["sm"], file["xs"], file["hd"], ...Object.values(file)];
            let media: { url?: string; width?: number; height?: number } | undefined;
            for (const variant of variants) {
              media = variant?.["webp"] ?? variant?.["gif"] ?? variant?.["mp4"];
              if (media?.url) break;
            }
            if (!media?.url || !media.url.startsWith("https://")) return [];
            return [{ id: String(item["id"] ?? media.url), title: str(item["title"], 100) || "GIF", url: media.url, width: media.width ?? null, height: media.height ?? null }];
          });
          return json({ ok: true, gifs });
        }

        async function ownedConversation(id: string) {
          const { data } = await supabaseAdmin
            .from("conversations")
            .select("*")
            .eq("id", id)
            .eq("build", build)
            .or(`participant_a_email.eq.${email},participant_b_email.eq.${email}`)
            .maybeSingle();
          return data as Record<string, unknown> | null;
        }

        async function shapeConversation(c: Record<string, unknown>, hiddenAt?: string) {
          const id = String(c["id"]);
          const peerIsA = String(c["participant_b_email"]) === email;
          const peerEmail = String(c[peerIsA ? "participant_a_email" : "participant_b_email"] ?? "");
          const peerName = String(c[peerIsA ? "participant_a_name" : "participant_b_name"] ?? "Student");
          const [{ data: messages }, { data: transactions }, { data: read }, { data: peerVendor }] = await Promise.all([
            supabaseAdmin.from("conversation_messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true }).limit(500),
            supabaseAdmin.from("message_transactions").select("*").eq("conversation_id", id).order("created_at", { ascending: true }),
            supabaseAdmin.from("conversation_reads").select("read_at").eq("conversation_id", id).eq("reader_email", email).maybeSingle(),
            supabaseAdmin.from("vendors").select("accent_color,avatar_url").eq("owner_email", peerEmail).eq("build", build).eq("published", true).maybeSingle(),
          ]);
          const readAt = Date.parse(String(read?.read_at ?? "")) || 0;
          const hiddenTime = Date.parse(hiddenAt ?? "") || 0;
          const visibleMessages = (messages ?? []).filter((message) => Date.parse(String(message.created_at)) > hiddenTime);
          const safeTransactions = (transactions ?? []).filter((tx) => Date.parse(String(tx.created_at)) > hiddenTime).map((tx) => {
            const row = { ...tx } as Record<string, unknown>;
            const viewerIsBuyer = String(row["buyer_email"] ?? "") === email;
            if (viewerIsBuyer && !row["buyer_met_at"]) {
              row["payment_methods"] = Array.isArray(row["payment_methods"])
                ? (row["payment_methods"] as Record<string, unknown>[]).map((p) => ({ app: p["app"] ?? "Payment app" }))
                : [];
            }
            return row;
          });
          return {
            id,
            name: peerName,
            peerEmail,
            color: peerVendor?.accent_color ?? null,
            avatar: peerVendor?.avatar_url ?? null,
            updatedAt: c["updated_at"],
            unread: visibleMessages.filter((m) => String(m.sender_email ?? "") !== email && Date.parse(String(m.created_at)) > readAt).length,
            messages: visibleMessages.map((m) => publicMessage(m as Record<string, unknown>)),
            transactions: safeTransactions,
          };
        }

        if (action === "list") {
          /* Materialize due reminders whenever either participant syncs. The
             durable rows make this idempotent and visible on every device. */
          const dueNow = new Date().toISOString();
          const { data: due } = await supabaseAdmin
            .from("message_transactions")
            .select("*")
            .eq("build", build)
            .or(`seller_email.eq.${email},buyer_email.eq.${email}`)
            .lte("meetup_available_at", dueNow)
            .is("reminder_sent_at", null)
            .limit(50);
          for (const tx of due ?? []) {
            const reminder = `Your ${tx.kind === "booking" ? "appointment" : "meet-up"} for ${tx.title} is ready. Open the message to confirm when you are together.`;
            const at = new Date().toISOString();
            const { data: claimed } = await supabaseAdmin.from("message_transactions").update({ reminder_sent_at: at }).eq("id", tx.id).is("reminder_sent_at", null).select("id").maybeSingle();
            if (claimed) await Promise.all([
              supabaseAdmin.from("conversation_messages").insert({ conversation_id: tx.conversation_id, build, sender_email: null, sender_name: "VendU", kind: "system", body: reminder }),
              supabaseAdmin.from("message_notifications").insert([
                { recipient_email: tx.buyer_email, conversation_id: tx.conversation_id, transaction_id: tx.id, build, kind: "meetup", message: reminder },
                { recipient_email: tx.seller_email, conversation_id: tx.conversation_id, transaction_id: tx.id, build, kind: "meetup", message: reminder },
              ]),
            ]);
          }
          const { data } = await supabaseAdmin
            .from("conversations")
            .select("*")
            .eq("build", build)
            .or(`participant_a_email.eq.${email},participant_b_email.eq.${email}`)
            .order("updated_at", { ascending: false })
            .limit(100);
          const { data: hides } = await supabaseAdmin
            .from("conversation_hides")
            .select("conversation_id,hidden_at")
            .eq("user_email", email)
            .eq("build", build);
          const hiddenByConversation = new Map((hides ?? []).map((hide) => [String(hide.conversation_id), String(hide.hidden_at)]));
          const shaped = await Promise.all(((data ?? []) as Record<string, unknown>[]).map((conversation) => shapeConversation(conversation, hiddenByConversation.get(String(conversation["id"])))));
          const conversations = shaped.filter((conversation) => !hiddenByConversation.has(conversation.id) || conversation.messages.length > 0);
          const hiddenConversationIds = shaped.filter((conversation) => hiddenByConversation.has(conversation.id) && conversation.messages.length === 0).map((conversation) => conversation.id);
          const { data: notifications } = await supabaseAdmin
            .from("message_notifications")
            .select("*")
            .eq("recipient_email", email)
            .eq("build", build)
            .order("created_at", { ascending: false })
            .limit(100);
          return json({ ok: true, conversations, hiddenConversationIds, notifications: notifications ?? [] });
        }

        if (action === "open") {
          const peerEmail = str(raw["peerEmail"], 254).toLowerCase();
          if (!peerEmail || peerEmail === email) return json({ ok: false, message: "That person cannot be messaged." }, 400);
          const sorted = pair(email, peerEmail);
          const a = sorted[0] ?? email;
          const b = sorted[1] ?? peerEmail;
          const me = await ensureProfile(email);
          const { data: peer } = await supabaseAdmin.from("profiles").select("display_name").eq("email", peerEmail).maybeSingle();
          const names: Record<string, string> = {
            [email]: str(raw["myName"], 80) || String(me?.["display_name"] ?? "Student"),
            [peerEmail]: str(raw["peerName"], 80) || String(peer?.display_name ?? "Student"),
          };
          const { data, error } = await supabaseAdmin
            .from("conversations")
            .upsert({ build, participant_a_email: a, participant_b_email: b, participant_a_name: names[a] ?? "Student", participant_b_name: names[b] ?? "Student" }, { onConflict: "build,participant_a_email,participant_b_email" })
            .select("*")
            .single();
          if (error || !data) return json({ ok: false, message: "Could not open that conversation." }, 500);
          const { data: hidden } = await supabaseAdmin.from("conversation_hides").select("hidden_at").eq("conversation_id", data.id).eq("user_email", email).maybeSingle();
          return json({ ok: true, conversation: await shapeConversation(data as Record<string, unknown>, hidden?.hidden_at) });
        }

        const conversationId = str(raw["conversationId"], 80);
        const conversation = await ownedConversation(conversationId);
        if (!conversation) return json({ ok: false, message: "Conversation not found." }, 404);

        if (action === "read") {
          await supabaseAdmin.from("conversation_reads").upsert({ conversation_id: conversationId, reader_email: email, read_at: new Date().toISOString() });
          await supabaseAdmin.from("message_notifications").update({ read_at: new Date().toISOString() }).eq("conversation_id", conversationId).eq("recipient_email", email).is("read_at", null);
          return json({ ok: true });
        }

        if (action === "hide") {
          const hiddenAt = new Date().toISOString();
          const { error } = await supabaseAdmin.from("conversation_hides").upsert({ conversation_id: conversationId, user_email: email, build, hidden_at: hiddenAt }, { onConflict: "conversation_id,user_email" });
          if (error) return json({ ok: false, message: "Could not remove that conversation." }, 500);
          await supabaseAdmin.from("message_notifications").update({ read_at: hiddenAt }).eq("conversation_id", conversationId).eq("recipient_email", email).is("read_at", null);
          return json({ ok: true });
        }

        if (action === "send") {
          const body = str(raw["body"], MAX_TEXT);
          const kind = ["text", "image", "voice", "gif", "sticker", "file", "location", "contact"].includes(str(raw["kind"], 20)) ? str(raw["kind"], 20) : "text";
          let attachment: Record<string, unknown> | null = null;
          const dataUrl = str(raw["dataUrl"], 12_000_000);
          if (dataUrl) {
            const hit = dataUrl.match(DATA_URL);
            if (!hit) return json({ ok: false, message: "That attachment format is not supported." }, 400);
            const bytes = Buffer.from(hit[2]!, "base64");
            if (bytes.length > MAX_ATTACHMENT) return json({ ok: false, message: "Attachments must be 8 MB or smaller." }, 413);
            const mime = hit[1]!.toLowerCase();
            if (!bytesMatchType(mime, bytes)) {
              return json({ ok: false, message: "You can send photos, voice notes, PDFs and plain text files only." }, 415);
            }
            const objectPath = `${build}/${conversationId}/${crypto.randomUUID()}-${safeName(raw["fileName"])}`;
            const { error } = await supabaseAdmin.storage.from("message-attachments").upload(objectPath, bytes, { contentType: mime, upsert: false });
            if (error) return json({ ok: false, message: "Could not upload that attachment." }, 500);
            attachment = { path: objectPath, name: safeName(raw["fileName"]), type: mime, size: bytes.length };
          } else if (raw["attachment"] && typeof raw["attachment"] === "object") {
            attachment = raw["attachment"] as Record<string, unknown>;
            if (["gif", "sticker"].includes(kind)) {
              let mediaUrl: URL;
              try {
                mediaUrl = new URL(String(attachment["url"] ?? ""));
              } catch {
                return json({ ok: false, message: "That GIF is not available." }, 400);
              }
              if (mediaUrl.protocol !== "https:" || !(mediaUrl.hostname === "klipy.com" || mediaUrl.hostname.endsWith(".klipy.com"))) {
                return json({ ok: false, message: "That GIF source is not supported." }, 400);
              }
              attachment = { url: mediaUrl.toString(), label: str(attachment["label"], 100) || "GIF" };
            }
          }
          if (!body && !attachment) return json({ ok: false, message: "Write a message or add an attachment." }, 400);
          const profile = await ensureProfile(email);
          const senderName = str(raw["senderName"], 80) || String(profile?.["display_name"] ?? "Student");
          const { data, error } = await supabaseAdmin.from("conversation_messages").insert({ conversation_id: conversationId, build, sender_email: email, sender_name: senderName, kind, body: body || null, attachment: attachment as never }).select("*").single();
          if (error || !data) return json({ ok: false, message: "Could not send that message." }, 500);
          const recipient = String(conversation["participant_a_email"]) === email ? String(conversation["participant_b_email"]) : String(conversation["participant_a_email"]);
          await Promise.all([
            supabaseAdmin.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId),
            supabaseAdmin.from("message_notifications").insert({ recipient_email: recipient, conversation_id: conversationId, build, kind: "message", message: `${senderName}: ${body || "Sent an attachment"}` }),
          ]);
          return json({ ok: true, message: publicMessage(data as Record<string, unknown>) });
        }

        if (action === "attachmentUrl") {
          const path = str(raw["path"], 500);
          if (!path.startsWith(`${build}/${conversationId}/`)) return json({ ok: false, message: "Attachment not found." }, 404);
          const { data } = await supabaseAdmin.storage.from("message-attachments").createSignedUrl(path, 600);
          return json({ ok: !!data?.signedUrl, url: data?.signedUrl ?? "" });
        }

        if (action === "createTransaction") {
          const peer = String(conversation["participant_a_email"]) === email ? String(conversation["participant_b_email"]) : String(conversation["participant_a_email"]);
          const role = str(raw["role"], 12) === "seller" ? "seller" : "buyer";
          const sellerEmail = role === "seller" ? email : peer;
          const buyerEmail = role === "seller" ? peer : email;
          const appointmentAt = str(raw["appointmentAt"], 40) || null;
          const meetupAt = appointmentAt ? new Date(Date.parse(appointmentAt) - 15 * 60 * 1000).toISOString() : new Date().toISOString();
          const row = {
            conversation_id: conversationId, build, kind: str(raw["kind"], 20) || "market", reference_id: str(raw["referenceId"], 120),
            title: str(raw["title"], 160), seller_email: sellerEmail, buyer_email: buyerEmail,
            seller_name: role === "seller" ? str(raw["myName"], 80) : str(raw["peerName"], 80),
            buyer_name: role === "seller" ? str(raw["peerName"], 80) : str(raw["myName"], 80),
            payment_methods: Array.isArray(raw["paymentMethods"]) ? raw["paymentMethods"] : [], appointment_at: appointmentAt, meetup_available_at: meetupAt,
          };
          if (!row.reference_id || !row.title) return json({ ok: false, message: "Missing transaction details." }, 400);
          const { data, error } = await supabaseAdmin.from("message_transactions").upsert(row, { onConflict: "build,kind,reference_id,buyer_email" }).select("*").single();
          if (error || !data) return json({ ok: false, message: "Could not add that transaction." }, 500);
          await supabaseAdmin.from("conversation_messages").insert({ conversation_id: conversationId, build, sender_email: null, sender_name: "VendU", kind: "system", body: `${row.kind === "booking" ? "Booking" : "Transaction"}: ${row.title}` });
          return json({ ok: true, transaction: data });
        }

        if (action === "transactionAction") {
          const transactionId = str(raw["transactionId"], 80);
          const event = str(raw["event"], 24);
          const { data: tx } = await supabaseAdmin.from("message_transactions").select("*").eq("id", transactionId).eq("conversation_id", conversationId).maybeSingle();
          if (!tx || ![tx.seller_email, tx.buyer_email].includes(email)) return json({ ok: false, message: "Transaction not found." }, 404);
          if (tx.meetup_available_at && Date.parse(tx.meetup_available_at) > Date.now()) return json({ ok: false, message: "Meet-up confirmation opens 15 minutes before the appointment." }, 409);
          const seller = tx.seller_email === email;
          const patch: Record<string, string> = {};
          let note = "";
          if (event === "met") { patch[seller ? "seller_met_at" : "buyer_met_at"] = new Date().toISOString(); note = `${seller ? "Seller" : "Buyer"} confirmed they are at the meet-up.`; }
          else if (event === "paid") { patch[seller ? "seller_paid_at" : "buyer_paid_at"] = new Date().toISOString(); note = seller ? "Seller confirmed the payment arrived." : "Buyer marked the payment as sent."; }
          else if (event === "notYet") { patch["payment_not_received_at"] = new Date().toISOString(); note = `${seller ? "Seller" : "Buyer"} selected Not yet.`; }
          else if (event === "report") { patch["reported_at"] = new Date().toISOString(); note = "A participant reported this transaction for review."; }
          else return json({ ok: false, message: "Unknown transaction action." }, 400);
          const { data } = await supabaseAdmin.from("message_transactions").update(patch as never).eq("id", transactionId).select("*").single();
          await supabaseAdmin.from("conversation_messages").insert({ conversation_id: conversationId, build, sender_email: null, sender_name: "VendU", kind: "system", body: note });
          return json({ ok: true, transaction: data });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});