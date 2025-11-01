import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

  const conversationsRef = adminDb.collection(`stores/${uid}/conversations`);

  // total_conversations (fallback-friendly without count aggregator)
  const totalSnap = await conversationsRef.get();
  const total_conversations = totalSnap.size || 0;

    // unread_messages (sum of unread_count)
    const unreadAggSnap = await conversationsRef.where("unread_count", ">", 0).get();
    let unread_messages = 0;
    unreadAggSnap.forEach((doc) => {
      const data = doc.data() as any;
      unread_messages += Number(data.unread_count || 0);
    });

  // flagged_conversations
  const flaggedSnap = await conversationsRef.where("is_flagged", "==", true).get();
  const flagged_conversations = flaggedSnap.size || 0;

    // active_today (by last_message_time is today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const activeTodaySnap = await conversationsRef
      .where("last_message_time", ">=", startOfDay)
      .get();
    const active_today = activeTodaySnap.size || 0;

    // avg_response_time_minutes and response_rate_percent from last ~200 messages across all conversations
    // Use collection group on messages
    let msgs: { sender_role: string; sent_at: FirebaseFirestore.Timestamp; conversation_id: string }[] = [];
    try {
      const messagesSnap = await adminDb
        .collectionGroup("messages")
        .where("store_uid", "==", uid)
        .orderBy("sent_at", "desc")
        .limit(200)
        .get();

      messagesSnap.forEach((d) => {
        const data = d.data() as any;
        msgs.push({
          sender_role: data.sender_role,
          sent_at: data.sent_at,
          conversation_id: data.conversation_id,
        });
      });
    } catch (e: any) {
      // Likely missing composite index in Firestore; gracefully degrade stats
      console.warn("/chat/summary messages aggregation skipped:", e?.message || e);
      msgs = [];
    }

    // For each seller message, find nearest previous buyer message in same conversation
    let totalPairs = 0;
    let totalDelayMs = 0;
    let buyerMessages = 0;
    let buyerRepliedWithinHour = 0;

    const lastBuyerPerConv: Record<string, FirebaseFirestore.Timestamp | null> = {};
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.sender_role === "buyer") {
        buyerMessages++;
        lastBuyerPerConv[m.conversation_id] = m.sent_at;
      } else if (m.sender_role === "seller") {
        const lastBuyerTs = lastBuyerPerConv[m.conversation_id];
        if (lastBuyerTs) {
          const delayMs = m.sent_at.toDate().getTime() - lastBuyerTs.toDate().getTime();
          if (delayMs >= 0) {
            totalPairs++;
            totalDelayMs += delayMs;
            if (delayMs <= 60 * 60 * 1000) buyerRepliedWithinHour++;
            // reset so we don't pair multiple seller replies to same buyer msg
            lastBuyerPerConv[m.conversation_id] = null as any;
          }
        }
      }
    }

    const avg_response_time_minutes = totalPairs ? Math.round(totalDelayMs / totalPairs / 60000) : 0;
    const response_rate_percent = buyerMessages ? Math.round((buyerRepliedWithinHour / buyerMessages) * 100) : 0;

    return NextResponse.json({
      communication_statistics: {
        total_conversations,
        active_today,
        avg_response_time_minutes,
        response_rate_percent,
        unread_messages,
        flagged_conversations,
      },
    });
  } catch (err: any) {
    console.error("/chat/summary GET error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
