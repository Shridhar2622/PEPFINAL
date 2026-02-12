import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from './UserContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useUser();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Initialize socket connection
            // Ensure we connect to the base URL (e.g., https://api.reservice.in) not the API path (e.g., .../api/v1)
            const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'https://api.reservice.in';
            const socketUrl = new URL(apiUrl).origin;

            const newSocket = io(socketUrl, {
                withCredentials: true,
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [isAuthenticated, user?.id]); // Re-connect only if user changes or auth state changes

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
