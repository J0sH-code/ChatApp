import { Server} from 'socket.io';
import  express  from 'express';

const port = process.env.port || 3000;
const app =  express();

app.use(express.static("../Client"));
const serverExpress = app.listen(port, () => console.log(`Listening at port ${port}`));

const io = new Server(serverExpress, {
    cors: {
        origin: "*",
        methods: ["GET","POST"]
    }
});

//Holds socket connection states
let socketMap = new Map ();
let systemMessage;

function setPublic (socketId) {
    socketMap.set(socketId, {sessionMode: "public", connected_id: null, connected_room: null});
};

function directConnect (socket1, socket2) {
    socketMap.set(socket1, {sessionMode: "direct", connected_id: socket2, connected_room: null});
    socketMap.set(socket2, {sessionMode: "direct", connected_id: socket1, connected_room: null});
};

function roomConnect(socketId, room) {
    socketMap.set(socketId, {sessionMode: "room", connected_id: null, connected_room: room})
}

io.on('connection', (socket) => {
    console.log(io.sockets.adapter.sids.keys());

    let activeSockets = Array.from(io.sockets.adapter.sids.keys());
    console.log(activeSockets);

    setPublic(socket.id);

    //Sends list of active sockets to the client
    io.emit("server-activeSockets", activeSockets);

    /*
     * Handles and recieve room numbers from client
     * Sends confirmation if socket successfully joined room
     */
    socket.on("room-request", (room, serverSendNotice) => {
        socket.join(room);

        roomConnect(socket.id, room);
        serverSendNotice(`Joined ${Array.from(socket.rooms.values())[1]}`);
    })

    //Handles socket disconnect
    socket.on("disconnect", () => {
        let new_activeSockets = Array.from(io.sockets.adapter.sids.keys());
        
        //Sends a notice to the socket connected to this ID
        systemMessage = {
            type: "system",
            content: `${socket.id} has disconnected, reverting to public message connection`,
            timestamp: Date.now()
        } 
        
        if (socketMap.get(socket.id).sessionMode === "direct") {
            const connectedSocket = socketMap.get(socket.id).connected_id;
            setPublic(connectedSocket);
        }
        socketMap.delete(socket.id);
        io.emit("socket-disconnect", new_activeSockets, systemMessage);
    })

    //Handles id request for specific message connections
    socket.on("id-request", (receiverId, senderId, serverSendNotice) => {
        serverSendNotice(`Requesting to ${receiverId}`);

        socket.to(receiverId).emit("id-requestNotice", senderId);
    });

    socket.on("accept-IDreq", (senderId, receiverId, serverSendNotice) => {
        directConnect(receiverId,senderId);

        serverSendNotice(`Sending to ${senderId}`);
        socket.to(senderId).emit("IdConnect-accepted", `Sending to ${receiverId}`);
        console.log(socketMap);
    })

    socket.on("reject-IDreq", (senderId, receiverId,serverSendNotice) => {
        serverSendNotice(`RequIest rejected`);
        socket.to(senderId).emit("IdConnect-rejected", `${receiverId} rejected request`);
    })
    
    /*
     * Handles and recieve message from client
     * Sends message to other client
     */
    socket.on("client-message", (userMessage) => {
        let thisSocket = socket.id;
        console.log(socketMap.get(thisSocket));
        
        switch (socketMap.get(thisSocket).sessionMode) {
            case "direct":
                socket.to(socketMap.get(thisSocket).connected_id).emit("server-message", userMessage.message);
                console.log(socketMap.get(thisSocket).connected_id);
                break;
            case "room":
                socket.to(socketMap.get(thisSocket).connected_room).emit("server-message", userMessage.message);
                break;
            case "public":
                socket.broadcast.emit("server-message", userMessage.message);
                break;
            default:
                break;
        }
    });
})
