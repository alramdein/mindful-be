const UserModel = require("../models/User");

const addUser = async (req, res) => {
  if (
    !req.body.sub ||
    !req.body.name ||
    !req.body.picture ||
    !req.body.updated_at
  ) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  const userRes = await UserModel.addUserProfile(
    req.body.sub,
    req.body.name,
    req.body.picture,
    req.body.updated_at
  ).catch((err) => {
    console.error(err);
    return res.status(500).json({
      success: 0,
      message: "There is an error while adding a user. Please check the log.",
    });
  });

  let msg = "Sucessfully add new user.";
  if (userRes === "User is already added") {
    msg = userRes;
  }

  return res.json({
    success: true,
    message: msg,
  });
};

const getAllPartner = async (req, res) => {
  if (!req.query.owner_sub) {
    return res.json({
      success: false,
      message: "Parameter owner_sub is not satisfied.",
    });
  }

  const partners = await UserModel.getAllPartner(req.query.owner_sub).catch(
    (err) => {
      console.error(err);
      return res.status(500).json({
        success: 0,
        message:
          "There is an error while getting all partner. Please check the log.",
      });
    }
  );

  return res.json({
    success: true,
    data: partners,
  });
};

module.exports = {
  addUser,
  getAllPartner,
};
