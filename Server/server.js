import { Server } from 'socket.io';
import  express  from 'express';

const port = 3000;
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
    // let activeSockets = new Map ([
    
    // ])

    console.log(io.sockets.adapter.sids.keys());
    let activeSockets = Array.from(io.sockets.adapter.sids.keys())
    console.log(activeSockets);
    
    io.emit("server-activeSockets", activeSockets);

    socket.on("room-request", (room) => { 
        socket.join(room);
    });

    socket.on("client-message", (message) => {
        socket.broadcast.emit("server-message", message);
    })
})
