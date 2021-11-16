const mysql = require("mysql");

const handleDisconnect = () => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  // connection.connect((err) => {
  //   if (err) {
  //     console.log("error when connecting to db:", err);
  //     setTimeout(handleDisconnect, 2000);
  //   }
  // });

  connection.on("error", (err) => {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
};

handleDisconnect();

module.exports = connection;
