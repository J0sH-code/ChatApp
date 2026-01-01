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
    console.log(activeSockets);
    
    //Sends list of active sockets to the client
    io.emit("server-activeSockets", activeSockets);

    //Handles socket disconnect
    socket.on("disconnect", () => {
        let new_activeSockets = Array.from(io.sockets.adapter.sids.keys());
        io.emit("server-activeSockets", new_activeSockets);
    })

    socket.on("id-request", (receiverId, serverNotice) => {
        id = receiverId;
        console.log(id);
            
        serverNotice(`Sending to ${id}`);
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
