const io = require("socket.io-client");
const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log(socket.connected);
});

socket.emit("join", "Hasdej");

socket.emit("newMessage", {
  user_id: 1,
  room_id: "E1T70lNKKay5EjVk",
  message: "halo?",
  // timestamp: "2021-11-01 20:10:02",
});

socket.on("newMessage", (newMessage) => {
  console.log("Client received");
  console.log(newMessage);
});
