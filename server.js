import app from "./app.js";
import http from "http";
import { db } from "./config/db.js";
import { Server } from "socket.io";
import { setupSocket } from "./socket/socket.js";

// variables
const port = process.env.PORT || 4000;

// create server
const server = http.createServer(app);

// socket server
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    },
});

// initialize socket handlers
setupSocket(io);

// db:
db();

server.listen(port, () => {
    console.log(`Server running at ${port}`);
});


// auth home work ---- username and password
// chat schema----
// io is object of socket
// io connection , socket will send data
// antigravity--flash model of ai  with project ----

// io se on -socket milega -- again socekt milega dissconnect hoga