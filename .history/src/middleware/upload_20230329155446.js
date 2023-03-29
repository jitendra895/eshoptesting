const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const url = 'mongodb+srv://jitendra:Welcome%401@atlascluster.qicyewo.mongodb.net/?retryWrites=true&w=majority';

var storage = new GridFsStorage({
  url: url,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-bezkoder-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}-bezkoder-${file.originalname}`
    };
  }
});

var uploadFiles = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;