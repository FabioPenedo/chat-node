const socket = io();

let userList = [];
let userName = '';

let loginPage = document.querySelector('#login-page');
let chatPage = document.querySelector('#chat-page');

let loginInput = document.querySelector('#login-name-input');
let textInput = document.querySelector('#chat-text-input');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList () {
    let ul = document.querySelector('.user-list')
    ul.innerHTML = ''
    userList.forEach(item => {
        ul.innerHTML += `<li>${item}</li>`
    });
}

function addMessage(type, user, message) {
    let ul = document.querySelector('.chat-list');
     switch(type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${message}</li>`
        break;
        case 'message':
            if(userName == user) {
                ul.innerHTML += `<li class="m-text"><span class="me">${user}: </span>${message}</li>`
            } else {
                ul.innerHTML += `<li class="m-text"><span>${user}: </span>${message}</li>`
            }
        break;
    }

    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (event) => {
    if(event.keyCode === 13) {
        let name = loginInput.value.trim();
        if(name != '') {
            userName = name;
            document.title = `Chat (${userName})`;
            socket.emit('join-request', userName)
        }
    }

});

textInput.addEventListener('keyup', (event) => {
    if(event.keyCode === 13) {
        let text = textInput.value.trim();
        textInput.value = '';
        if(text != '') {
            addMessage('message', userName, text);
            socket.emit('send-msg', text);
        }        
    }
});

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conectado!')

    userList = list;
    renderUserList();
});

socket.on('list-update', (data) => {
    if(data.joined) {
        addMessage('status', null, `${data.joined} entrou no chat`);
    }
    if(data.left) {
        addMessage('status', null, `${data.left} saiu do chat`);
    }
    userList = data.list;
    renderUserList();
});

socket.on('show-msg', (data) => {
    addMessage('message', data.username, data.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado!')
    userList = [];
    renderUserList();
});

socket.on('connect_error', () => {
    addMessage('status', null, 'Tentando reconectar...')
});

socket.io.on('reconnect', () => {
    addMessage('status', null, 'Reconectado!')

    if(userName != '') {
        socket.emit('join-request', userName)
    }
});




