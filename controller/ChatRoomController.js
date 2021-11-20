const short = require("short-uuid");
const ChatRoomModel = require("../models/ChatRoom");

const createChatRoom = async (req, res) => {
  if (!req.body.owner_sub || !req.body.partner_sub) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  let roomid = short.generate();

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

    for (const [key, value] of Object.entries(partnerRooms)) {
      if (value && value.last_chat_minute === 0)
        partnerRooms[key].last_chat_minute = 1;
    }

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
