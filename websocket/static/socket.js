let s;
let login = `
    <input id="name" onkeydown="
        if (event.key === 'Enter') {
            send(s, this.value, 'name');
            document.querySelector('#fails').innerHTML = '';
            document.querySelector('#msgs').innerHTML = login;
        }
    ">
    <button onclick="
        send(s, document.querySelector('#name').value, 'name');
        document.querySelector('#fails').innerHTML = '';
        document.querySelector('#msgs').innerHTML = login;
    ">login</button>
`;
let sen = `
        <input id="send" onkeydown="
            if (event.key === 'Enter') {
                send(s, this.value);
                this.value = '';
                document.querySelector('#fails').innerHTML = '';
            }    
        ">
        <button onclick="
            send(s, document.querySelector('#send').value);
            document.querySelector('#send').value = '';
            document.querySelector('#fails').innerHTML = '';
        ">send</button> <button onclick="
            send(s, '', 'leave');
            document.querySelector('#msgs').innerHTML = cr;
            document.querySelector('#fails').innerHTML = '';
        ">leave room</button><br>
    `;
let cr = `<input id="cr" onkeydown="
            if (event.key === 'Enter') {
                if (this.value == '') {
                    this.value = 'default'
                }
                send(s, this.value, 'create');
                this.value = '';
            }    
        ">
        <button onclick="
            if (document.querySelector('#cr').value == '') {
                document.querySelector('#cr').value = 'default'
            }
            send(s, document.querySelector('#cr').value, 'create');
            document.querySelector('#cr').value = '';
        ">create</button><br>
    `;

let connect = function(name) {
    const s = new WebSocket('ws://127.0.0.1:5001');
    s.onopen = function() {
        send(s, name, 'name');
    };
    s.onmessage = function(e) {
        let header = JSON.parse(e.data)[0];
        let msg = JSON.parse(e.data)[1];
        console.log(header)
        console.log(msg)
        if (header === 'msg'){
            document.querySelector('#msgs').innerHTML += `${msg}<br>`;
        }
        else if (header === 'rooms') {
            let text = "";
            for (let i = 0; i < msg.length; i++) {
                text += msg[i] + ` <button onclick="
                    send(s, \`${msg[i]}\`, 'join')
                    document.querySelector('#msgs').innerHTML = sen;
                    document.querySelector('#rooms').innerHTML = '';
                    document.querySelector('#fails').innerHTML = '';
                ">join</button><br>`;
            }
            document.querySelector("#rooms").innerHTML = text;
        }
        else if (header === 'fail'){
            document.querySelector('#fails').innerHTML = msg;
        }
        else if (header === 'success') {
            if (msg === 'room') {
                document.querySelector('#msgs').innerHTML = sen;
                document.querySelector('#rooms').innerHTML = '';
                document.querySelector('#fails').innerHTML = '';
            }
            if (msg === 'name') {
                document.querySelector('#msgs').innerHTML = cr;
            }
        }
    }
    return s
}

let send = function(s, msg, header = 'msg') {
    if (header === 'msg') {
        s.send(JSON.stringify([header, msg]))
        document.querySelector('#msgs').innerHTML += `<span class="names">you</span>: ${msg}<br>`;
    }
    else {
        s.send(JSON.stringify([header, msg]))
    }
}
