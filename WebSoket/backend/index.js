const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const WebSocket=require('ws');

const app = express();
app.use(cors()); // Allow requests from frontend
app.use(express.json());

//router--->

app.get("/", (req, res) => {
    return res.send("Hello HTTPS from server");
});

app.post("/api/data", (req, res) => {
    console.log(req.body);
    res.json({ received: true, data: req.body });
});

//-----

const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
};


const server=https.createServer(options,app);

const wss = new WebSocket.Server({server});

wss.on('connection',(ws)=>{

    console.log("new client connected!")

    ws.on("message",(data)=>{
        
        const message=JSON.parse(data);
        console.log('received',message);

        // wss.clients.forEach((client)=>{
        //     if(client!==ws && client.readyState===WebSocket.OPEN){
        //         client.send(JSON.stringify(message))
        //     }
        // });
    });

    ws.on('close',()=>{
        console.log('Client Disconnected!')
    });
});

server.listen(8443,()=>{
    console.log('HTTPS & WebSocket Server running on https://localhost:8443')
})
