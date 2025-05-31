import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(request: Request) {
    try {
        // Calculate date 1 day ago
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // Get query parameters from URL
        const url = new URL(request.url);
        const sender = url.searchParams.get("sender");
        const receiver = url.searchParams.get("receiver");

        // Initialize query
        let query = supabase.from("messages").delete().lt("created_at", oneDayAgo.toISOString());

        // Add conditions if sender and receiver are provided
        if (sender && receiver) {
            query = query.eq("sender", sender).eq("receiver", receiver);
        }

        // Execute the query
        const { error } = await query;

        if (error) {
            console.error("Error deleting old messages:", error);
            return NextResponse.json({ error: "Failed to delete old messages" }, { status: 500 });
        }

        return NextResponse.json({ message: "Old messages deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
