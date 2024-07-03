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

const peerConnections = {};
const viewers = new Set();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('ready', () => {
        console.log('User is ready:', socket.id);
        viewers.add(socket.id);
        io.emit('updateViewers', Array.from(viewers));

        // Emite uma oferta para todos os visualizadores
        viewers.forEach(viewerId => {
            if (viewerId !== socket.id) {
                socket.emit('offer', peerConnections[viewerId].peerConnection.localDescription, viewerId);
            }
        });

        // Armazena o `localStream` do usuário
        if (!peerConnections[socket.id]) {
            peerConnections[socket.id] = {
                peerConnection: new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
            };
            peerConnections[socket.id].peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit('candidate', event.candidate);
                }
            };
        }

        if (localStream) {
            peerConnections[socket.id].peerConnection.addStream(localStream);
        }
    });

    socket.on('readyToView', () => {
        console.log('Viewer connected:', socket.id);
        io.emit('updateViewers', Array.from(viewers));
    });

    socket.on('offer', async (offer, id) => {
        console.log(`Received offer from ${id}`);
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log(`Sending candidate to ${id}`);
                socket.emit('candidate', event.candidate, id);
            }
        };

        peerConnection.ontrack = event => {
            console.log(`Received track from ${id}`);
            // Adiciona a stream recebida ao visualizador
            io.to(id).emit('offer', offer, socket.id);
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        console.log(`Sending answer to ${id}`);
        socket.emit('answer', answer, id);

        peerConnections[id] = peerConnection;
    });

    socket.on('answer', async (answer, id) => {
        console.log(`Received answer from ${id}`);
        const peerConnection = peerConnections[id];
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    });

    socket.on('candidate', async (candidate, id) => {
        console.log(`Received candidate from ${id}`);
        const peerConnection = peerConnections[id];
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        viewers.delete(socket.id);
        io.emit('updateViewers', Array.from(viewers));
        socket.broadcast.emit('user-disconnected', socket.id);

        const peerConnection = peerConnections[socket.id];
        if (peerConnection) {
            peerConnection.close();
            delete peerConnections[socket.id];
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`The server is now running on port ${PORT}`);
    open(`http://localhost:${PORT}`);
});
