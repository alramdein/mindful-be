const db = require("../database/mysql");
const { convertToMySQLDate } = require("../helpers/date-converter");

const checkUserExistBySub = (sub) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM users WHERE sub = "${sub}"`;

      db.executeQuery(query, (error, results) => {
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
  getUserIdBySub,
  getAllPartner,
  getUserById,
  addUserProfile,
};
