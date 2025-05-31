"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        setLoading(true);
        try {
            // Cek apakah user sudah ada
            const { data, error } = await supabase.from("users").select("username").eq("username", username).single();
            if (!data) {
                // Insert user baru jika belum ada
                const { error: insertError } = await supabase.from("users").insert({ username });
                if (insertError) throw insertError;
            }
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
