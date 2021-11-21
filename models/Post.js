const { connection } = require("../database");

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

module.exports = {
  createPost,
  getPosts,
};
