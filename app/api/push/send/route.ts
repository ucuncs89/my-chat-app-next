import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabase } from "@/lib/supabaseClient";

const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  privateKey: process.env.NEXT_VAPID_PRIVATE_KEY || "",
};

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const { recipientUsername, message, senderUsername } = await req.json();

    // Get user's subscription from database using username
    const { data: subscriptionData, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("username", recipientUsername)
      .single();

    if (error) throw error;
    if (!subscriptionData?.subscription) {
      return NextResponse.json(
        { error: "No subscription found for user" },
        { status: 404, headers }
      );
    }

    const subscription = JSON.parse(subscriptionData.subscription);

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: `Message from ${senderUsername}`,
        body: message,
        data: {
          senderUsername,
          url: "/chat",
        },
      })
    );

    return NextResponse.json({ success: true }, { headers });
  } catch (err) {
    console.error("Error sending push notification:", err);
    return NextResponse.json(
      { error: "Error sending push notification" },
      { status: 500, headers }
    );
  }
}
