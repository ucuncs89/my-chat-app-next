interface UserListProps {
    currentUser: string;
    onlineUsers: string[];
    selectedUser: string;
    onSelectUser: (user: string) => void;
    onRefreshUsers: () => void;
    setShowUsers: (show: boolean) => void;
}

export default function UserList({ currentUser, onlineUsers, selectedUser, onSelectUser, onRefreshUsers, setShowUsers }: UserListProps) {
    return (
        <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
            <div className="p-4 border-b -mt-4">
                <h2 className="text-xl font-semibold">Pengguna Online</h2>
                <button onClick={onRefreshUsers} className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
                    Refresh Users
                </button>
            </div>
            <div className="p-2 font-semibold text-indigo-600">Me: {currentUser}</div>
            {onlineUsers.map((user) => (
                <div
                    key={user}
                    className={`p-2 cursor-pointer rounded ${selectedUser === user ? "bg-indigo-100" : "hover:bg-gray-100"}`}
                    onClick={() => {
                        onSelectUser(user);
                        setShowUsers(false);
                    }}
                >
                    {user}
                </div>
            ))}
        </div>
    );
}
