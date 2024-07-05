require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const open = require('open');
const socketIo = require('socket.io');
const twilio = require('twilio');

const app = express();

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const twilioGenerate = async function () {
    try {
        const token = await client.tokens.create();
        console.log(token);
    } catch (error) {
        console.log(error);
    }
}

// twilioGenerate()

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
    res.status(200).render('home/index.ejs', {
        ACCOUNTSID: process.env.ACCOUNTSID,
        DATECREATED: process.env.DATECREATED,
        DATEUPDATED: process.env.DATEUPDATED,
        URL: process.env.URL,
        URLS: process.env.URLS,
        URL3478: process.env.URL3478,
        USERNAME3478: process.env.USERNAME3478,
        URLS3478: process.env.URLS3478,
        CREDENTIAL3478: process.env.CREDENTIAL3478,
        URL3478TCP: process.env.URL3478TCP,
        USERNAME3478TCP: process.env.USERNAME3478TCP,
        URLS3478TCP: process.env.URLS3478TCP,
        CREDENTIAL3478TCP: process.env.CREDENTIAL3478TCP,
        URL443: process.env.URL443,
        USERNAME443: process.env.USERNAME443,
        URLS443: process.env.URLS443,
        CREDENTIAL443: process.env.CREDENTIAL443,
        PASSWORD: process.env.PASSWORD,
        TTL: process.env.TTL,
        USERNAME: process.env.USERNAME

    });
});

app.get('/viewer', (req, res) => {
    res.status(200).render('home/viewer.ejs', {
        ACCOUNTSID: process.env.ACCOUNTSID,
        DATECREATED: process.env.DATECREATED,
        DATEUPDATED: process.env.DATEUPDATED,
        URL: process.env.URL,
        URLS: process.env.URLS,
        URL3478: process.env.URL3478,
        USERNAME3478: process.env.USERNAME3478,
        URLS3478: process.env.URLS3478,
        CREDENTIAL3478: process.env.CREDENTIAL3478,
        URL3478TCP: process.env.URL3478TCP,
        USERNAME3478TCP: process.env.USERNAME3478TCP,
        URLS3478TCP: process.env.URLS3478TCP,
        CREDENTIAL3478TCP: process.env.CREDENTIAL3478TCP,
        URL443: process.env.URL443,
        USERNAME443: process.env.USERNAME443,
        URLS443: process.env.URLS443,
        CREDENTIAL443: process.env.CREDENTIAL443,
        PASSWORD: process.env.PASSWORD,
        TTL: process.env.TTL,
        USERNAME: process.env.USERNAME
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
