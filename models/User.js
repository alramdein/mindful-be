const db = require("../database/mysql");

const isUserExist = (sub) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM users WHERE sub = ${sub}`;

      db.executeQuery(query, (error, results) => {
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
      const query = `INSERT INTO users(sub, name, avatar, created_at, updated_at) 
                        VALUES("${sub}", "${name}", "${avatar}", now(), "${updated_at}")`;

      db.executeQuery(query, (error, results) => {
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

const getUserIdBySub = (sub) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM users WHERE sub = "${sub}"`;

      db.executeQuery(query, (error, results) => {
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

const getAllPartner = (ownerSub) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM users WHERE sub NOT LIKE "${ownerSub}"`;

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

const getUserById = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT sub, name, avatar FROM users 
                    WHERE id = ${id}`;

      db.executeQuery(query, (error, results) => {
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
  addUser,
  isUserExist,
  getUserIdBySub,
  getAllPartner,
  getUserById,
};
