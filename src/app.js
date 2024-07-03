const express = require('express');
const http = require('http');
const path = require('path');
const open = require('open');
const app = express()
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

// Rota para servir o index.html para todas as requisições
// O código define o motor de visualização como HTML
app.set("view engine", "html");
app.engine("html", require("hbs").__express);
app.set("views", path.join(__dirname, "public/views"));

// Arquivos estáticos, incluindo CSS e JavaScript, a partir da pasta "public".
// Isso permite usar css e js em seus arquivos HTML.
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).render("./home/index.html");
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