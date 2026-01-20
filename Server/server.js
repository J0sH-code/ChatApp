import app from "./http/express.js";
import { Server } from "socket.io";
import socketServer from "./Socket/socketServer.js";

const port = process.env.port || 3000;
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
