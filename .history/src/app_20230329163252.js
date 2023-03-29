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
const MongoClient = require("mongodb").MongoClient;
const upload = require("./middleware/upload");
const url = 'mongodb+srv://jitendra:Welcome%401@atlascluster.qicyewo.mongodb.net/?retryWrites=true&w=majority';
const baseUrl = "http://localhost:4000/images/";
const mongoClient = new MongoClient(url);
app.use("/src/uploads", express.static("src/uploads"));
const GridFSBucket = require("mongodb").GridFSBucket;

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

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "src/uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

app.post("/products", async (req, res) => {
  try {
    const imageUrl = baseUrl +
      req.file.filename;
       await upload(req, res);
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



// app.post('/upload', async (req, res) => {
//   try {
//     await upload(req, res);
//     console.log(req.file);

//     if (req.file == undefined) {
//       return res.send({
//         message: "You must select a file.",
//       });
//     }

//     return res.send({
//       message: "File has been uploaded.",
//     });
//   } catch (error) {
//     console.log(error);

//     return res.send({
//       message: "Error when trying upload image: ${error}",
//     });
//   }
// });

app.get('/images', async (req, res) => {
  try {
    const client =  await mongoClient.connect();
    const database = client.db("test");
    const images = database.collection("photos.files");

    const cursor = images.find({});

    if ((await cursor.count()) === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }

    let fileInfos = [];
    await cursor.forEach((doc) => {
      fileInfos.push({
        name: doc.filename,
        url: baseUrl + doc.filename,
      });
    });

    return res.status(200).send(fileInfos);
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
});

app.get('/images/:name', async (req, res) => {
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


app.listen(port, () => {
  console.log(`connection is live on ${port}`);
});
