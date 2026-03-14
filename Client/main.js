/**
 * Main Entry Point Module
 * Initializes the chat application and sets up event listeners
 */
import { 
    setupSocketListeners, 
    sendClientMessage, 
    requestRoom, 
    requestDirectConnection 
} from "./socketClient.js";

import { 
    messageInput, 
    sendMessageBTN, 
    roomInput, 
    sendRoomBTN, 
    idInput, 
    sendIdBTN,
    menuButton,
    dropdown,
    openRoom,
    openId,
    idSection,
    roomSection,
    cancelRoomBtn,
    cancelIdBtn,
    socketView
} from "./domElements.js";

import { displayMessage } from "./ui.js";

// Initialize socket connection and listeners
setupSocketListeners();

/**
 * Handle clicks on dynamically created socket ID elements
 */
socketView.addEventListener("click", async (e) => {
    const socketElement = e.target.closest(".socketId");
    if (socketElement) {
        let receiverId = socketElement.textContent.trim();
        await requestDirectConnection(receiverId);
        console.log(receiverId);
    }
});

/**
 * Send Message Button Event Listener
 */
sendMessageBTN.addEventListener("click", async () => {
    let message = messageInput.value;

    if (message.trim() === "") {
        return; // Don't send empty messages
    }

    console.log(message);
    displayMessage(`Sent: ${message}`);

    await sendClientMessage(message);
    messageInput.value = ""; // Clear input
});

/**
 * Join Room Button Event Listener
 */
sendRoomBTN.addEventListener("click", async () => {
    let room = roomInput.value;

    if (room.trim() === "") {
        return; // Don't send empty room names
    }

    displayMessage(room);
    await requestRoom(room);
    roomSection.classList.add("hide");
});

/**
 * Request Direct Connection Button Event Listener
 */
sendIdBTN.addEventListener("click", async () => {
    let receiverId = idInput.value;

    if (receiverId.trim() === "") {
        return; // Don't send empty IDs
    }

    await requestDirectConnection(receiverId);
    idSection.classList.add("hide");
});


// Add Enter Key to send message
messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessageBTN.click();
    }
});
idInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendIdBTN.click();
    }
});
roomInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendRoomBTN.click();
    }
});

// Toggle dropdown menu
menuButton.addEventListener("click", () => {
    dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
});

/**
 * Open Room Section from Menu
 */
openRoom.addEventListener("click", () => {
    roomSection.classList.remove("hide");
    dropdown.style.display = "none";
});

/**
 * Open ID Section from Menu
 */
openId.addEventListener("click", () => {
    idSection.classList.remove("hide");
    dropdown.style.display = "none";
});

/**
 * Close Room Section Button
 */
cancelRoomBtn.addEventListener("click", () => {
    roomSection.classList.add("hide");
    roomInput.value = ""; // Clear input
});

/**
 * Close ID Section Button
 */
cancelIdBtn.addEventListener("click", () => {
    idSection.classList.add("hide");
    idInput.value = ""; // Clear input
});

// just so it clears when you click outside the menu
document.addEventListener("click", (e) => {
    if (!menuButton.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
    }
});

// another pop up sections
openRoom.addEventListener("click", () => {
    roomSection.classList.remove("hide");
    idSection.classList.add("hide");
    dropdown.style.display = "none";
    roomInput.focus();
});

openId.addEventListener("click", () => {
    idSection.classList.remove("hide");
    roomSection.classList.add("hide");
    dropdown.style.display = "none";
    idInput.focus();
});

