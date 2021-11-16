const db = require("../database/mysql");
const UserModel = require("../models/User");

const storeRoomid = (roomid) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `INSERT INTO rooms(roomid) VALUES("${roomid}")`;

      db.executeQuery(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        console.log("Roomid stored.");
        console.log(results);
        resolve(results.insertId);
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });

const storeChatRoom = (roomidString, ownerSub, partnerSub) =>
  new Promise(async (resolve, reject) => {
    try {
      const room_id = await storeRoomid(roomidString);
      const owner_id = await UserModel.getUserIdBySub(ownerSub);
      const partner_id = await UserModel.getUserIdBySub(partnerSub);

      const query = `INSERT INTO chat_rooms(room_id, owner_id, partner_id) 
                      VALUES(${room_id}, ${owner_id}, ${partner_id})`;

      db.executeQuery(query, async (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        console.log("Chat room stored.");
        const partnerDetail = await UserModel.getUserById(partner_id);
        resolve(partnerDetail);
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });

const getRoomId = (roomidString) =>
  new Promise((resolve, reject) => {
    try {
      const query = `SELECT id FROM rooms WHERE roomid = "${roomidString}"`;

      db.executeQuery(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }

        if (results.length === 0) {
          reject({
            status: 400,
            msg: "Room id not found.",
          });
          return;
        }
        resolve(results[0].id);
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

const getAllRoomByOwnerSub = (ownerSub, keyword) =>
  new Promise((resolve, reject) => {
    try {
      if (!keyword) keyword = "";

      const query = `SELECT r.roomid as room_id, up.name as partner_name, up.avatar as partner_avatar, m.message as last_partner_message,
                        TIMESTAMPDIFF(MINUTE, CONVERT_TZ(m.timestamp, '+00:00', @@session.time_zone), now()) as last_chat_minute
                    FROM chat_rooms cr 
                    JOIN users uo ON cr.owner_id = uo.id 
                    JOIN users up ON cr.partner_id = up.id 
                    LEFT JOIN messages m ON m.id = (
                        SELECT id FROM messages
                        WHERE room_id = cr.room_id
                        ORDER BY timestamp DESC
                        LIMIT 1 
                    )
                    JOIN rooms r ON cr.room_id = r.id
                    WHERE uo.sub = "${ownerSub}"
                    AND up.name LIKE "%${keyword}%"`;

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
  storeChatRoom,
  getRoomId,
  getAllRoomByOwnerSub,
};
