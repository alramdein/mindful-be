const express = require("express");

const router = express.Router();

const UserController = require("./controller/UserController");

router.post("/user", UserController.addUser);
router.get("/user/partner", UserController.getAllPartner);

module.exports = router;
