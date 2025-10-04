require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth.routes');
const circleRoutes = require('./routes/circle.routes');
const eventRoutes = require('./routes/event.routes');
const checkpointRoutes = require('./routes/checkpoint.routes');
const objectiveRoutes = require('./routes/objective.routes');
const locationRoutes = require('./routes/location.routes');

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/checkpoints', checkpointRoutes);
app.use('/api/objectives', objectiveRoutes);
app.use('/api/locations', locationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Date Planner API' });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join event room for realtime updates
  socket.on('join-event', (eventId) => {
    socket.join(`event:${eventId}`);
    console.log(`Client joined event:${eventId}`);
  });
  
  // Handle location updates
  socket.on('update-location', (data) => {
    const { eventId, userId, lat, lng } = data;
    // Broadcast to all clients in the event room
    io.to(`event:${eventId}`).emit('location-updated', {
      userId,
      lat,
      lng,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle checkpoint reveals
  socket.on('reveal-checkpoint', (data) => {
    const { eventId, checkpointId } = data;
    io.to(`event:${eventId}`).emit('checkpoint-revealed', { checkpointId });
  });
  
  // Handle objective completions
  socket.on('complete-objective', (data) => {
    const { eventId, objectiveId } = data;
    io.to(`event:${eventId}`).emit('objective-completed', { objectiveId });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
