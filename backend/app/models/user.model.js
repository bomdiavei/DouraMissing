const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    userImage: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    publications: [      
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Publication"
      }
    ],
    resetPasswordToken: String
  })
);

module.exports = User;
