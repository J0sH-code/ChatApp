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
    sendIdBTN 
} from "./domElements.js";
import { displayMessage } from "./ui.js";

// Initialize socket connection and listeners
setupSocketListeners();

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
});

/**
 * Request Direct Connection Button Event Listener
 */
sendIdBTN.addEventListener("click", async () => {
    let receiverId = idInput.value;
    
    if (receiverId.trim() === "") {
        return; // Don't send empty IDs
    }

    displayMessage(`Button clicked`);
    await requestDirectConnection(receiverId);
});
