const mysql = require("mysql");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const executeQuery = (query, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      callback(err);
    }

    connection.query(query, (err, rows) => {
      connection.release();
      if (!err) {
        callback(null, rows);
        return;
      }
      callback(err);
    });
    connection.on("error", (err) => {
      callback(err);
      return;
    });
  });
};

module.exports = {
  executeQuery,
};
