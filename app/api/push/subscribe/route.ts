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
    const body = await req.json();

    // If only username is present, this is a request for the public key
    if (body.username && !body.subscription) {
      return NextResponse.json(
        {
          publicKey: vapidKeys.publicKey,
        },
        { headers }
      );
    }

    // This is a subscription request
    const { subscription, username } = body;

    if (!subscription || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers }
      );
    }

    console.log("Received subscription request:", { username, subscription });

    // First, try to delete any existing subscription for this username
    await supabase.from("push_subscriptions").delete().eq("username", username);

    // Then insert the new subscription
    const { error } = await supabase.from("push_subscriptions").insert({
      username: username,
      subscription: JSON.stringify(subscription),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json(
      {
        message: "Subscription added successfully",
        publicKey: vapidKeys.publicKey,
      },
      { headers }
    );
  } catch (err) {
    console.error("Error in subscribe route:", err);
    return NextResponse.json(
      { error: "Error saving subscription", details: err },
      { status: 500, headers }
    );
  }
}
