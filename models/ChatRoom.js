const db = require("../database/mysql");
const UserModel = require("../models/User");

const storeRoomid = (roomid) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `INSERT INTO rooms(roomid) VALUES("${roomid}")`;

      db.query(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        console.log("Roomid stored.");
        resolve(results.insertId);
      });
    } catch (err) {
      console.log(err);
    }
  });

const storeChatRoom = (roomidString, ownerSub, partner_id) =>
  new Promise(async (resolve, reject) => {
    try {
      const room_id = await storeRoomid(roomidString);
      const owner_id = await UserModel.getUserIdBySub(ownerSub);
      // get user_id by sub
      const query = `INSERT INTO chat_rooms(room_id, owner_id, partner_id) 
                      VALUES(${room_id}, ${owner_id}, ${partner_id})`;

      db.query(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        console.log("Chat room stored.");
        resolve();
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

      db.query(query, (error, results) => {
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

module.exports = {
  storeChatRoom,
  getRoomId,
};
