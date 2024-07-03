import express from 'express'
import http from 'http'
import socketIo from 'socket.io'
import path from 'path'
import open from 'open'

await import('dotenv').then((module) => module.config()); // Importa e configura dotenv

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const stunServerUrl = process.env.STUN_SERVER_URL;

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);

    // Importação dinâmica do módulo 'open'
    const open = (await import('open')).default;

    // Abrir a página inicial automaticamente
    open(`http://localhost:${PORT}`);
});