import { RefObject } from "react";
import { Message } from "@/app/types";

interface MessageListProps {
    messages: Message[];
    currentUser: string;
    messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function MessageList({ messages, currentUser, messagesEndRef }: MessageListProps) {
    return (
        <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
                <div key={msg.id ?? index} className={`mb-4 flex ${msg.from === currentUser ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 rounded-lg max-w-[80%] sm:max-w-[70%] ${msg.from === currentUser ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>
                        <div className="font-semibold">{msg.from}</div>
                        <div className="break-words">{msg.message}</div>
                        {msg.created_at && <div className="text-xs opacity-75 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</div>}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}
