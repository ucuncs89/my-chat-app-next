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
  const [showUsers, setShowUsers] = useState(false);
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md p-4 flex items-center justify-between">
        <button
          onClick={() => setShowUsers(!showUsers)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Chat App</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Online Users Sidebar */}
        <div className={`${showUsers ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:transition-none`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Online Users</h2>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
            {onlineUsers.map((user) => (
              <div
                key={user}
                className={`p-2 cursor-pointer rounded ${
                  selectedUser === user ? 'bg-indigo-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedUser(user);
                  setShowUsers(false);
                }}
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
                      className={`inline-block p-3 rounded-lg max-w-[80%] sm:max-w-[70%] ${
                        msg.from === 'You'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      <div className="font-semibold">{msg.from}</div>
                      <div className="break-words">{msg.message}</div>
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
                    className="flex-1 p-2 border rounded text-base"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 whitespace-nowrap"
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

      {/* Mobile Overlay */}
      {showUsers && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setShowUsers(false)}
        />
      )}
    </div>
  );
}
