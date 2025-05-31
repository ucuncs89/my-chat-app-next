"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getDeviceId } from "@/lib/fingerprint";

export default function Home() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const initFingerprint = async () => {
            const id = await getDeviceId();
            setDeviceId(id);

            // Check if this device already has a user
            const { data } = await supabase.from("users").select("username").eq("device_id", id).single();

            if (data) {
                // If device already has a user, auto-login
                localStorage.setItem("username", data.username);
                router.push("/chat");
            }
        };

        initFingerprint();
    }, [router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !deviceId) return;
        setLoading(true);
        try {
            // Check if username is already taken
            const { data: existingUser } = await supabase.from("users").select("username, device_id").or(`username.eq.${username},device_id.eq.${deviceId}`).single();

            if (existingUser) {
                if (existingUser.username === username) {
                    throw new Error("Username sudah digunakan");
                } else {
                    throw new Error("Perangkat ini sudah terdaftar dengan username lain");
                }
            }

            // Insert new user with device_id
            const { error: insertError } = await supabase.from("users").insert({
                username,
                device_id: deviceId,
            });

            if (insertError) throw insertError;

            localStorage.setItem("username", username);
            router.push("/chat");
        } catch (err: any) {
            alert("Gagal login: " + (err?.message || err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">Welcome to Ping Chatr</h1>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-base"
                            placeholder="Enter your username"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-base"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Join Chat"}
                    </button>
                </form>
            </div>
        </main>
    );
}
