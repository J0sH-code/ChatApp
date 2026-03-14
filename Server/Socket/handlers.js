/**
 * Socket Event Handlers
 * Handles all Socket.IO events with business logic
 * Manages room connections, direct messaging, and disconnections
 */

import {
    socketMap, 
    setPublic, 
    directConnect, 
    roomConnect
} from "./sessions.js";

import routeMessage from "./router.js";
import { io } from "../server.js";

/**
 * Validate input and emit error if missing
 * @param {*} input - The input value to validate
 * @param {string} reasonContent - Description of the expected input
 */
function inputCheck(input, reasonContent) {
    if (input == null) {
        const reason = `${reasonContent} not recieved`;
        this.socket.emit("server-error", reason);
    }
}

/**
 * Create a system-level disconnect message
 * @param {string} socketId - The ID of disconnecting socket
 * @returns {Object} Formatted message object
 */
function disconnectMessage(socketId) {
    return {
        type: "system",
        content: `${socketId} has disconnected, reverting to public message connection`,
        timestamp: Date.now()
    }
}

/**
 * Handler class for Socket.IO events
 * Contains all event handling logic for client interactions
 */
export default class handlers {
    /**
     * Initialize handler with socket reference
     * @param {Socket} socket - The Socket.IO socket instance
     */
    constructor(socket) {
        this.socket = socket;
    }
    
    /**
     * Handle room join request
     * @param {string} room - The room name to join
     * @param {Function} serverSendNotice - Callback to send confirmation
     */
    onRoomRequest(room, serverSendNotice) {
        inputCheck(room, "Room");

        this.socket.join(room);
        roomConnect(this.socket.id, room);
        serverSendNotice(`Joined ${Array.from(socket.rooms.values())[1]}`);
    };

    /**
     * Handle socket disconnection
     * Cleans up session data and notifies connected peers
     */
    onDisconnect(){
        let new_activeSockets = Array.from(io.sockets.adapter.sids.keys());

        //Sends a notice to the socket connected to this ID
        if (socketMap.get(this.socket.id).sessionMode === "direct") {
            const connectedSocket = socketMap.get(this.socket.id).connected_id;

            io.to(connectedSocket).emit("direct-socket-disconnect", new_activeSockets, JSON.stringify(disconnectMessage(this.socket.id)));
            setPublic(connectedSocket);
        }
        socketMap.delete(this.socket.id);
        io.emit("public-socket-disconnect", new_activeSockets, this.socket.id);
    };

    /**
     * Handle incoming direct connection request
     * Sends request notification to target client
     */
    onIdRequest(receiverId, senderId, serverSendNotice){
        inputCheck(receiverId, "Requested ID");
        serverSendNotice(`Requesting to ${receiverId}`);

        this.socket.to(receiverId).emit("id-requestNotice", senderId);
    };

    /**
     * Handle acceptance of direct connection request
     * Establishes bidirectional direct messaging between two clients
     */
    onAcceptId(senderId, receiverId, serverSendNotice){
        inputCheck(senderId, "Sender ID");
        directConnect(receiverId,senderId);

        serverSendNotice(`Sending to ${senderId}`);
        this.socket.to(senderId).emit("IdConnect-accepted", `Sending to ${receiverId}`);
        console.log(socketMap);
    };

    /**
     * Handle rejection of direct connection request
     * Notifies requester that request was declined
     */
    onRejectId(senderId, receiverId,serverSendNotice){
        serverSendNotice(`Request rejected`);
        this.socket.to(senderId).emit("IdConnect-rejected", `${receiverId} rejected request`);
    };

    /**
     * Handle incoming encrypted message from client
     * Routes message based on session mode (public/room/direct)
     */
    onClientMessage(userMessage){
        console.log(userMessage);

        const response = routeMessage(this.socket, userMessage);

        if(!response.ok){
            this.socket.emit("server-error", response.reason);
        }
    }
}
