interface MessageInputProps {
    messageInput: string;
    setMessageInput: (message: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
}

export default function MessageInput({ messageInput, setMessageInput, onSendMessage }: MessageInputProps) {
    return (
        <form onSubmit={onSendMessage} className="p-4 border-t bg-white">
            <div className="flex gap-2">
                <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="flex-1 p-2 border rounded text-base" placeholder="Ketik pesan..." />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 whitespace-nowrap">
                    Kirim
                </button>
            </div>
        </form>
    );
}
