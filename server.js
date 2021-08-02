const express = require("express");
const app = express();
const server = require("http").Server(app);
const cors=require('cors');
app.use(cors());
const io = require("socket.io")(server);

const { v4: uuidV4 } = require("uuid");
app.set("view engine", "ejs");

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));
app.get("/", (req, res) => {
    //res.redirect(`/${uuidV4()}`);
    res.redirect(`/9876`);
  });
  
  app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
  });     
      
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId,userName) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", userId);
      // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message,userName)
  });
      socket.on("disconnect", () => {
        socket.broadcast.to(roomId).emit("user-disconnected", userId);
      });
      
    });
  });
   
  server.listen(process.env.PORT || 8000);
  
