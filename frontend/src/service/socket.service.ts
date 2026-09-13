import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (access_token?: string): Socket => {
    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8090";

    socket = io(socketUrl, {
        withCredentials: true,
        ...(access_token ? { auth: { access_token } } : {}),
    });

    return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
