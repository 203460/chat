const socket = io()

const mensajes_salidas = document.querySelector('.salida')
const mensaje = document.querySelector('.mensaje')
const boton = document.querySelector('.boton')
const acceso = document.querySelector('.entrar')
const chat = document.querySelector('.chat-container')
const login = document.querySelector('.login-container')
const login_usuario = document.querySelector('.usuario-input')
const usuario = document.querySelector('.usuario')
const alerta_usuario = document.querySelector('.alerta-usuario')
const input_file = document.querySelector('.input-file')
const form_input = document.querySelector('.form-input')
const content_users = document.querySelector('.content-users')
const lista_usuario = document.querySelector('.lista-usuario')
const contenedor_usuarios = document.querySelector('.container-users')

acceso.addEventListener('click', () => {
    socket.emit('resgistrar-usuario', login_usuario.value)
})

form_input.addEventListener('submit', (e) => {
    e.preventDefault();
})

boton.addEventListener('click', (e) => {
    const file = input_file.files[0];
    msg = mensaje.value

    if (msg.startsWith('@')) {
        const recipient = msg.split(' ')[0].substring(1);
        const privateMsg = msg.substring(msg.indexOf(' ') + 1);
        if (mensaje.value.trim() !== `@${recipient}`) {
            socket.emit('mensaje-privado', privateMsg, recipient, login_usuario.value);
        }

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                socket.emit('archivo-privado', {
                    name: file.name,
                    type: file.type,
                    data: e.target.result,
                }, recipient, login_usuario.value);
            };
            input_file.value = '';
            return false;
        }
    } else {
        if (mensaje.value.trim() !== "") {
            socket.emit('mensaje', login_usuario.value, mensaje.value);
        }

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                socket.emit('archivo', {
                    name: file.name,
                    type: file.type,
                    data: e.target.result,
                }, login_usuario.value);
            };
            input_file.value = '';
            return false;
        }

    };

    mensaje.value = ''
})

socket.on('resgistrar-usuario', (respuesta) => {
    console.log(respuesta)
    if (respuesta) {
        console.log('Usuario ya conectado')
    } else {
        login.style.display = 'none'
        chat.classList.remove('chat-container-none')
        contenedor_usuarios.classList.remove('container-users-none')
        usuario.textContent = login_usuario.value;
    }
})
socket.on('mensaje-recibido', (usuario, mensaje) => {
    mensajes_salidas.innerHTML += `<p class="mensaje-salida"> <strong> ${usuario}:  </strong> ${mensaje}</p>`
})

socket.on('archivo', (data, usuario) => {
    const link = document.createElement('a');

    link.textContent = data.name;
    link.href = data.data;
    link.download = data.name;

    mensajes_salidas.innerHTML += `<div class="div-file"><p class="usuario-file"><strong>${usuario}: </strong></p> ${link.outerHTML}</div>`
});

socket.on('nombres-usuarios', (usuarios) => {
    let html = ''
    usuarios.forEach(element => {
        html += `<p class="lista-usuario">${element.username}</p>`
    })
    content_users.innerHTML = html
});

socket.on('mensaje-privado', (mensaje, usuario, remitente) => {
    mensajes_salidas.innerHTML += `<p class="mensaje-mensajes_salidas mensaje-privado"> <strong> ${remitente}:  </strong> ${mensaje}</p>`
})

socket.on('archivo-privado', (data, usuario, remitente) => {
    console.log(data)
    const link = document.createElement('a');

    link.textContent = data.name;
    link.href = data.data;
    link.download = data.name;

    mensajes_salidas.innerHTML += `<div class="div-file mensaje-privado"><p class="usuario-file"><strong>${remitente}: </strong></p> ${link.outerHTML}</div>`
})