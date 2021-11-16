const io = require("socket.io-client");
const socket = io("http://localhost:8080");

const roomid = "ZnEz4iR7Ls2LmQ9M";

socket.on("connect", () => {
  console.log(socket.connected);
});

socket.emit("join", roomid);

socket.on("newMessage", (newMessage) => {
  console.log("Client partner received");
  console.log(newMessage);
});
