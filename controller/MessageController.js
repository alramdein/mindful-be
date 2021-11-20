const MessageModel = require("../models/Message");

const updateReadMessageByIds = async (req, res) => {
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

  await MessageModel.updateMessageIsSeenByIds(messageIds).catch((err) => {
    console.log(err);
    res.status(500).json({
      success: false,
      message:
        "There was an error while updating message. Please check the log.",
    });
  });

  return res.json({
    success: true,
    message: "Successfully update message's is_seen",
  });
};

const updateReadMessageByRoomId = async (req, res) => {
  if (!req.body.room_id && !req.body.owner_sub) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  await MessageModel.updateMessageIsSeenByRoomId(
    req.body.room_id,
    req.body.owner_sub
  ).catch((err) => {
    console.log(err);
    res.status(500).json({
      success: false,
      message:
        "There was an error while updating message. Please check the log.",
    });
  });

  return res.json({
    success: true,
    message: "Successfully update message's is_seen",
  });
};

const getAllMessageByRoomid = async (req, res) => {
  if (!req.query.room_id) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  const messages = await MessageModel.getAllMessageByRoomid(
    req.query.room_id
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

  return res.json({
    success: true,
    data: messages,
  });
};

module.exports = {
  updateReadMessageByIds,
  updateReadMessageByRoomId,
  getAllMessageByRoomid,
};
