const express = require('express');
const http = require('http');
const path = require('path');
const open = require('open');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    transports: ['websocket'],
    allowEIO3: true
});

app.set("view engine", "html");
app.engine("html", require("hbs").__express);
app.set("views", path.join(__dirname, "public/views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).render('home/index.html');
});

app.get('/viewer', (req, res) => {
    res.status(200).render('home/viewer.html');
});

const viewers = new Set();

io.on('connection', (socket) => {
    console.log('Novo usuário conectado:', socket.id);

    // Quando um usuário está pronto para transmitir vídeo
    socket.on('ready', () => {
        socket.broadcast.emit('readyToView');
    });

    // Quando o usuário envia uma oferta
    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer, socket.id);
    });

    // Quando o usuário envia uma resposta
    socket.on('answer', (answer, id) => {
        socket.to(id).emit('answer', answer);
    });

    // Quando o usuário envia um candidato
    socket.on('candidate', (candidate, id) => {
        socket.to(id).emit('candidate', candidate);
    });

    // Quando o usuário se desconecta
    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`The server is now running on port ${PORT}`);
    open(`http://localhost:${PORT}`);
});
