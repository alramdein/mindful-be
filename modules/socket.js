const { Server } = require("socket.io");
const MessageModel = require("../models/Message");
const { convertToMySQLDate } = require("../helpers/date-converter");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", (data) => {
      console.log(`socket disconnect`);
      console.log(data);
    });

    socket.on("join", (roomid) => {
      // console.log("roomid: " + roomid);
      socket.join(roomid);
    });

    socket.on("checkUser", (roomid) => {});

    socket.on("newMessage", (newMessage) => {
      console.log("newMessage");
      /* sending message to client in a specific room */
      io.to("" + newMessage.room_id).emit("newMessage", newMessage);

      /* store message to database */
      if (!newMessage.timestamp) {
        newMessage.timestamp = new Date().toISOString();
        newMessage.timestamp = convertToMySQLDate(newMessage.timestamp);
        console.log(newMessage.timestamp);
      }

      MessageModel.storeMessage(
        newMessage.sub,
        newMessage.room_id,
        newMessage.message,
        newMessage.timestamp
      );
    });

    socket.on("isOnline", (isOnline) => {
      console.log("isOnline");
      socket.to("" + isOnline.room_id).emit("isOnline", isOnline);
    });

    socket.on("updatePartnerRooms", ({ room_id }) => {
      console.log("updatePartnerRooms");
      socket.to("" + room_id).emit("updatePartnerRooms", {});
    });
  });
};

module.exports = {
  initSocket,
};
