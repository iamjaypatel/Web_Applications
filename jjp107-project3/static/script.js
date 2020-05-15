function postMessage(message) {
    var httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        return false;
    }
    httpRequest.open('POST', '/postMessage');
    httpRequest.setRequestHeader('Content-Type', 'application/json', 'charset=utf-8');
    let user = "{{session['user_id']}}";

    let info = JSON.stringify({
        msg: message
    });
    httpRequest.send(info);
}

function getMessage() {
    var httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        return false;
    }

    httpRequest.onreadystatechange = function () {
        elementHandler(httpRequest);
    };

    httpRequest.open("GET", "/getMessage");
    httpRequest.send();

}

function elementHandler(httpRequest) {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            if (httpRequest.responseText === 'check lobby') {
                window.location.href = '/chatLobby'
            } else {
                const message = JSON.parse(httpRequest.responseText);
                const table = document.getElementById('chatLog').getElementsByTagName('tbody')[0];
                const time = new Date(Date.now() - 1000);
                //const timeString = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

                for (var i = 0; i < message.length; i++) {
                    let row = table.insertRow(table.rows.length);
                    let user = row.insertCell(0).appendChild(document.createTextNode(message[i][1]));
                    let msg = row.insertCell(1).appendChild(document.createTextNode(message[i][0]));
                }
            }
        }
    }
}

document.getElementById('postMsg').addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    event.preventDefault();
    let msg = document.getElementById('txtMessage').value;
    postMessage(msg);
    document.getElementById('txtMessage').value = '';
});

function message_pull() {
    getMessage();
    setTimeout(message_pull, 1000);
}

$(document).ready(function () {
    setTimeout(message_pull, 1000);
});