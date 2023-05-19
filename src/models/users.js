const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  apartments: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  flatNo:{
    type :String,
    required: true,
  },
  phoneNumber:{
    type: String,
    required: true,
    unique: true,
  }
});

const users = new mongoose.model("Users", userSchema);

module.exports = users;
