// =============================================================================
// push-fanout — Expo push fan-out for notification events (A3 stub)
//
// Scope in A3: structure + Expo push call, invoked with a notification payload.
// A7 finishes the wiring: a Supabase Database Webhook fires this function on
// INSERT into public.notifications, and the final copy comes from the D3 sheet.
//
// Deploy:  supabase functions deploy push-fanout
// Secrets: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
//          for deployed functions.
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type NotificationType =
  | "rec_received"
  | "rec_started"
  | "rec_finished"
  | "friend_added";

interface NotificationRecord {
  id: string;
  user_id: string; // recipient of the push
  type: NotificationType;
  recommendation_id: string | null;
  actor_id: string | null;
  read: boolean;
}

// Database Webhook payload shape (INSERT on public.notifications).
interface WebhookPayload {
  type?: "INSERT" | "UPDATE" | "DELETE";
  table?: string;
  record?: NotificationRecord;
}

// Placeholder copy — final strings come from D3 in A7.
function messageFor(type: NotificationType, actorName: string): { title: string; body: string } {
  switch (type) {
    case "rec_received":
      return { title: "New recommendation", body: `${actorName} sent you something to read.` };
    case "rec_started":
      return { title: "They started it!", body: `${actorName} started the book you recommended.` };
    case "rec_finished":
      return { title: "They finished it!", body: `${actorName} finished the book you recommended.` };
    case "friend_added":
      return { title: "New friend", body: `You and ${actorName} are now connected.` };
  }
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as WebhookPayload;
    const note = payload.record;
    if (!note?.user_id) {
      return json({ skipped: "no notification record" }, 200);
    }

    // Recipient's push token.
    const { data: recipient } = await supabase
      .from("users")
      .select("expo_push_token")
      .eq("id", note.user_id)
      .single();

    const pushToken = recipient?.expo_push_token;
    if (!pushToken) {
      return json({ skipped: "recipient has no push token" }, 200);
    }

    // Actor display name (best-effort).
    let actorName = "Someone";
    if (note.actor_id) {
      const { data: actor } = await supabase
        .from("users")
        .select("display_name")
        .eq("id", note.actor_id)
        .single();
      if (actor?.display_name) actorName = actor.display_name;
    }

    const { title, body } = messageFor(note.type, actorName);

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data: { notificationId: note.id, recommendationId: note.recommendation_id },
      }),
    });

    return json({ sent: res.ok, expoStatus: res.status }, 200);
  } catch (err) {
    return json({ error: String(err) }, 400);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
