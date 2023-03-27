const express = require("express");
const path = require("path");
const multer = require("multer");
require("./db/connection");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 4000;
const users = require("./models/users");
const sellers = require("./models/sellers");
const shops = require("./models/shops");
const products = require("./models/products");
const Image = require("./models/img");
const fs = require("fs");
app.use("/src/uploads", express.static("src/uploads"));
// const mongoose = require("mongoose");

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../build")));

app.post("/sellerSignup", async (req, res) => {
  try {
    const updateNewSeller = new sellers(req.body);
    console.log(req.body);
    const insertSeller = await updateNewSeller.save();
    res.status(201).send(insertSeller);
  } catch (e) {
    res.status(400).json({ status: "user already exists" });
  }
});

app.post("/userSingup", async (req, res) => {
  try {
    const updateNewUser = new users(req.body);
    console.log(req.body);
    const insertUser = await updateNewUser.save();
    res.status(201).send(insertUser);
  } catch (e) {
    res.status(400).json({ status: "user already exists" });
  }
});

app.post("/shop", async (req, res) => {
  try {
    const existingShop = await shops.findOne({ shopName: req.body.shopName });
    if (existingShop) {
      existingShop.timing = req.body.timing;
      existingShop.status = req.body.status;
      await existingShop.save();
      res.status(200).send(existingShop);
    } else {
      const newShop = new shops(req.body);
      const insertedShop = await newShop.save();
      res.status(201).send(insertedShop);
    }
  } catch (e) {
    res.status(400).json({ status: "error", message: e.message });
  }
});

app.post("/sellerLogin", async (req, res) => {
  try {
    const user = await sellers.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.body.password !== user.password) {
      return res.status(400).json({ message: "Invalid password" });
    }
    res.status(200).json({ message: "Login successful" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post("/userLogin", async (req, res) => {
  try {
    const user = await users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.password !== user.password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const imageUrl =
      req.protocol +
      "://" +
      req.get("host") +
      "/src/uploads/" +
      req.file.filename;
    let imageUploadObject = {
      image: imageUrl,
      shopName: req.body.shopName,
      productName: req.body.productName,
      price: req.body.price,
      quantity: req.body.quantity,
      description: req.body.description,
      others: req.body.others,
    };
    const uploadObject = new products(imageUploadObject);
    const uploadProcess = await uploadObject.save();
    res.status(200).send(uploadProcess);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.get("/seller/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const user = await sellers.findOne({ email });
    if (!user) {
      res.status(404).send();
    } else {
      res.status(200).send(user);
    }
  } catch (e) {
    res.status(500).send();
  }
});

app.get("/product/:shopName", async (req, res) => {
  const shopName = req.params.shopName;
  try {
    const productsList = await products.find({ shopName });
    if (productsList.length === 0) {
      res.status(404).json({ message: "no products found" });
    } else {
      res.status(200).send(productsList);
    }
  } catch (e) {
    res.status(500).send();
  }
});

app.listen(port, () => {
  console.log(`connection is live on ${port}`);
});