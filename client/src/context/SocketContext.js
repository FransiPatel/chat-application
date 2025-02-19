import { createContext, useContext } from "react";
import socketService from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
};
