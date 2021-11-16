const io = require("socket.io-client");
const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log(socket.connected);
});

socket.emit("join", "gwJNHjmjfdgx/X4b");
