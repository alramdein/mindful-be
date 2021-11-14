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

exports.createPost = createPost;

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
exports.getPosts = getPosts;
