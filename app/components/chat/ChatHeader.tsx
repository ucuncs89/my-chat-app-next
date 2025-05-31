interface ChatHeaderProps {
    selectedUser: string;
    onRefreshMessages: () => void;
}

export default function ChatHeader({ selectedUser, onRefreshMessages }: ChatHeaderProps) {
    return (
        <div className="p-4 border-b bg-white">
            <h2 className="text-xl font-semibold">Chat dengan {selectedUser}</h2>
            <button onClick={onRefreshMessages} className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
                Refresh Messages
            </button>
        </div>
    );
}
