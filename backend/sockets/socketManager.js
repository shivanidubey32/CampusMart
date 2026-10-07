import { Server } from 'socket.io';

let io;

export const initSockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // For dev
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected via socket: ${socket.id}`);

    // Join a specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat room: ${chatId}`);
    });

    // Join personal user room for notifications
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User joined personal room: user_${userId}`);
    });

    // Handle sending a message
    socket.on('send_message', (data) => {
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(data.chatId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
