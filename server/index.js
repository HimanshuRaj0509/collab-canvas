// 1. Import necessary packages
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

// 2. Setup Express App
const app = express();
app.use(cors());

// 3. Create an HTTP server and integrate it with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // This should be your Vercel URL in production
    origin: ["http://localhost:5173", process.env.CLIENT_URL].filter(Boolean),
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// --- Data Storage ---
const roomHistories = {};
const roomUsers = {}; // To store user names and colors

// --- Helper for random names/colors ---
const randomNames = ["Lion", "Tiger", "Bear", "Wolf", "Fox", "Eagle", "Shark", "Panther"];
const randomColors = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899"];

// 4. Listen for incoming connections
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // When a user joins a room
  socket.on('join_room', (data) => {
    const { roomId } = data;
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Initialize room if it doesn't exist
    if (!roomHistories[roomId]) {
      roomHistories[roomId] = {
        history: [{ lines: [], texts: [] }],
        step: 0,
      };
      roomUsers[roomId] = {};
    }

    // Assign a name and color to the new user
    const name = randomNames[Math.floor(Math.random() * randomNames.length)];
    const color = randomColors[Math.floor(Math.random() * randomColors.length)];
    roomUsers[roomId][socket.id] = { name, color };
    
    // Send the current history to the new user
    socket.emit('load_initial_data', roomHistories[roomId]);
  });

  // When a user performs any action that changes history
  socket.on('history_change', (data) => {
      const { roomId, history, step } = data;
      if (roomHistories[roomId]) {
          roomHistories[roomId] = { history, step };
          // Broadcast the complete updated state to everyone in the room
          io.in(roomId).emit('history_updated', roomHistories[roomId]);
      }
  });

  // Listen for cursor data (this is transient, not saved)
  socket.on('cursor_move', (data) => {
    const user = roomUsers[data.roomId]?.[socket.id];
    if (user) {
        socket.to(data.roomId).emit('cursor_move', { ...data, userId: socket.id, ...user });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
    // Remove user from room on disconnect
    for (const roomId in roomUsers) {
        if (roomUsers[roomId][socket.id]) {
            delete roomUsers[roomId][socket.id];
            break;
        }
    }
  });
});

// 5. Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});