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

// Socket.IO connection
// Change to https://chatapp-1-91a9.onrender.com for production
// Use http://localhost:3000 for local development
export const socket = io("http://localhost:3000");

let requesting = false;
let requestedId = null;

/**
 * Setup all socket event listeners
 * Registers handlers for server events related to messaging and connections
 */
export function setupSocketListeners() {

    /**
     * Event: connect
     * Fires when client successfully connects to the server
     * Initializes public mode key for initial broadcast capability
     */
    socket.on("connect", async () => {
        displayMessage(`You connected with id: ${socket.id}`);
        // Set key for public mode (shared by all clients in public mode)
        await setSharedKey("public-shared-key");
    });

    /**
     * Event: server-message
     * Receives encrypted message from server
     * Decrypts using current session key and displays to user
     */
    socket.on("server-message", async (message) => {
        const currentKey = getKey();
        const decryptedMessage = await decryptMessage(message, currentKey);
        const messageObj = JSON.parse(decryptedMessage);

        displayMessage(`Recieved: ${messageObj.content}`);
        console.log(message);
    });

    /**
     * Event: server-activeSockets
     * Receives list of all currently connected socket IDs
     * Updates UI with available clients (excluding self)
     */
    socket.on("server-activeSockets", (activeSockets) => {
        const filteredSockets = activeSockets.filter(id => id !== socket.id);
        displaySocket(filteredSockets);
    });

    /**
     * Event: direct-socket-disconnect
     * Notifies client that their direct message peer has disconnected
     * Reverts socket back to public mode
     */
    socket.on("direct-socket-disconnect", (activeSockets, systemMessage) => {
        let message = JSON.parse(systemMessage);
        const filteredSockets = activeSockets.filter(id => id !== socket.id);
        displayMessage(message.content);
        displaySocket(filteredSockets);
    });

    /**
     * Event: public-socket-disconnect
     * Notifies clients when someone disconnects from public mode
     * Updates the active sockets list
     */
    socket.on("public-socket-disconnect", (activeSockets, disconnectedId) => {
        console.log(disconnectedId);
        console.log(requestedId);
        
        if (requesting && requestedId === disconnectedId) {
            displayMessage(`${requestedId} has disconnected. Reverting to public mode`);
        }
        const filteredSockets = activeSockets.filter(id => id !== socket.id);
        displaySocket(filteredSockets);
    });

    /**
     * Event: id-requestNotice
     * Incoming direct connection request from another client
     * Shows popup and sets up accept/ignore handlers
     */
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

    /**
     * Event: IdConnect-accepted
     * Notifies requester that their connection request was accepted
     * Direct messaging can now proceed
     */
    socket.on("IdConnect-accepted", (acceptMessage) => {
        requesting = false;
        displayMessage(acceptMessage);
    });

    /**
     * Event: IdConnect-rejected
     * Notifies requester that their connection request was rejected
     */
    socket.on("IdConnect-rejected", (acceptMessage) => {
        requesting = false;
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
    requesting = true;
    requestedId = receiverId;
    const sortedIds = [socket.id, receiverId].sort().join("-");
    await setSharedKey(`direct-${sortedIds}`);
    socket.emit("id-request", receiverId, socket.id, (serverNotice) => {
        displayMessage(serverNotice);
    });
}
