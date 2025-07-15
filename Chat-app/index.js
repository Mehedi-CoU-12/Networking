const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//middleware
app.use(express.static(path.resolve("./public")));

//socket io
io.on("connection", (socket) => {
    console.log("a new user has connected", socket.id);

    socket.on("user-message", (message) => {
        io.emit("sendMessageFromServer", message);
    });

    socket.on("close", () => {});
});

//router
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(9000, () => {
    console.log(`Server Started At  http://localhost:9000`);
});
