const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

io.on('connection', socket => {
    console.log('Um usuário conectou');

    socket.on('ready', () => {
        console.log('Usuário está pronto');
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
        console.log('Usuário desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor ouvindo na porta ${PORT}`);
});
