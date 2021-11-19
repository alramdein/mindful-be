const express = require("express");

const router = express.Router();

const UserController = require("./controller/UserController");
const MessageController = require("./controller/MessageController");
const ChatRoomController = require("./controller/ChatRoomController");

router.post("/user", UserController.addUser);
router.get("/user/partner", UserController.getAllPartner);

router.put("/message/read", MessageController.updateReadMessage);
router.get("/message", MessageController.getAllMessageByRoomid);

router.post("/chat/room", ChatRoomController.createChatRoom);
router.get("/chat/partner-room", ChatRoomController.getAllRoomByOwnerSub);

module.exports = router;
