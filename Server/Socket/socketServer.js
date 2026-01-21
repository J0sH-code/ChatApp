import { setPublic } from "./sessions.js";
import handlers from "./handlers.js";
import { io } from "../server.js";
import { socketMap } from "./sessions.js";

export default function socketServer(socket) {
    console.log(io.sockets.adapter.sids.keys());

    let activeSockets = Array.from(io.sockets.adapter.sids.keys());
    let handler = new handlers (socket);
    console.log(activeSockets);

    setPublic(socket.id);
    console.log(socketMap);

    //Sends list of active sockets to the client
    io.emit("server-activeSockets", activeSockets);

    /*
     * Handles and recieve room numbers from client
     * Sends confirmation if socket successfully joined room
     */
    socket.on("room-request", (room, serverSendNotice) => {
        try {
            handler.onRoomRequest(room,serverSendNotice);
        } catch (error) {
            console.log(error);
        }
    })

    //Handles socket disconnect
    socket.on("disconnect", () => {
        try {
            handler.onDisconnect();
        } catch (error) {
            console.log(error);
        }
    })

    //Handles id request for specific message connections
    socket.on("id-request", (receiverId, senderId, serverSendNotice) => {
        try {
            handler.onIdRequest(receiverId, senderId, serverSendNotice);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("accept-IDreq", (senderId, receiverId, serverSendNotice) => {
        try {
            handler.onAcceptId(senderId, receiverId, serverSendNotice);
        } catch (error) {
            console.log(error);
        }
    })

    socket.on("reject-IDreq", (senderId, receiverId,serverSendNotice) => {
        try {
            handler.onRejectId(senderId, receiverId,serverSendNotice);
        } catch (error) {
            console.log(error);
        }
    })

    /*
     * Handles and recieve message from client
     * Sends message to other client
     */
    socket.on("client-message", (userMessage) => {
        try {
            handler.onClientMessage(userMessage);
        } catch (error) {
            console.log(error);
        }

    });
}
