/**
 * Socket Server Module
 * Handles all Socket.IO event listeners for a connected client
 * Manages room connections, direct messaging, and message routing
 */

import { setPublic } from "./sessions.js";
import handlers from "./handlers.js";
import { io } from "../server.js";
import { socketMap } from "./sessions.js";

/**
 * Initialize socket event listeners for a new connection
 * @param {Socket} socket - The connected Socket.IO socket instance
 */
export default function socketServer(socket) {
    console.log(io.sockets.adapter.sids.keys());

    // Get list of all connected socket IDs
    let activeSockets = Array.from(io.sockets.adapter.sids.keys());
    // Create event handler instance for this socket
    let handler = new handlers(socket);
    console.log(activeSockets);
    

    // Set socket to public mode initially
    setPublic(socket.id);
    console.log(socketMap);
    
    // Broadcast the list of active sockets to all clients
    io.emit("server-activeSockets", activeSockets);

    /**
     * Event: room-request
     * Client requests to join a chat room
     * @param {string} room - The room name/ID to join
     * @param {Function} serverSendNotice - Callback to send confirmation to client
     */
    socket.on("room-request", (room, serverSendNotice) => {
        try {
            handler.onRoomRequest(room,serverSendNotice);
        } catch (error) {
            console.log(error);
        }
    })
    
    /**
     * Event: disconnect
     * Handle when client disconnects from server
     * Notifies connected peer if in direct mode and reverts them to public
     */
    socket.on("disconnect", () => {
        try {
            handler.onDisconnect();
        } catch (error) {
            console.log(error);
        }
    })

    /**
     * Event: id-request
     * Client requests direct connection with another specific client
     * @param {string} receiverId - The target socket ID
     * @param {string} senderId - The requester's socket ID
     * @param {Function} serverSendNotice - Callback to send status to client
     */
    socket.on("id-request", (receiverId, senderId, serverSendNotice) => {
        try {
            handler.onIdRequest(receiverId, senderId, serverSendNotice);
        } catch (error) {
            console.log(error);
        }
    });

    /**
     * Event: accept-IDreq
     * Client accepts an incoming direct connection request
     * Establishes bidirectional direct messaging between two clients
     */
    socket.on("accept-IDreq", (senderId, receiverId, serverSendNotice) => {
        try {
            handler.onAcceptId(senderId, receiverId, serverSendNotice);    
        } catch (error) {
            console.log(error);
        }
    })

    /**
     * Event: reject-IDreq
     * Client rejects an incoming direct connection request
     */
    socket.on("reject-IDreq", (senderId, receiverId, serverSendNotice) => {
        try {
            handler.onRejectId(senderId, receiverId,serverSendNotice);    
        } catch (error) {
            console.log(error);
        }
    })
    
    /**
     * Event: client-message
     * Client sends encrypted message to be routed
     * Message is routed based on session mode (public/room/direct)
     * @param {Object} userMessage - Encrypted message object with iv and ciphertext
     */
    socket.on("client-message", (userMessage) => {
        try {
            handler.onClientMessage(userMessage);
        } catch (error) {
            console.log(error);
        }
    });
}
