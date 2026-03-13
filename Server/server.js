import app from "./http/express.js";
import { Server } from "socket.io";
import socketServer from "./Socket/SocketServer.js";
import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT || 3000;
console.log("PORT_NUMBER:", process.env.PORT);
const serverExpress = app.listen(port, () =>
  console.log(`Listening at port ${port}`),
);

export const io = new Server(serverExpress, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socketServer(socket);
});
