import {socketMap, setPublic, directConnect, roomConnect} from "./sessions.js";
import routeMessage from "./router.js";
import { io } from "../server.js";

export default class handlers {
    constructor(socket) {
        this.socket = socket;
    }

    onRoomRequest(room, serverSendNotice) {
        if (room == null) {
            const reason = "Room cannot be recieved";
            this.socket.emit("server-error", reason);
        }
        this.socket.join(room);
        roomConnect(this.socket.id, room);
        serverSendNotice(`Joined ${Array.from(socket.rooms.values())[1]}`);
    };

    onDisconnect(){
        let new_activeSockets = Array.from(io.sockets.adapter.sids.keys());
        
        //Sends a notice to the socket connected to this ID
        let systemMessage = {
            type: "system",
            content: `${this.socket.id} has disconnected, reverting to public message connection`,
            timestamp: Date.now()
        } 
        
        if (socketMap.get(this.socket.id).sessionMode === "direct") {
            const connectedSocket = socketMap.get(this.socket.id).connected_id;
            setPublic(connectedSocket);
        }
        socketMap.delete(this.socket.id);
        io.emit("socket-disconnect", new_activeSockets, JSON.stringify(systemMessage));
    };

    onIdRequest(receiverId, senderId, serverSendNotice){
        serverSendNotice(`Requesting to ${receiverId}`);

        this.socket.to(receiverId).emit("id-requestNotice", senderId);
    };

    onAcceptId(senderId, receiverId, serverSendNotice){
        directConnect(receiverId,senderId);

        serverSendNotice(`Sending to ${senderId}`);
        this.socket.to(senderId).emit("IdConnect-accepted", `Sending to ${receiverId}`);
        console.log(socketMap);
    };

    onRejectId(senderId, receiverId,serverSendNotice){
        serverSendNotice(`RequIest rejected`);
        this.socket.to(senderId).emit("IdConnect-rejected", `${receiverId} rejected request`);
    };

    onClientMessage(userMessage){
        let messageBlock = JSON.parse(userMessage);
        const response = routeMessage(this.socket, messageBlock.content);

        if(!response.ok){
            this.socket.emit("server-error", response.reason);
        }
    }
}