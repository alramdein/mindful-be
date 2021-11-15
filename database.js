const mysql = require("mysql");

var connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

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
        resolve(results.insertId);
      });
    } catch (err) {
      console.log(err);
    }
  });

const storeChatRoom = (roomidString, owner_id, partner_id) =>
  new Promise(async (resolve, reject) => {
    try {
      const room_id = await storeRoomid(roomidString);
      const query = `INSERT INTO chat_rooms(room_id, owner_id, partner_id) 
                      VALUES(${room_id}, ${owner_id}, ${partner_id})`;

      connection.query(query, (error, results) => {
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
          reject("Room id not found.");
          return;
        }
        resolve(results[0].id);
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

const storeMessage = (user_id, roomidString, message, timestamp) =>
  new Promise(async (resolve, reject) => {
    try {
      const room_id = await getRoomId(roomidString);
      const query = `INSERT INTO messages(user_id, room_id, message, timestamp, isSeen) 
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
      const query = `UPDATE messages SET isSeen = true 
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

const isUserExist = (sub) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM users WHERE sub = ${sub}`;

      connection.query(query, (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }

        if (!results) {
          resolve(0);
          return;
        }

        resolve(1);
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

const addUser = (sub, name, avatar, updated_at) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!isUserExist(sub)) {
        const query = `INSERT INTO users(sub, name, avatar, created_at, updated_at) 
                        VALUES(${sub}, ${name}, ${avatar}, now(), ${updated_at}`;

        connection.query(query, (error, results) => {
          if (error) {
            console.log(error);
            reject(error);
            return;
          }
          console.log("Message stored.");
          resolve();
        });
      }
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

module.exports = {
  createPost,
  getPosts,
  storeChatRoom,
  storeMessage,
  updateMessageIsSeenByIds,
  addUser,
};
