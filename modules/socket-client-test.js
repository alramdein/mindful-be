const io = require("socket.io-client");
const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log(socket.connected);
});

socket.emit("join", "Hasdej");

socket.emit("newMessage", {
  user_id: 55,
  room_id: "gwJNHjmjfdgx/X4b",
  message: "halo?",
  timestamp: "2021-11-01 20:10:02",
});

socket.emit("newMessage", {
  user_id: 65,
  room_id: "gwJNHjmjfdgx/X4b",
  message: "Ya dengan siapa ya",
  timestamp: "2021-11-01 20:11:02",
});

socket.emit("newMessage", {
  user_id: 55,
  room_id: "gwJNHjmjfdgx/X4b",
  message: "Ini wak haji juned",
  timestamp: "2021-11-01 20:12:02",
});

socket.emit("newMessage", {
  user_id: 65,
  room_id: "gwJNHjmjfdgx/X4b",
  message: "Ohhh",
  timestamp: "2021-11-01 20:13:02",
});

socket.on("newMessage", (newMessage) => {
  console.log("Client received");
  console.log(newMessage);
});
