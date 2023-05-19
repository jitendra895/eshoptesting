const express = require("express");
const path = require("path");
require("./db/connection");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 4000;
const users = require("./models/users");
const sellers = require("./models/sellers");
const shops = require("./models/shops");
const products = require("./models/products");
const MongoClient = require("mongodb").MongoClient;
const upload = require("./middleware/upload");
const mongoose = require("mongoose");
const url =
  "mongodb+srv://jbpinfosolution:welcome123@cluster0.2sqo6xo.mongodb.net/?retryWrites=true&w=majority";
const mongoClient = new MongoClient(url);
const GridFSBucket = require("mongodb").GridFSBucket;
const connect = mongoose.createConnection(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let gfs;

connect.once("open", () => {
  // initialize stream
  gfs = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: "photos",
  });
});

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../build")));

//api code for seller signup
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

//api code for user signup
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

//api code for seller's shops status update
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

//api code for seller Login
app.post("/sellerLogin", async (req, res) => {
  try {
    const user = await sellers.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // if (req.body.password !== user.password) {
    //   return res.status(400).json({ message: "Invalid password" });
    // }
    res.status(200).send(user._id);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

//api code for user Login
app.post("/userLogin", async (req, res) => {
  try {
    const user = await users.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // if (req.body.password !== user.password) {
    //   return res.status(400).json({ message: "Invalid password" });
    // }
    res.status(200).send(user._id);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

//api code for adding products
app.post("/products", async (req, res) => {
  try {
    const uploadObject = new products(req.body);
    const uploadProcess = await uploadObject.save();
    res.status(200).send(uploadProcess);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//api code for seller details
app.get("/seller/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await sellers.findOne({ _id: id });
    if (!user) {
      res.status(404).send();
    } else {
      res.status(200).send(user);
    }
  } catch (e) {
    res.status(500).send();
  }
});

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await users.findOne({ _id: id });
    if (!user) {
      res.status(404).send({ message: "No user found" });
    } else {
      res.status(200).send(user);
    }
  } catch (e) {
    res.status(500).send({ message: "No user found" });
  }
});

//api code for perticular shop's products
app.get("/productby/:apartments", async (req, res) => {
  const apartments = req.params.apartments;
  try {
    const productsList = await products.find({ apartments });
    if (productsList.length === 0) {
      res.status(404).json({ message: "no products found" });
    } else {
      res.status(200).send(productsList);
    }
  } catch (e) {
    res.status(500).send();
  }
});

//api code for perticular shop's products
app.get("/product/:shopName", async (req, res) => {
  const shopName = req.params.shopName.trim().toLowerCase();
  try {
    const productsList = await products.find({
      shopName: { $regex: shopName },
    });
    if (productsList.length === 0) {
      res.status(404).json({ message: "no products found" });
    } else {
      res.status(200).send(productsList);
    }
  } catch (e) {
    res.status(500).send();
  }
});

//api code for download the images
app.get("/images/:name", async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db("test");
    const bucket = new GridFSBucket(database, {
      bucketName: "photos",
    });

    let downloadStream = bucket.openDownloadStreamByName(req.params.name);

    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });

    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
});

app.get("/shops/:apartments", async (req, res) => {
  const apartments = req.params.apartments;
  try {
    const shopsList = await shops.find({ apartments });
    if (shopsList.length === 0) {
      res.status(404).json({ message: "no shops found" });
    } else {
      res.status(200).send(shopsList);
    }
  } catch (e) {
    res.status(500).send();
  }
});

app.get("/shopsBy/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const shop = await shops.findOne({ _id: id });
    if (!shop) {
      res.status(404).json({ message: "Shop not found" });
    } else {
      res.status(200).send(shop);
    }
  } catch (e) {
    res.status(500).send();
  }
});

app.get("/productDetails/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await products.findOne({ _id: id });
    if (!product) {
      res.status(404).json({ message: "product not found" });
    } else {
      res.status(200).send(product);
    }
  } catch (e) {
    res.status(500).send();
  }
});

app.put("/productUpdate/:id", function (req, res) {
  const id = req.params.id;
  products.findByIdAndUpdate(
    id,
    req.body,
    { new: true },
    function (err, product) {
      if (err) throw err;
      res.status(200).send(product);
    }
  );
});

app.delete("/productDelete/:id", async (req, res) => {
  try {
    const deleteProduct = await products.deleteOne({ _id: req.params.id });
    res.status(200).send(deleteProduct);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/shops", async (req, res) => {
  try {
    const shop = await shops.find({});
    if (!shop) {
      res.status(404).json({ message: "Shop not found" });
    } else {
      res.status(200).send(shop);
    }
  } catch (e) {
    res.status(500).send();
  }
});

app.listen(port, () => {
  console.log(`connection is live on ${port}`);
});
