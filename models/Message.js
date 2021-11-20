const db = require("../database/mysql");
const ChatRoomModel = require("./ChatRoom");
const UserModel = require("./User");

const storeMessage = (user_sub, roomidString, message, timestamp) =>
  new Promise(async (resolve, reject) => {
    try {
      const room_id = await ChatRoomModel.getRoomId(roomidString);
      const user_id = await UserModel.getUserIdBySub(user_sub);
      const query = `INSERT INTO messages(user_id, room_id, message, timestamp, is_seen) 
                      VALUES(${user_id}, ${room_id}, "${message}", "${timestamp}", 0)`;

      db.executeQuery(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        console.log("Message stored.");
        resolve();
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

const convertIdsToStr = (ids) => {
  let strOfIds = "";
  for (id of ids) {
    strOfIds += `${id},`;
  }
  return `(${strOfIds.slice(0, -1)})`;
};

const updateMessageIsSeenByIds = (ids) =>
  new Promise((resolve, reject) => {
    try {
      const convertedIds = convertIdsToStr(ids);
      const query = `UPDATE messages SET is_seen = true 
                      WHERE id IN ${convertedIds}`;

      db.executeQuery(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }

        console.log("Message updated.");
        resolve();
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

const updateMessageIsSeenByRoomId = (roomidString, ownerSub) =>
  new Promise((resolve, reject) => {
    try {
      const query = `UPDATE messages SET is_seen = 1 
                      WHERE room_id = (
                        SELECT id FROM rooms WHERE roomid = "${roomidString}"
                      ) 
                      AND is_seen = 0`;

      db.executeQuery(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        if (results.affectedRows === 0) {
          resolve(0);
          return;
        }
        console.log("Message updated.");
        resolve(1);
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

const getAllMessageByRoomid = (roomidString) =>
  new Promise(async (resolve, reject) => {
    try {
      const room_id = await ChatRoomModel.getRoomId(roomidString);
      const query = `SELECT *, m.id as id FROM messages m 
                    JOIN users u ON m.user_id = u.id
                    JOIN rooms r ON m.room_id = r.id
                    WHERE m.room_id = ${room_id} ORDER BY timestamp ASC`;

      db.executeQuery(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        resolve(results);
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

module.exports = {
  storeMessage,
  updateMessageIsSeenByIds,
  getAllMessageByRoomid,
  updateMessageIsSeenByRoomId,
};
