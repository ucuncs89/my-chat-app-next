'use client';
import { useChat } from '@/context/ChatContext';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PrivateChatPage() {
  const { socket, username } = useChat();
  const params = useParams();
  const receiver =
    typeof params?.receiver === 'string'
      ? params.receiver
      : Array.isArray(params?.receiver)
      ? params.receiver[0]
      : '';
  const [messages, setMessages] = useState<{ from: string; message: string }[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (data) => {
      if (data.from === receiver) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off('receive-message');
    };
  }, [socket, receiver]);

  const sendMessage = () => {
    if (socket && text.trim()) {
      const msg = { from: username, to: receiver, message: text };
      setMessages((prev) => [...prev, msg]);
      socket.emit('private-message', msg);
      setText('');
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2">Chat with {receiver}</h2>
      <div className="border h-80 overflow-y-auto p-2 mb-4 rounded">
        {messages.map((m, i) => (
          <div key={i} className={m.from === username ? 'text-right' : 'text-left'}>
            <span className="inline-block bg-gray-200 px-2 py-1 rounded mb-1">
              <strong>{m.from}: </strong>{m.message}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button className="bg-blue-500 text-white px-4 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
