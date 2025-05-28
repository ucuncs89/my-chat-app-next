'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

interface Message {
  from: string;
  message: string;
}

export default function Chat() {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [currentUser, setCurrentUser] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/');
      return;
    }
    setCurrentUser(username);

    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.emit('register', username);

    newSocket.on('online-users', (users: string[]) => {
      setOnlineUsers(users.filter(user => user !== username));
    });

    newSocket.on('receive-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.close();
    };
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedUser) {
      socket.emit('private-message', {
        to: selectedUser,
        from: currentUser,
        message: messageInput
      });
      setMessages(prev => [...prev, { from: 'You', message: messageInput }]);
      setMessageInput('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Online Users Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Online Users</h2>
        </div>
        <div className="p-4">
          {onlineUsers.map((user) => (
            <div
              key={user}
              className={`p-2 cursor-pointer rounded ${
                selectedUser === user ? 'bg-indigo-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedUser(user)}
            >
              {user}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b bg-white">
              <h2 className="text-xl font-semibold">Chat with {selectedUser}</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    msg.from === 'You' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      msg.from === 'You'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{msg.from}</div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
