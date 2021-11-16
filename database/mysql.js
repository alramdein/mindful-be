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
      throw err;
    }
    connection.query(query, (err, rows) => {
      connection.release();
      if (!err) {
        console.log(rows);
        callback(null, rows);
      }
    });
    connection.on("error", (err) => {
      throw err;
      return;
    });
  });
};

module.exports = {
  executeQuery,
};
