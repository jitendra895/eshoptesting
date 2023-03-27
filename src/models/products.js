const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  quantity: {
    type: String,
    required: true,
  },
  others: {
    type: String,
  },
  image: {
    type: String,
    required: true
  },
});

const products = new mongoose.model("Products", productSchema);

module.exports = products;
