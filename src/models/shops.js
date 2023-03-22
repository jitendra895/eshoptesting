const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  apartments: {
    type: String,
    required: true,
  },
  shopName: {
    type: String,
    required: true,
  },
  timing: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const shops = new mongoose.model("Shops", shopSchema);

module.exports = shops;
