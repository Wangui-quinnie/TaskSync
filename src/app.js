const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(taskRoutes);
app.use(authRoutes);
app.use(express.static('public'));

// Socket.IO
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('taskAdded', (task) => {
        io.emit('taskAdded', task);
    });

    socket.on('taskUpdated', (task) => {
        io.emit('taskUpdated', task);
    });

    socket.on('taskDeleted', (taskId) => {
        io.emit('taskDeleted', taskId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
