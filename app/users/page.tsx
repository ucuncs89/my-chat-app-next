'use client';
import { useChat } from '@/context/ChatContext';
import Link from 'next/link';

export default function UsersPage() {
  const { onlineUsers, username } = useChat();

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Users Online</h1>
      <ul className="space-y-2">
        {onlineUsers.filter(user => user !== username).map((user, idx) => (
          <li key={idx}>
            <Link
              href={`/chat/${user}`}
              className="block border p-2 rounded hover:bg-gray-100"
            >
              {user}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}