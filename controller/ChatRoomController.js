const crypto = require("crypto");
const ChatRoomModel = require("../models/ChatRoom");

const createChatRoom = async (req, res) => {
  if (!req.body.owner_sub || !req.body.partner_id) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  const roomid = crypto.randomBytes(3 * 4).toString("base64");

  await ChatRoomModel.storeChatRoom(
    roomid,
    req.body.owner_sub,
    req.body.partner_id
  ).catch((err) => {
    res.status(err.status).json({
      success: false,
      message: err.msg,
    });
  });

  return res.json({
    success: true,
    roomid: roomid,
  });
};

const getAllRoomByOwnerSub = async (req, res) => {
  if (!req.body.owner_sub) {
    return res.json({
      success: false,
      message: "Parameter owner_sub is not satisfied.",
    });
  }

  const partnerRooms = await ChatRoomModel.getAllRoomByOwnerSub(
    req.body.owner_sub,
    req.body.keyword
  );

  return res.json({
    success: true,
    data: partnerRooms,
  });
};

module.exports = {
  createChatRoom,
  getAllRoomByOwnerSub,
};
