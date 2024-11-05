let i = 1;
let s = {readyState: -1};
let txt;
let commands = {
    help: 'show this list.<br>syntax: help<br>',
    clear: 'clears console.<br>syntax: clear<br>',
    js: 'runs javascript.<br>syntax: js ~code~<br>',
    connected: 'shows websocket state.<br>syntax: connected?<br>',
    connect: 'connect to server.<br>syntax: connect ~password~ ~username~<br>',
    disconnect: 'disconnect from server.<br>syntax: disconnect<br><b>must be connected to server!</b><br>',
    sql: 'runs sql.<br>syntax: sql ~code~<br><b>must be connected to server!</b><br>',
    py: 'runs python.<br>syntax: py ~code~<br><b>must be connected to server!</b><br>',
    send: 'send data to server.<br>syntax: send ~header~ ~msg~<br><b>must be connected to server!</b><br>'
};

document.body.onkeydown = (e) => {
    let focus = document.activeElement;
    if (e.key === 'Enter') {
        if (focus !== document.querySelector('input')) {
            document.querySelector('input').focus()
            focus = document.activeElement;
        }
    }
};


document.querySelector('#console').onclick = (e) => {
    let newInput = document.querySelector(`#nextcmd`);
    newInput.focus();
}


document.querySelector('#nextcmd').onkeydown = (e) => {
    if (e.key === 'Enter') {
        next(e.target.value);
    }
}


function cmdparse(cmd) {
    resarr = cmd.split(' ');
    return [resarr[0], resarr.slice(1)]
}


function next(cmd) {
    parsedcmd = cmdparse(cmd);
    cmd = parsedcmd[0];
    attrs = parsedcmd[1];
    document.querySelector(`#cmd${i}`).innerHTML = `>${cmd} ${attrs.join(' ')}`;
    if (cmd === 'clear') {
        document.querySelector("#consolebody").innerHTML = ``;
        i = 0;
    }
    else if (cmd === 'help') {
        txt = '';
        for (let [key, value] of Object.entries(commands)) {
            txt += `${key}: ${value}<br>`;
        }
        document.querySelector("#consolebody").innerHTML += txt;
    }
    else if (cmd === 'connect') {
        s = connect(attrs[0], attrs[1]);
    }
    else if (cmd === 'disconnect') {
        s.close()
    }
    else if (cmd === 'js') {
        output = eval(attrs.join(' '));
        document.querySelector(`#consolebody`).innerHTML += `${output}`;
    }
    else if (cmd === 'send') {
        send(s, attrs.slice(1).join(' '), attrs[0]);
    }
    else if (cmd === 'sql') {
        send(s, attrs.join(' '), 'sql')
    }
    else if (cmd === 'py') {
        send(s, attrs.join(' '), 'py')
    }
    else if (cmd === 'connected?') {
        let dict = ['connection closed', 'connection not yet established', 'conncetion established', 'in closing handshake', 'connection closed or could not open'];
        document.querySelector("#consolebody").innerHTML += dict[s.readyState + 1];
    }
    else {
        document.querySelector("#consolebody").innerHTML += `command not found: ${cmd}`;
    }
    i++;
    document.querySelector("#consolebody").innerHTML += `<p id="cmd${i}">><input class="commandline" id="nextcmd" autocomplete="off"></p>`;
    let newInput = document.querySelector(`#nextcmd`);
    newInput.focus();
    newInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            next(e.target.value);
        }
    };
}


let connect = function(name, password) {
    const s = new WebSocket(`ws://${ip}:5001`);
    s.onopen = function() {
        send(s, [name, password], 'login');
    };
    s.onmessage = function(e) {
        let header = JSON.parse(e.data)[0];
        let msg = JSON.parse(e.data)[1];
        if (header === 'sql') {
            txt = '<table><tr>';
            let column = [Object.keys(msg[0][0])]
            msg[0].forEach((v) => {
                let r = [];
                for (let [key, value] of Object.entries(v)) {
                    r.push(value);
                }
                column.push(r);
            });
            column[0].forEach((v) => {
                txt += `<th>${v}</th>`;
            })
            txt += '</tr>'
            column.slice(1).forEach((v) => {
                txt += '<tr>';
                v.forEach((val) => {
                    txt += `<td>${val}</td>`;
                })
                txt += '</tr>';
            })
            txt += `</table><p>${msg[1]} row(s) returned.</p>`
            document.querySelector(`#cmd${i}`).innerHTML = txt;
        }
        else {
            document.querySelector(`#cmd${i}`).innerHTML = `message got: header: ${header}, msg: ${msg}`;
        }
        i++;
        document.querySelector("#consolebody").innerHTML += `<p id="cmd${i}">><input class="commandline" id="nextcmd" autocomplete="off"></p>`;
        let newInput = document.querySelector(`#nextcmd`);
        newInput.focus();
        newInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                next(e.target.value);
            }
        };
    }
    return s
}


let send = function(s, msg, header = 'msg') {
    if (msg !== '') {
        s.send(JSON.stringify([header, msg]))
    }
}