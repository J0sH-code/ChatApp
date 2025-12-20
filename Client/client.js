const messageInput = document.getElementById("message-input");
const sendMessageBTN = document.getElementById("send-message");
const roomInput = document.getElementById("room-input");
const sendRoomBTN = document.getElementById("send-room");
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
    displaySocket(activeSockets);
})

sendMessageBTN.addEventListener("click", function (event) {
    event.preventDefault();
    let message = messageInput.value;
    console.log(message);
    displayMessage(`Sent: ${message}`);
    socket.emit("client-message", message);
})

sendRoomBTN.addEventListener("click", function (){
    let room = roomInput.value;
    socket.emit("room-request", room);
});

function displaySocket(socketArray) {
    socketArray.forEach(socket => {
        let socketValue = document.createElement("div");
        socketValue.textContent = socket;
        socketValue.style.padding = "2.5px";
        socketView.append(socketValue);
    });
}

function displayMessage(message) {
    let messageValue = document.createElement("div");
    messageValue.textContent = message;
    messageValue.style.padding = "2.5px";
    messageView.append(messageValue);
}