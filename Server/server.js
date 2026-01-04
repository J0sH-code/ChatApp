import { Server } from 'socket.io';
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

io.on('connection', (socket) => {
    console.log(io.sockets.adapter.sids.keys());

    let activeSockets = Array.from(io.sockets.adapter.sids.keys());
    let id = null;
    let socketConnected;
    console.log(activeSockets);
    
    //TODO Placeholder for socket connections
    let socketMap = new Map ([

    ])

    //Sends list of active sockets to the client
    io.emit("server-activeSockets", activeSockets);

    //Handles socket disconnect
    socket.on("disconnect", () => {
        let new_activeSockets = Array.from(io.sockets.adapter.sids.keys());
        io.emit("server-activeSockets", new_activeSockets);
    })

    //Handles id request for specific message connections
    socket.on("id-request", (receiverId, senderId, serverSendNotice) => {
        id = receiverId;
        console.log(id);
        serverSendNotice(`Requesting to ${id}`);

        socket.to(id).emit("id-requestNotice", senderId);
    });

    socket.on("accept-IDreq", (senderId, receiverId,serverSendNotice) => {
        socketConnected = true;
        id = senderId;
        serverSendNotice(`Sending to ${id}`);
        socket.to(id).emit("IdConnect-accepted", `Sending to ${receiverId}`);
    })

    socket.on("reject-IDreq", (senderId, receiverId,serverSendNotice) => {
        socketConnected = false;
        id = senderId;
        serverSendNotice(`Request rejected`);
        socket.to(id).emit("IdConnect-rejected", `${receiverId} rejected request`);
    })
    
    /*
     * Handles and recieve message from client
     * Sends message to other client
     */
    socket.on("client-message", (message) => {
        if (id === null) {
            socket.broadcast.emit("server-message", message);
        } else {
            socket.to(id).emit("server-message", message);
        }
    });

    /*
     * Handles and recieve room numbers from client
     * Sends confirmation if socket successfully joined room
     */
    socket.on("room-request", (room, serverNotice) => { 
        socket.join(room);
        serverNotice(`Joined ${Array.from(socket.rooms.values())[1]}`);
    });
})
