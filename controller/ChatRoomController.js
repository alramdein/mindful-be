const crypto = require("crypto");
const ChatRoomModel = require("../models/ChatRoom");

const createChatRoom = async (req, res) => {
  if (!req.body.owner_sub || !req.body.partner_sub) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  let roomid = crypto.randomBytes(3 * 4).toString("base64");

  const chatRoomDetail = await ChatRoomModel.storeChatRoom(
    roomid,
    req.body.owner_sub,
    req.body.partner_sub
  ).catch((err) => {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        message: err.msg,
      });
    }
    console.log(err);
    res.status(500).json({
      success: false,
      message:
        "There was an error while getting all room. Please check the log.",
    });
  });

  if (chatRoomDetail.roomid) {
    roomid = chatRoomDetail.roomid;
    partnerDetail = chatRoomDetail.partner_detail;
  } else {
    partnerDetail = chatRoomDetail[0];
  }

  return res.json({
    success: true,
    room_id: roomid,
    partner_detail: {
      ...partnerDetail,
    },
  });
};

const getAllRoomByOwnerSub = async (req, res) => {
  try {
    if (!req.query.owner_sub) {
      return res.json({
        success: false,
        message: "Parameter owner_sub is not satisfied.",
      });
    }

    const partnerRooms = await ChatRoomModel.getAllRoomByOwnerSub(
      req.query.owner_sub,
      req.query.keyword
    );

    return res.json({
      success: true,
      count: partnerRooms.length,
      data: partnerRooms,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message:
        "There was an error while getting all room. Please check the log.",
    });
  }
};

module.exports = {
  createChatRoom,
  getAllRoomByOwnerSub,
};
