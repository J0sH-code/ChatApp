/**
 * Socket Client Module
 * Handles Socket.IO connection and all socket event listeners
 */

import { setSharedKey, encryptMessage, decryptMessage, userMessage, getKey } from "./encryption.js";
import { 
    displayMessage, 
    displaySocket, 
    idRequestNotice, 
    remove_idRequestNotice 
} from "./ui.js";
import { popUpAcceptBtn, popUpIgnoreBtn } from "./domElements.js";

export const socket = io("http://localhost:3000");

/**
 * Setup all socket event listeners
 */
export function setupSocketListeners() {
    socket.on("connect", async () => {
        displayMessage(`You connected with id: ${socket.id}`);
        // Set key for public mode (shared by all clients in public mode)
        await setSharedKey("public-shared-key");
    });

    socket.on("server-message", async (message, privateKey) => {
        const messageBlock = message;
        const currentKey = getKey();
        const decryptedMessage = await decryptMessage(message, currentKey);
        const messageObj = JSON.parse(decryptedMessage);

        displayMessage(`Recieved: ${messageObj.content}`);
        console.log(privateKey);
        console.log(messageBlock);
        console.log(typeof messageBlock);
    });

    socket.on("server-activeSockets", (activeSockets) => {
        const filteredSockets = activeSockets.filter(id => id !== socket.id);
        displaySocket(filteredSockets);
    });

    socket.on("direct-socket-disconnect", (activeSockets, systemMessage) => {
        let message = JSON.parse(systemMessage);
        const filteredSockets = activeSockets.filter(id => id !== socket.id);
        displayMessage(message.content);
        displaySocket(filteredSockets);
    });

    socket.on("public-socket-disconnect", (activeSockets) => {
        const filteredSockets = activeSockets.filter(id => id !== socket.id);
        displaySocket(filteredSockets);
    });

    socket.on("id-requestNotice", (senderId) => {
        idRequestNotice(senderId);

        const acceptHandler = async () => {
            // Derive key from both socket IDs (sorted) for direct connection
            const sortedIds = [senderId, socket.id].sort().join("-");
            await setSharedKey(`direct-${sortedIds}`);
            socket.emit("accept-IDreq", senderId, socket.id, (serverNotice) => {
                displayMessage(serverNotice);
            });
            remove_idRequestNotice(null);
            // Remove this handler after use
            popUpAcceptBtn.removeEventListener("click", acceptHandler);
        };

        const ignoreHandler = () => {
            socket.emit("reject-IDreq", senderId, socket.id, (serverNotice) => {
                displayMessage(serverNotice);
            });
            remove_idRequestNotice(null);
            // Remove this handler after use
            popUpIgnoreBtn.removeEventListener("click", ignoreHandler);
        };

        popUpAcceptBtn.addEventListener("click", acceptHandler);
        popUpIgnoreBtn.addEventListener("click", ignoreHandler);
    });

    socket.on("IdConnect-accepted", (acceptMessage) => {
        displayMessage(acceptMessage);
    });

    socket.on("IdConnect-rejected", (acceptMessage) => {
        displayMessage(acceptMessage);
    });
}

/**
 * Emit a client message through Socket.IO
 * @param {string} message - The message content
 */
export async function sendClientMessage(message) {
    const currentKey = getKey();
    const encryptedMessage = await encryptMessage(userMessage(message, socket.id), currentKey);
    socket.emit("client-message", encryptedMessage);
}

/**
 * Request to join a room
 * @param {string} room - The room name
 */
export async function requestRoom(room) {
    // Derive key from room name so all clients in the room use the same key
    await setSharedKey(`room-${room}`);
    socket.emit("room-request", room, (serverNotice) => {
        displayMessage(serverNotice);
    });
}

/**
 * Request a direct connection with another socket
 * @param {string} receiverId - The target socket ID
 */
export async function requestDirectConnection(receiverId) {
    // Derive key from both socket IDs (sorted) for direct connection
    const sortedIds = [socket.id, receiverId].sort().join("-");
    await setSharedKey(`direct-${sortedIds}`);
    socket.emit("id-request", receiverId, socket.id, (serverNotice) => {
        displayMessage(serverNotice);
    });
}
