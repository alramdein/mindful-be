const UserModel = require("../models/User");

const addUser = async (req, res) => {
  if (
    !req.body.sub ||
    !req.body.name ||
    !req.body.avatar ||
    !req.body.updated_at
  ) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  await UserModel.addUser(
    req.body.sub,
    req.body.name,
    req.body.avatar,
    req.body.updated_at
  );

  return res.json({
    success: true,
    message: "Sucessfully add new user.",
  });
};

const getAllPartner = async (req, res) => {
  if (!req.body.owner_sub) {
    return res.json({
      success: false,
      message: "Parameter owner_sub is not satisfied.",
    });
  }

  const partners = await UserModel.getAllPartner(req.body.owner_sub);

  return res.json({
    success: true,
    data: partners,
  });
};

module.exports = {
  addUser,
  getAllPartner,
};
