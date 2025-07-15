const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const app = express();

// Enable trust proxy to get real IP addresses
app.set("trust proxy", true);

const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
};

const server = http.createServer(options, app);
const io = new Server(server);

// Store active users
const activeUsers = new Map();

//middleware
app.use(express.static(path.resolve("./public")));

//socket io
io.on("connection", (socket) => {
    console.log("a new user has connected", socket.id);

    // Get IP from socket connection
    const clientIP = socket.handshake.address;
    console.log("Socket IP:", clientIP);

    // Add user to active users with IP
    activeUsers.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        ipAddress: clientIP,
    });

    // Send updated active users list to all clients
    io.emit("activeUsers", Array.from(activeUsers.values()));

    // Send current user their own ID
    socket.emit("yourId", socket.id);

    socket.on("user-message", (message, room) => {
        if (room === "") {
            socket.broadcast.emit("sendMessageFromServer", {
                message: message,
                senderId: socket.id,
            });
        } else {
            socket.to(room).emit("sendMessageFromServer", {
                message: message,
                senderId: socket.id,
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        activeUsers.delete(socket.id);
        io.emit("activeUsers", Array.from(activeUsers.values()));
    });
});

//router
app.get("/", (req, res) => {
    // Multiple ways to get IP
    console.log("req.ip:", req.ip);
    console.log("req.connection.remoteAddress:", req.connection.remoteAddress);
    console.log("req.socket.remoteAddress:", req.socket.remoteAddress);
    console.log("x-forwarded-for:", req.headers["x-forwarded-for"]);
    console.log("x-real-ip:", req.headers["x-real-ip"]);

    return res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(9000, "0.0.0.0", () => {
    console.log(`Server Started At  http://localhost:9000`);
});
