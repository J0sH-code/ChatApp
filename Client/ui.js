/**
 * UI Module
 * Handles all UI rendering functions for the chat application
 */

import { messageView, socketView, notificationPopup, notificationHeader, notificationBody } from "./domElements.js";

/**
 * Display a message in the message view
 * @param {string} message - The message to display
 */
export function displayMessage(message, senderId) {
    let messageValue = document.createElement("div");
    messageValue.style.padding = "2.5px";
    messageValue.classList.add("message-texts");

    

    // Check if message starts with 'Sent:' or 'Recieved:' and style accordingly
    if (message.startsWith("Sent:")) {
        const label = document.createElement("span");
        label.textContent = "Sent:";
        label.classList.add("sent-label");
        messageValue.appendChild(label);
        messageValue.appendChild(document.createTextNode(message.substring(5)));
    } else if (message.startsWith("Recieved:")) {
        const label = document.createElement("span");
        label.textContent = "Recieved:";
        label.classList.add("received-label");
        messageValue.appendChild(label);
        messageValue.appendChild(document.createTextNode(message.substring(9)));

        let senderAddr = document.createElement("span");
        senderAddr.textContent = ` - ${senderId}`;
        senderAddr.classList.add("senderId-label");
        messageValue.appendChild(senderAddr);
    } else {
        messageValue.textContent = message;
    }
    
    messageView.append(messageValue);
}

/**
 * Display list of active sockets in the socket holder
 * @param {array} socketArray - Array of socket IDs to display
 */
export function displaySocket(socketArray) {
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
            const socketValue = document.createElement("button");
            socketValue.classList.add("socketId");
            socketValue.textContent = id;
            socketValue.style.padding = "2.5px";
            socketView.appendChild(socketValue);
        }
    }
}

/**
 * Show the ID request popup notice
 * @param {string} id - The sender's ID to display in the popup
 */
export function idRequestNotice(id) {
    document.getElementById("request-id-expanded").textContent = id;
    notificationPopup.classList.remove("hide");
    notificationBody.classList.add("hide");
}

/**
 * Hide the ID request popup notice
 * @param {string} id - The ID value to set (default null)
 */
export function remove_idRequestNotice(id = null) {
    notificationPopup.classList.add("hide");
}
