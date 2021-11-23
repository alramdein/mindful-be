const mysql = require("mysql");
const { convertToMySQLDate } = require("./helpers/date-converter");

let connection;
if (process.env.IS_HEROKU) {
  connection = mysql.createConnection(process.env.JAWSDB_URL);
} else {
  connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
}

connection.connect();

function createPost(description, image_url, timestamp, tags, callback) {
  const query = `
  INSERT INTO posts (description, image_url, timestamp, tags)
  VALUES (?, ?, ?, ?)
  `;

  const params = [description, image_url, timestamp, JSON.stringify(tags)];

  connection.query(query, params, (error, result) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null, result.insertId);
  });
}

function getPosts(callback) {
  const query = `
  SELECT * FROM posts
  `;

  connection.query(query, (error, results) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null, results);
  });
}

/* Chat feature */
/* a. Chat Room */
const storeRoomid = (roomid) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `INSERT INTO rooms(roomid) VALUES("${roomid}")`;

      connection.query(query, (error, results) => {
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

const checkUserChatExist = (owner_id, partner_id) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT r.roomid FROM chat_rooms cr 
                    LEFT JOIN rooms r ON cr.room_id = r.id
                    WHERE (cr.owner_id = ${owner_id} AND cr.partner_id = ${partner_id})
                    OR (cr.owner_id = ${partner_id} AND cr.partner_id = ${owner_id})
                    LIMIT 1`;

      connection.query(query, async (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }

        if (results.length > 0) {
          resolve({ roomid: results[0] });
          return;
        }
        resolve(0);
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });

const storeChatRoom = (roomidString, ownerSub, partnerSub) =>
  new Promise(async (resolve, reject) => {
    try {
      const owner_id = await getUserIdBySub(ownerSub);
      const partner_id = await getUserIdBySub(partnerSub);
      const isUserChatExist = await checkUserChatExist(owner_id, partner_id);
      const partnerDetail = await getUserById(partner_id);

      if (isUserChatExist !== 0) {
        resolve({
          ...isUserChatExist.roomid,
          partner_detail: partnerDetail[0],
        });
        return;
      }

      const room_id = await storeRoomid(roomidString);
      const query = `INSERT INTO chat_rooms(room_id, owner_id, partner_id) 
                      VALUES(${room_id}, ${owner_id}, ${partner_id})`;

      connection.query(query, async (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        console.log("Chat room stored.");

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

      connection.query(query, (error, results) => {
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

      console.log(keyword);

      const query = `SELECT r.roomid as room_id, if (uo.id = cr.partner_id, (
                          SELECT u3.name FROM users u3
                          JOIN chat_rooms cr3 ON cr3.room_id = cr.room_id AND cr3.owner_id = u3.id
                          WHERE cr3.partner_id = uo.id
                        ), up.name) as partner_name, 
                        if (uo.id = cr.partner_id, (
                          SELECT u3.avatar FROM users u3
                          JOIN chat_rooms cr3 ON cr3.room_id = cr.room_id AND cr3.owner_id = u3.id
                          WHERE cr3.partner_id = uo.id
                        ), up.avatar) as partner_avatar, m.message as last_partner_message,
                        TIMESTAMPDIFF(MINUTE, CONVERT_TZ(m.timestamp, '+00:00', @@session.time_zone), now()) as last_chat_minute,
                        (
                          SELECT COUNT(*) FROM messages m2
                          JOIN chat_rooms cr2 ON cr2.room_id = m2.room_id
                          WHERE m2.room_id = m.room_id
                          AND cr2.partner_id = cr.partner_id
                          AND m2.user_id <> uo.id
                          AND m2.is_seen = 0
                        ) AS unread_messages
                    FROM chat_rooms cr 
                    JOIN users uo ON cr.owner_id = uo.id OR cr.partner_id = uo.id
                    JOIN users up ON cr.partner_id = up.id 
                    LEFT JOIN messages m ON m.id = (
                        SELECT id FROM messages
                        WHERE room_id = cr.room_id
                        ORDER BY timestamp DESC
                        LIMIT 1 
                    )
                    JOIN rooms r ON cr.room_id = r.id
                    WHERE (uo.sub = "${ownerSub}")
                    AND ( (up.name = "" OR up.name IS NULL) 
                    OR ( if (uo.id = cr.partner_id, (
                      SELECT u3.name FROM users u3
                      JOIN chat_rooms cr3 ON cr3.room_id = cr.room_id AND cr3.owner_id = u3.id
                      WHERE cr3.partner_id = uo.id
                    ), up.name)  LIKE "${keyword}%"

                    OR if (uo.id = cr.partner_id, (
                        SELECT u3.name FROM users u3
                        JOIN chat_rooms cr3 ON cr3.room_id = cr.room_id AND cr3.owner_id = u3.id
                        WHERE cr3.partner_id = uo.id
                      ), up.name) REGEXP "[:space:]${keyword}+" )
                    
                    )`;

      connection.query(query, (error, results) => {
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

/* -> Message */
const storeMessage = (user_sub, roomidString, message, timestamp) =>
  new Promise(async (resolve, reject) => {
    try {
      const room_id = await getRoomId(roomidString);
      const user_id = await getUserIdBySub(user_sub);
      const query = `INSERT INTO messages(user_id, room_id, message, timestamp, is_seen) 
                      VALUES(${user_id}, ${room_id}, "${message}", "${timestamp}", 0)`;

      connection.query(query, (error, results) => {
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

      connection.query(query, (error, results) => {
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

      connection.query(query, (error, results) => {
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
      const room_id = await getRoomId(roomidString);
      const query = `SELECT *, m.id as id FROM messages m 
                    JOIN users u ON m.user_id = u.id
                    JOIN rooms r ON m.room_id = r.id
                    WHERE m.room_id = ${room_id} ORDER BY timestamp ASC`;

      connection.query(query, (error, results) => {
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

const checkUserExistBySub = (sub) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM users WHERE sub = "${sub}"`;

      connection.query(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }

        if (results.length > 0) {
          resolve(1);
          return;
        }

        resolve(0);
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

const addUser = (sub, name, avatar, updated_at) =>
  new Promise(async (resolve, reject) => {
    try {
      const updatedAt = convertToMySQLDate(updated_at);
      const query = `INSERT INTO users(sub, name, avatar, created_at, updated_at) 
                        VALUES("${sub}", "${name}", "${avatar}", now(), "${updatedAt}")`;

      connection.query(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        console.log("User added.");
        resolve();
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

const addUserProfile = (sub, name, avatar, updated_at) =>
  new Promise(async (resolve, reject) => {
    try {
      const isUserExist = await checkUserExistBySub(sub);

      if (!isUserExist) {
        await addUser(sub, name, avatar, updated_at).catch((err) => {
          reject(err);
        });
        resolve();
        return;
      }
      resolve("User is already added");
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

const getUserIdBySub = (sub) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM users WHERE sub = "${sub}"`;

      connection.query(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }

        if (results.length === 0) {
          reject({
            status: 400,
            msg: "User not found.",
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

const getAllPartner = (ownerSub, keyword) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM users WHERE sub NOT LIKE "${ownerSub}"
                     AND ( (name = "" OR name IS NULL)
                      OR ( name LIKE "${keyword}%" OR name REGEXP "[:space:]${keyword}+" ) )`;

      connection.query(query, (error, results) => {
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

const getUserById = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT sub, name, avatar FROM users 
                    WHERE id = ${id}`;

      connection.query(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }

        resolve(results);
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });

module.exports = {
  storeChatRoom,
  getRoomId,
  getAllRoomByOwnerSub,
  storeMessage,
  updateMessageIsSeenByIds,
  getAllMessageByRoomid,
  updateMessageIsSeenByRoomId,
  createPost,
  getPosts,
  addUser,
  getUserIdBySub,
  getAllPartner,
  getUserById,
  addUserProfile,
};
