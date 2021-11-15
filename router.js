const express = require("express");

const router = express.Router();

const UserController = require("./controller/UserController");
const MessageController = require("./controller/MessageController");

router.post("/user", UserController.addUser);
router.get("/user/partner", UserController.getAllPartner);

router.put("/message/read", MessageController.updateReadMessage);
router.get("/message", MessageController.getAllMessageByRoomid);

module.exports = router;
