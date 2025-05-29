'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Message {
  id?: number;
  from: string;
  message: string;
  created_at?: string;
}

export default function Chat() {
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
      alert('Silakan login terlebih dahulu');
      router.push('/');
      return;
    }
    setCurrentUser(username);
  }, [router]);

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase.from('users').select('username');
      if (error) {
        alert('Gagal memuat daftar user: ' + error.message);
        return;
      }
      if (data) {
        setOnlineUsers(data.map(user => user.username).filter(user => user !== currentUser));
      }
    };
    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    let isMounted = true;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('id, sender, message, created_at')
          .or(`and(sender.eq.${currentUser},receiver.eq.${selectedUser}),and(sender.eq.${selectedUser},receiver.eq.${currentUser})`)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Gagal memuat pesan:', error.message);
          return;
        }

        if (data && isMounted) {
          const formatted = data.map(msg => ({
            id: msg.id,
            from: msg.sender,
            message: msg.message,
            created_at: msg.created_at,
          }));

          const isSame =
            formatted.length === messages.length &&
            formatted.every((m, i) =>
              m.id === (messages[i] as any).id &&
              m.message === messages[i].message
            );

          if (!isSame) {
            setMessages(formatted);
          }
        }
      } catch (err) {
        console.error('Terjadi kesalahan saat memuat pesan', err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser, selectedUser]);

  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender=eq.${selectedUser},receiver=eq.${currentUser}`,
        },
        (payload) => {
          const newMessage = payload.new as {
            id: number;
            sender: string;
            message: string;
            created_at: string;
          };

          setMessages(prev => {
            if (prev.find(m => (m as any).id === newMessage.id)) {
              return prev;
            }

            return [...prev, {
              id: newMessage.id,
              from: newMessage.sender,
              message: newMessage.message,
              created_at: newMessage.created_at
            }];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedUser) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            sender: currentUser,
            receiver: selectedUser,
            message: messageInput
          })
          .select();

        if (error) {
          alert('Gagal mengirim pesan: ' + error.message);
          return;
        }

        if (data && data.length > 0) {
          const inserted = data[0];
          setMessages(prev => [...prev, {
            id: inserted.id,
            from: currentUser,
            message: inserted.message,
            created_at: inserted.created_at
          }]);
        }

        setMessageInput('');
      } catch (err) {
        alert('Terjadi kesalahan saat mengirim pesan');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
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
        <div className="w-6"></div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${showUsers ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:transition-none`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Pengguna Online</h2>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
            <div className="p-2 font-semibold text-indigo-600">Me: {currentUser}</div>
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

        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b bg-white">
                <h2 className="text-xl font-semibold">Chat dengan {selectedUser}</h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id ?? index}
                    className={`mb-4 flex ${msg.from === currentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-[80%] sm:max-w-[70%] ${
                        msg.from === currentUser ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                      }`}
                    >
                      <div className="font-semibold">{msg.from}</div>
                      <div className="break-words">{msg.message}</div>
                      {msg.created_at && (
                        <div className="text-xs opacity-75 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                      )}
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
                    placeholder="Ketik pesan..."
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 whitespace-nowrap"
                  >
                    Kirim
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Pilih pengguna untuk memulai chat
            </div>
          )}
        </div>
      </div>

      {showUsers && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setShowUsers(false)}
        />
      )}

      <div className="fixed top-4 right-4">
        <button
          onClick={async () => {
            try {
              const { error } = await supabase
                .from('users')
                .delete()
                .eq('username', currentUser);
              if (error) {
                console.error('Gagal logout:', error.message);
              }
            } catch (err) {
              console.error('Terjadi kesalahan saat logout:', err);
            }
            localStorage.removeItem('username');
            router.push('/');
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
