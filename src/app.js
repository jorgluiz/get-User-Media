require('dotenv').config();
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

// app.engine("html", require("hbs").__express);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).render('home/index.html', {
        STUN_SERVER: process.env.STUN_SERVER,
        TURN_USERNAME: process.env.TURN_USERNAME,
        TURN_CREDENTIAL: process.env.TURN_CREDENTIAL,
        TURNSPTURN80: process.env.TURNSPTURN80,
        TURNSPTURN3478: process.env.TURNSPTURN3478,
        TURNSPTURN80TCP: process.env.TURNSPTURN80TCP,
        TURNSPTURN3478TCP: process.env.TURNSPTURN3478TCP,
        TURNSPTURN443: process.env.TURNSPTURN443,
        TURNSPTURN5349: process.env.TURNSPTURN5349
    });
});

app.get('/viewer', (req, res) => {
    res.status(200).render('home/viewer.html', {
        STUN_SERVER: process.env.STUN_SERVER,
        TURN_USERNAME: process.env.TURN_USERNAME,
        TURN_CREDENTIAL: process.env.TURN_CREDENTIAL,
        TURNSPTURN80: process.env.TURNSPTURN80,
        TURNSPTURN3478: process.env.TURNSPTURN3478,
        TURNSPTURN80TCP: process.env.TURNSPTURN80TCP,
        TURNSPTURN3478TCP: process.env.TURNSPTURN3478TCP,
        TURNSPTURN443: process.env.TURNSPTURN443,
        TURNSPTURN5349: process.env.TURNSPTURN5349
    });
});

// const viewers = new Set();

// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     socket.on('ready', () => {
//         console.log('User is ready:', socket.id);
//         viewers.add(socket.id);
//         io.emit('updateViewers', Array.from(viewers));
//     });

//     socket.on('readyToView', () => {
//         console.log('Viewer connected:', socket.id);
//         io.emit('updateViewers', Array.from(viewers));
//     });

//     socket.on('offer', (offer, id) => {
//         socket.broadcast.emit('offer', offer, socket.id);
//     });

//     socket.on('answer', (answer, id) => {
//         io.to(id).emit('answer', answer, socket.id);
//     });

//     socket.on('candidate', (candidate, id) => {
//         io.to(id).emit('candidate', candidate, socket.id);
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//         viewers.delete(socket.id);
//         io.emit('updateViewers', Array.from(viewers));
//         socket.broadcast.emit('user-disconnected', socket.id);
//     });
// });

io.on('connection', (socket) => {
    console.log('Novo usuário conectado:', socket.id);

    socket.on('readyToView', () => {
        socket.broadcast.emit('readyToView');
    });

    socket.on('offer', (offer, id) => {
        console.log(`Enviando oferta para ${id}`);
        socket.broadcast.emit('offer', offer, socket.id);
    });

    socket.on('answer', (answer, id) => {
        console.log(`Enviando resposta para ${id}`);
        socket.to(id).emit('answer', answer);
    });

    socket.on('candidate', (candidate, id) => {
        console.log(`Enviando candidato para ${id}`);
        socket.to(id).emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

// Node Get ICE STUN and TURN list


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`The server is now running on port ${PORT}`);
    open(`http://localhost:${PORT}`);
});