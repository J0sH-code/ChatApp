import { socketMap } from "./sessions.js";
export default function routeMessage(socket, message) {
    const session = socketMap.get(socket.id);
    
    if (!session) {
        return {ok: false, reason: "no-session"};
    }

    switch (session.sessionMode) {
        case "direct":
            if (!session.connected_id) {
                return {ok: false, reason: "no-id"};
            }
            socket.to(session.connected_id).emit("server-message", message);
            return {ok: true};
        case "room":
            if (!session.connected_room) {
                return {ok: false, reason: "no-room"};
            }
            socket.to(session.connected_room).emit("server-message", message);
            return {ok: true};
        case "public":
            socket.broadcast.emit("server-message", message);
            return { ok: true };
        default:
            return {ok: false, reason: "unknown-mode"};
    }
}