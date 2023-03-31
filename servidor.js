const express = require('express')
const socket_io = require('socket.io')();

const app = express();

app.use(express.static('public'));

let usuarios = [];

const server = app.listen(3000, { host: '127.0.0.1' }, () => {
    console.log('Servidor corriendo en el puerto: 3000')
});

const io = socket_io.listen(server, {
    maxHttpBufferSize: 10e6
})

io.on('connection', (socket) => {

    socket.on('mensaje', (usuario, mensaje) => {
        io.sockets.emit('mensaje-recibido', usuario, mensaje)

    })

    socket.on('mensaje-privado', (msg, recipient, remitente) => {
        const recipientSocket = usuarios.find(user => user.username === recipient)?.id;
        if (recipientSocket) {
            socket.to(recipientSocket).emit('mensaje-privado', msg, recipient, remitente);7
            socket.emit('mensaje-privado', msg, recipient, remitente);
        }
    });


    socket.on('escribiendo', (data) => {
        socket.broadcast.emit('escribiendo', data)
    })

    socket.on('resgistrar-usuario', (username) => {
        const userExists = usuarios.some(user => user.username === username);
        if (userExists) {
            let respuesta = true
            socket.emit('El usuario ya existe', respuesta);
        } else {
            usuarios.push({ id: socket.id, username });
            let respuesta = false
            socket.emit('resgistrar-usuario', respuesta);
            io.sockets.emit('nombres-usuarios', usuarios);
        }
        console.log(username, 'se ha conectado')
    });

    socket.on('disconnect', (data) => {
        const index = usuarios.findIndex(user => user.id === socket.id);
        if (index !== -1) {
            console.log(usuarios[index].username, 'se desconecto')
            usuarios.splice(index, 1);
        }
        io.sockets.emit('nombres-usuarios', usuarios);
    })

    socket.on('archivo', (data, usuario) => {
        io.sockets.emit('archivo', data, usuario);
    });

    socket.on('archivo-privado', (data, recipient, remitente) => {
        const recipientSocket = usuarios.find(user => user.username === recipient)?.id;
        if (recipientSocket) {
            socket.to(recipientSocket).emit('archivo-privado', data, recipient, remitente);
            socket.emit('archivo-privado', data, recipient, remitente);
        }
    });

});
