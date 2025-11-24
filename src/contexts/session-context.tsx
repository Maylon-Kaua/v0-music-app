import React, { createContext, useContext, useState } from 'react';

interface SessionContextType {
  nickname: string;
  room: string;
  setNickname: (nickname: string) => void;
  createRoom: (room: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nickname, setNickname] = useState<string>('');
  const [room, setRoom] = useState<string>('');

  const createRoom = (newRoom: string) => {
    setRoom(newRoom);
  };

  return (
    <SessionContext.Provider value={{ nickname, room, setNickname, createRoom }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
