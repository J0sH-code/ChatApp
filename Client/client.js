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
    for (let i = 0; i < activeSockets.length; i++) {
        if (activeSockets[i] === socket.id) {
            activeSockets.splice(i,1);
        }
    }
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
    let socketNodeViews = socketView.children;
    console.log(socketArray);
    for (let i = 0; i < socketArray.length; i++) {
        let socketValue = document.createElement("div");
        socketValue.textContent = socketArray[i];
        socketValue.style.padding = "2.5px";
        
        //The list view of active sockets does not work for multi socket scenarios
        //TODO: Revisit and rewrite to present ONLY the active sockets

        //Deletes child if a child element of socketValue is unequal to the socketArray
        for (let j = 0; j < socketNodeViews.length; j++) {
            console.log(socketNodeViews[j].innerText);
            if (socketNodeViews[j].innerText !== socketArray[i]) {
                socketNodeViews[j].remove();
            }  
        }
        socketView.append(socketValue);
    }
}

function displayMessage(message) {
    let messageValue = document.createElement("div");
    messageValue.textContent = message;
    messageValue.style.padding = "2.5px";
    messageView.append(messageValue);
}