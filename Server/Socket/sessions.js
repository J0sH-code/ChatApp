export let socketMap = new Map ();


export function setPublic (socketId) {
        socketMap.set(socketId, {sessionMode: "public", connected_id: null, connected_room: null});
    };

export function directConnect (socket1, socket2) {
        socketMap.set(socket1, {sessionMode: "direct", connected_id: socket2, connected_room: null});
        socketMap.set(socket2, {sessionMode: "direct", connected_id: socket1, connected_room: null});
    };

export function roomConnect(socketId, room) {
        socketMap.set(socketId, {sessionMode: "room", connected_id: null, connected_room: room})
    };
