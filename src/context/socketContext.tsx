import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';
interface SocketContextType {
  socket: Socket | null;
  sendMessage: (payload: ChatSocketPayload) => void;
  joinRoom: (roomId: string) => void;
  messageSeen:(chatId:string,userId:string)=>void
  createRoom:(userId:string)=>void
}

interface SocketProviderProps {
  children: React.ReactNode;
}

interface ChatSocketPayload {
  _id: string;
  senderId: string;
  message: string;
  audio: string;
  isAudio: boolean;
  chatId: string;
  createdAt: string;
  updatedAt: string;
}

const SOCKET_URL = process.env.JOB_SERVICE_URL as string;

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({children}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const state = useSelector((state: RootState) => state?.user)
      const userId = state?.user?.data?._id
  
  useEffect(() => {
    if (!userId) return;
    const newSocket = io(SOCKET_URL, {
      query: { userId },
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });



    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  const sendMessage = (payload: ChatSocketPayload) => {
    if (socket?.connected) {
      socket.emit('newMessage', payload);
    } else {
      console.error('Socket not connected - message will not be sent in real-time');
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket?.connected) {
      socket.emit('joinRoom', roomId);
      console.log('Joined room:', roomId);
    }
  };





  const messageSeen=(chatId:string,userId:string)=>{
    if(socket?.connected){
      socket.emit('openChat',chatId,userId)
    }
  }


  const createRoom=(userId:string)=>{
    if(socket?.connected){
      socket?.emit('create-videocall-room',userId)
    }
  }




  const value = {
    socket,
    sendMessage,
    joinRoom,
    messageSeen,
    createRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};


export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};