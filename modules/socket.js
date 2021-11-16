const { Server } = require("socket.io");
const MessageModel = require("../models/Message");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN_HOST || "http://localhost",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", (data) => {
      console.log(`socket disconnect`);
    });

    socket.on("join", (roomid) => {
      // console.log('roomid: '+roomid);
      socket.join(roomid);
    });

    socket.on("checkUser", (roomid) => {});

    socket.on("newMessage", (newMessage) => {
      /* sending message to client in a specific room */
      io.to("" + newMessage.roomid).emit("newMessage", newMessage);

      /* store message to database */
      if (!newMessage.timestamp) {
        newMessage.timestamp = new Date().toISOString();
        newMessage.timestamp = newMessage.timestamp
          .replace(/T/g, " ")
          .replace(/Z/g, "");
        console.log(newMessage.timestamp);
      }

      MessageModel.storeMessage(
        newMessage.user_id,
        newMessage.room_id,
        newMessage.message,
        newMessage.timestamp
      );
    });
  });
};

module.exports = {
  initSocket,
};
