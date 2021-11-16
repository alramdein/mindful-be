const io = require("socket.io-client");
const socket = io("http://localhost:8080");

const roomid = "ZnEz4iR7Ls2LmQ9M";

socket.on("connect", () => {
  console.log(socket.connected);
});

socket.emit("join", "gwJNHjmjfdgx/X4b");

socket.emit("newMessage", {
  user_id: 55,
  room_id: roomid,
  message: "halo?",
  timestamp: "2021-11-01 20:10:02",
});

socket.emit("newMessage", {
  user_id: 65,
  room_id: roomid,
  message: "Ya dengan siapa ya",
  timestamp: "2021-11-01 20:11:02",
});

socket.emit("newMessage", {
  user_id: 55,
  room_id: roomid,
  message: "Ini wak haji juned",
  timestamp: "2021-11-01 20:12:02",
});

socket.emit("newMessage", {
  user_id: 65,
  room_id: roomid,
  message: "Ohhh",
  timestamp: "2021-11-01 20:13:02",
});

socket.on("newMessage", (newMessage) => {
  console.log("Client received");
  console.log(newMessage);
});
