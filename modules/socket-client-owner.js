const io = require("socket.io-client");
const socket = io("http://localhost:8080");

const roomid = "ZnEz4iR7Ls2LmQ9M";

socket.on("connect", () => {
  console.log(socket.connected);
});

socket.emit("join", roomid);

socket.emit("newMessage", {
  sub: "aasdaggg",
  room_id: roomid,
  message: "halow?",
  timestamp: "2021-11-01 20:10:02",
});

socket.on("newMessage", (newMessage) => {
  console.log("Client owner received");
  console.log(newMessage);
});
