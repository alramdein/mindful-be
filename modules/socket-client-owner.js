const io = require("socket.io-client");
const socket = io("http://localhost:8080");

const roomid = "Nngdys/v2EDHAY4V";

socket.on("connect", () => {
  console.log(socket.connected);
});

socket.emit("join", roomid);

socket.emit("newMessage", {
  sub: "asdasfsaf",
  room_id: roomid,
  message: "halow?",
  timestamp: new Date().toISOString().replace(/T/g, " ").replace(/Z/g, ""),
});

socket.on("newMessage", (newMessage) => {
  console.log("Client owner received");
  console.log(newMessage);
});
