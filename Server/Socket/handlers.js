import {socketMap, setPublic, directConnect, roomConnect} from "./sessions.js";
import routeMessage from "./router.js";

export default class handlers {
    constructor(socket, io) {
        this.socket = socket;
        this.io = io;
    }

    onRoomRequest(room, serverSendNotice) {
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
        this.io.emit("socket-disconnect", new_activeSockets, systemMessage);
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
        const response = routeMessage(this.socket, userMessage.content);

        if(!response.ok){
            this.socket.emit("server-error", response.reason);
        }
    }
}