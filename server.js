const env = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const path = require("path");

const app = express();
const s3 = require("./s3");
const { initSocket } = require("./modules/socket");

const http = require("http");
const server = http.createServer(app);
initSocket(server);

const router = require("./router");

const PostModel = require("./models/Post");

app.use(express.static("build"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());

// Getting images from S3 bucket
app.get("/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const readStream = s3.getFileStream(filename);
  readStream.pipe(res);
});

// Getting images from local machine
// app.get("/images/:filename", (req, res) => {
//   const filename = req.params.filename
//   const readStream = fs.createReadStream(path.join(__dirname, 'uploads', filename))
//   readStream.pipe(res);
// });

app.get("/posts", (req, res) => {
  PostModel.getPosts((error, posts) => {
    console.log("get posts", error, posts);
    if (error) {
      res.send({ error: error.message });
      return;
    }
    res.send({ posts });
  });
});

app.post("/posts", upload.single("image"), async (req, res) => {
  console.log("tags", req.body.tags);
  // console.log("timestamp", req.body.timestamp)
  const { filename, path } = req.file;
  await s3.uploadFile(req.file);
  await unlinkFile(req.file.path);

  //const title = req.body.title;
  const description = req.body.description;
  //const timestamp = req.body.timestamp;
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const timestamp = `${year}-${month}-${day}`;
  // const timestamp = currentDate.getTime();
  const tags = req.body.tags;

  const image_url = `/images/${filename}`;
  PostModel.createPost(
    description,
    image_url,
    timestamp,
    tags,
    (error, insertId) => {
      if (error) {
        console.log("DB error in createPost:", error.message);
        res.send({ error: error.message });
        return;
      }
      console.log("timestamp", timestamp);

      res.send({
        id: insertId,
        description,
        image_url,
        timestamp,
        tags,
      });
    }
  );
});

/* the rest of the router */
app.use(router);

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`listening on port ${port} llll`);
});
