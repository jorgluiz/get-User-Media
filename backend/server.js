require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const open = require('open');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '../frontend')));

// Rota para servir o index.html para todas as requisições
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

io.on('connection', socket => {
    console.log('A user connected');

    socket.on('ready', () => {
        console.log('User is ready');
    });

    socket.on('offer', data => {
        socket.broadcast.emit('offer', data);
    });

    socket.on('answer', data => {
        socket.broadcast.emit('answer', data);
    });

    socket.on('candidate', data => {
        socket.broadcast.emit('candidate', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`The server is now running on port ${PORT}`);
    open(`http://localhost:${PORT}`);
})