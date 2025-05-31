interface ChatHeaderProps {
    selectedUser: string;
    onRefreshMessages: () => void;
}

export default function ChatHeader({ selectedUser, onRefreshMessages }: ChatHeaderProps) {
    const deleteOldMessages = async () => {
        try {
            const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
            const response = await fetch(`/api/messages/delete-old?sender=${username}&receiver=${selectedUser}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete old messages");
            }

            // Refresh messages after deletion
            onRefreshMessages();
            alert("Pesan lama berhasil dihapus");
        } catch (error) {
            console.error("Error deleting old messages:", error);
            alert("Gagal menghapus pesan lama");
        }
    };

    return (
        <div className="p-4 border-b bg-white">
            <h2 className="text-xl font-semibold">Chat dengan {selectedUser}</h2>
            <div className="flex gap-2 mt-2">
                <button onClick={onRefreshMessages} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
                    Refresh Messages
                </button>
                <button onClick={deleteOldMessages} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                    Hapus Pesan Lama
                </button>
            </div>
        </div>
    );
}
