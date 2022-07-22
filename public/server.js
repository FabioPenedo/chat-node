"use strict";
require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
let connectedUsers = [];
io.on('connection', (socket) => {
    console.log('Conexão detectada...');
    socket.on('join-request', (username) => {
        socket.username = username;
        connectedUsers.push(username);
        socket.emit('user-ok', connectedUsers);
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });
    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(user => user != socket.username);
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });
    socket.on('send-msg', (text) => {
        let obj = {
            username: socket.username,
            message: text
        };
        socket.broadcast.emit('show-msg', obj);
    });
});
server.listen(process.env.PORT, () => {
    console.log(`Running Address: ${process.env.BASE}`);
});
