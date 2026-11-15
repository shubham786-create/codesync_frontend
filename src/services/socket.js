import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
    let socketUrl = apiUrl ? apiUrl.replace(/\/$/, '') : '/';

    socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: false,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}
