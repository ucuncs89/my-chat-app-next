'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatContextType {
  username: string;
  setUsername: (name: string) => void;
  socket: Socket | null;
  onlineUsers: string[];
}

const ChatContext = createContext<ChatContextType>({
  username: '',
  setUsername: () => {},
  socket: null,
  onlineUsers: [],
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('username') || '';
  
    fetch('/api/socket').then(() => {
      const socketIo = io(); // koneksi baru setelah API socket aktif
  
      setSocket(socketIo);
  
      socketIo.on('connect', () => {
        console.log('Socket connected:', socketIo.id);
        if (saved) {
          socketIo.emit('register', saved);
          console.log('Emitting register with:', saved);
        }
      });
  
      socketIo.on('online-users', (users: string[]) => {
        console.log('Received users:', users);
        setOnlineUsers(users);
      });
  
      return () => {
        socketIo.disconnect();
      };
    });
  }, []);
  
  const updateUsername = (name: string) => {
    setUsername(name);
    localStorage.setItem('username', name);
  };

  return (
    <ChatContext.Provider value={{ username, setUsername: updateUsername, socket, onlineUsers }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);