const messageInput = document.getElementById("message-input");
const sendMessageBTN = document.getElementById("send-message");
const roomInput = document.getElementById("room-input");
const sendRoomBTN = document.getElementById("send-room");
const idInput = document.getElementById("id-input");
const sendIdBTN = document.getElementById("send-id");
const messageView = document.querySelector("#show-content");
const socketView = document.querySelector(".socket-holder");

const socket = io ("http://localhost:3000");

socket.on("connect", () => {
    displayMessage(`You connected with id: ${socket.id}`);
})

socket.on("server-message", (message) => {
    displayMessage(`Recieved: ${message}`);
})

socket.on("server-activeSockets", (activeSockets) => {
    const filteredSockets = activeSockets.filter(id => id !== socket.id);
    displaySocket(filteredSockets);
})

sendMessageBTN.addEventListener("click", (event) => {
    event.preventDefault();
    let message = messageInput.value;
    console.log(message);
    displayMessage(`Sent: ${message}`);
    socket.emit("client-message", message);
})

sendRoomBTN.addEventListener("click", () => {
    let room = roomInput.value;
    displayMessage(room);
    socket.emit("room-request", room, (serverNotice) => {
        displayMessage(serverNotice)
    });
});

sendIdBTN.addEventListener("click", () => {
    let receiverId = idInput.value;
    displayMessage(`Button clicked`);
    socket.emit("id-request", receiverId, (serverNotice) => {
        displayMessage(serverNotice);
    })
})

function displaySocket(socketArray) {
    const existingNodes = Array.from(socketView.children);
    const existingIds = existingNodes.map(node => node.innerText);

    // Remove sockets that no longer exist
    for (const node of existingNodes) {
        if (!socketArray.includes(node.innerText)) {
            node.remove();
        }
    }

    // Add sockets that are new
    for (const id of socketArray) {
        if (!existingIds.includes(id)) {
            const socketValue = document.createElement("div");
            socketValue.textContent = id;
            socketValue.style.padding = "2.5px";
            socketView.append(socketValue);
        }
    }
}

function displayMessage(message) {
    let messageValue = document.createElement("div");
    messageValue.textContent = message;
    messageValue.style.padding = "2.5px";
    messageView.append(messageValue);
}