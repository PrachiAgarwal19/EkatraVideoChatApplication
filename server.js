//Create express and socket.io servers
const express = require("express");
const app = express();
const server = require("http").Server(app);
const cors=require('cors');
app.use(cors());
const io = require("socket.io")(server);

const { v4: uuidV4 } = require("uuid");
app.set("view engine", "ejs"); // Tell Express EJS is being used

const { ExpressPeerServer } = require("peer");// to ensure we have access to the peer server

//creating the peer server
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public")); //Tell express to pull the client script from the public folder

// if base link joined, create and direct them to new room
app.get("/", (req, res) => {
    //res.redirect(`/${uuidV4()}`);
    res.redirect(`/9876`);
  });
  
//If a specific room link with room id joined, then request for that room
  app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
  });    

  // When someone connects to the server    
  io.on("connection", (socket) => {
    // When someone attempts to join the room
    socket.on("join-room", (roomId, userId,userName) => {
      socket.join(roomId); // Join the room
      socket.broadcast.to(roomId).emit("user-connected", userId); // Tell everyone else in the room that they joined
      // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message,userName)
  });
       // Communicate the disconnection
      socket.on("disconnect", () => {
        socket.broadcast.to(roomId).emit("user-disconnected", userId);
      });
      
    });
  });
   
  server.listen(process.env.PORT || 8000);
  
