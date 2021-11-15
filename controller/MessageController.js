const MessageModel = require("../models/Message");

const updateReadMessage = async (req, res) => {
  if (!req.body.message_ids) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  const messageIds = JSON.parse(req.body.message_ids);
  if (!Array.isArray(messageIds)) {
    return res.json({
      success: false,
      message: "message_ids is not array.",
    });
  }

  await MessageModel.updateMessageIsSeenByIds(messageIds);

  return res.json({
    success: true,
    message: "Successfully update message's isSeen",
  });
};

const getAllMessageByRoomid = async (req, res) => {
  if (!req.body.room_id) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  const messages = await MessageModel.getAllMessageByRoomid(req.body.room_id);

  return res.json({
    success: true,
    data: messages,
  });
};

module.exports = {
  updateReadMessage,
  getAllMessageByRoomid,
};
