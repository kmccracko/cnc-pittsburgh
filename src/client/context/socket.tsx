import React, { createContext } from 'react';
import { io, Socket } from 'socket.io-client';

const socket = io(`http://localhost:${3003}`),
  SocketContext = createContext<Socket>(socket);

const SocketProvider = ({ children }: any) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
export { SocketContext, SocketProvider };
