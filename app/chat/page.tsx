"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Message } from "@/app/types";
import { getDeviceId } from "@/lib/fingerprint";
import UserList from "@/app/components/chat/UserList";
import ChatHeader from "@/app/components/chat/ChatHeader";
import MessageList from "@/app/components/chat/MessageList";
import MessageInput from "@/app/components/chat/MessageInput";
import MobileHeader from "@/app/components/chat/MobileHeader";

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [messageInput, setMessageInput] = useState("");
    const [currentUser, setCurrentUser] = useState<string>("");
    const [showUsers, setShowUsers] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const username = localStorage.getItem("username");
        if (!username) {
            alert("Silakan login terlebih dahulu");
            router.push("/");
            return;
        }
        setCurrentUser(username);
    }, [router]);

    const loadUsers = async () => {
        const { data, error } = await supabase.from("users").select("username, device_id").not("username", "eq", currentUser);

        if (error) {
            alert("Gagal memuat daftar user: " + error.message);
            return;
        }
        if (data) {
            setOnlineUsers(data.map((user) => user.username));
        }
    };

    useEffect(() => {
        loadUsers();
    }, [currentUser]);

    const loadMessages = async () => {
        if (!currentUser || !selectedUser) return;

        try {
            const { data, error } = await supabase
                .from("messages")
                .select("id, sender, message, created_at")
                .or(`and(sender.eq.${currentUser},receiver.eq.${selectedUser}),and(sender.eq.${selectedUser},receiver.eq.${currentUser})`)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Gagal memuat pesan:", error.message);
                return;
            }

            if (data) {
                const formatted = data.map((msg) => ({
                    id: msg.id,
                    from: msg.sender,
                    message: msg.message,
                    created_at: msg.created_at,
                }));

                const isSame = formatted.length === messages.length && formatted.every((m, i) => m.id === (messages[i] as any).id && m.message === messages[i].message);

                if (!isSame) {
                    setMessages(formatted);
                }
            }
        } catch (err) {
            console.error("Terjadi kesalahan saat memuat pesan", err);
        }
    };

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [currentUser, selectedUser]);

    useEffect(() => {
        if (!currentUser || !selectedUser) return;

        const channel = supabase
            .channel("messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `sender=eq.${selectedUser},receiver=eq.${currentUser}`,
                },
                (payload) => {
                    const newMessage = payload.new as {
                        id: number;
                        sender: string;
                        message: string;
                        created_at: string;
                    };

                    setMessages((prev) => {
                        if (prev.find((m) => (m as any).id === newMessage.id)) {
                            return prev;
                        }

                        return [
                            ...prev,
                            {
                                id: newMessage.id,
                                from: newMessage.sender,
                                message: newMessage.message,
                                created_at: newMessage.created_at,
                            },
                        ];
                    });
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [currentUser, selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim() && selectedUser) {
            try {
                const { data, error } = await supabase
                    .from("messages")
                    .insert({
                        sender: currentUser,
                        receiver: selectedUser,
                        message: messageInput,
                    })
                    .select();

                if (error) {
                    alert("Gagal mengirim pesan: " + error.message);
                    return;
                }

                if (data && data.length > 0) {
                    const inserted = data[0];
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: inserted.id,
                            from: currentUser,
                            message: inserted.message,
                            created_at: inserted.created_at,
                        },
                    ]);
                }

                setMessageInput("");
            } catch (err) {
                alert("Terjadi kesalahan saat mengirim pesan");
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <MobileHeader showUsers={showUsers} setShowUsers={setShowUsers} />

            <div className="flex flex-1 overflow-hidden">
                <div
                    className={`${
                        showUsers ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:transition-none`}
                >
                    <UserList currentUser={currentUser} onlineUsers={onlineUsers} selectedUser={selectedUser} onSelectUser={setSelectedUser} onRefreshUsers={loadUsers} setShowUsers={setShowUsers} />
                </div>

                <div className="flex-1 flex flex-col">
                    {selectedUser ? (
                        <>
                            <ChatHeader selectedUser={selectedUser} onRefreshMessages={loadMessages} />
                            <MessageList messages={messages} currentUser={currentUser} messagesEndRef={messagesEndRef} />
                            <MessageInput messageInput={messageInput} setMessageInput={setMessageInput} onSendMessage={sendMessage} />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">Pilih pengguna untuk memulai chat</div>
                    )}
                </div>
            </div>

            {showUsers && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setShowUsers(false)} />}

            <div className="fixed top-4 right-4">
                <button
                    onClick={async () => {
                        try {
                            // const deviceId = await getDeviceId();
                            // const { error } = await supabase.from("users").delete().match({
                            //     username: currentUser,
                            //     device_id: deviceId,
                            // });
                            // if (error) {
                            //     console.error("Gagal logout:", error.message);
                            // }
                        } catch (err) {
                            console.error("Terjadi kesalahan saat logout:", err);
                        }
                        localStorage.removeItem("username");
                        router.push("/");
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
