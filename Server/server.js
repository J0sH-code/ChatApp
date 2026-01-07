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

function setSessionMap(activeSockets, socketMap) {
    for (let index = 0; index < activeSockets.length; index++) {
        socketMap.set(activeSockets[index], {sessionMode: "public", connected_id: null, connected_room: null});
        console.log(socketMap.get(activeSockets[index]).sessionMode);
    }
}

//Holds socket connection states
let socketMap = new Map ();

io.on('connection', (socket) => {
    console.log(io.sockets.adapter.sids.keys());

    let activeSockets = Array.from(io.sockets.adapter.sids.keys());
    let id = null;
    let connectedRoom = null;
    let socketConnected;
    console.log(activeSockets);
    
    socketMap.set(socket.id, {sessionMode: "public", connected_id: null, connected_room: null});

    //Sends list of active sockets to the client
    io.emit("server-activeSockets", activeSockets);

    /*
     * Handles and recieve room numbers from client
     * Sends confirmation if socket successfully joined room
     */
    
    socket.on("room-request", (room, serverSendNotice) => {
        socket.join(room);

        socketMap.set(socket.id, {sessionMode: "room", connected_id: null, connected_room: room})
        serverSendNotice(`Joined ${Array.from(socket.rooms.values())[1]}`);
    })


    //Handles socket disconnect
    socket.on("disconnect", () => {
        let new_activeSockets = Array.from(io.sockets.adapter.sids.keys());
        io.emit("server-activeSockets", new_activeSockets);
    })

    //Handles id request for specific message connections
    socket.on("id-request", (receiverId, senderId, serverSendNotice) => {
        serverSendNotice(`Requesting to ${receiverId}`);
        socket.to(receiverId).emit("id-requestNotice", senderId);
    });

    socket.on("accept-IDreq", (senderId, receiverId, serverSendNotice) => {
        socketMap.set(receiverId, {sessionMode: "direct", connected_id: senderId, connected_room: null});
        socketMap.set(senderId, {sessionMode: "direct", connected_id: receiverId, connected_room: null});

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
    socket.on("client-message", (messageStructure) => {
        let thisSocket = messageStructure.senderID;
        
        switch (socketMap.get(thisSocket).sessionMode) {
            case "direct":
                socket.to(socketMap.get(thisSocket).connected_id).emit("server-message", messageStructure.message);
                console.log(socketMap.get(thisSocket).connected_id);
                
                break;
            case "room":
                socket.to(socketMap.get(thisSocket).connected_room).emit("server-message", messageStructure.message);
                break;
            case "public":
                socket.broadcast.emit("server-message", messageStructure.message);
                break;
            default:
                break;
        }
    });
})
