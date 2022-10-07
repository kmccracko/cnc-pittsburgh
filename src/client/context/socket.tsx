import React, { createContext } from 'react';
import { io, Socket } from 'socket.io-client';

const socket = io(`http://66.228.42.169:3333`),
  SocketContext = createContext<Socket>(socket);

// const SocketProvider = ({ children }: any) => {
//   return (
//     <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
//   );
// };
export {
  SocketContext,
  // SocketProvider
};
