const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  apartments: {
    type: String,
    required: true,
  },
  shopName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const sellers = new mongoose.model("Sellers", userSchema);

module.exports = sellers;
