const express = require('express');
const http = require('http');
const path = require('path');
const open = require('open');
const app = express();
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

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

const peerConnections = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('ready', () => {
        console.log('User is ready:', socket.id);
    });

    socket.on('readyToView', () => {
        console.log('Viewer connected:', socket.id);
    });

    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer, socket.id);
    });

    socket.on('answer', (answer, id) => {
        io.to(id).emit('answer', answer, socket.id);
    });

    socket.on('candidate', (candidate, id) => {
        io.to(id).emit('candidate', candidate, socket.id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        socket.broadcast.emit('disconnect', socket.id);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`The server is now running on port ${PORT}`);
    open(`http://localhost:${PORT}`);
});
