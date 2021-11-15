const db = require("../database/mysql");

function createPost(description, image_url, timestamp, tags, callback) {
  const query = `
    INSERT INTO posts (description, image_url, timestamp, tags)
    VALUES (?, ?, ?, ?)
    `;

  const params = [description, image_url, timestamp, JSON.stringify(tags)];

  db.query(query, params, (error, result) => {
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

  db.query(query, (error, results) => {
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
