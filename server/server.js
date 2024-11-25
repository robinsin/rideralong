const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Track active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('userConnected', (userId) => {
    activeUsers.set(socket.id, userId);
    console.log(`User ${userId} is now active`);
  });

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.chatId).emit('newMessage', {
      id: Date.now().toString(),
      text: data.text,
      senderId: data.senderId,
      timestamp: Date.now(),
      read: false
    });
  });

  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    const userId = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);
    console.log(`User ${userId} disconnected`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
