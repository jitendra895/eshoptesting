const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
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
    data: Buffer,
    contentType: String,
  },
});

const products = new mongoose.model("Products", productSchema);

module.exports = products;
