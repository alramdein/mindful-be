const env = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const short = require("short-uuid");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const path = require("path");

const app = express();
const s3 = require("./s3");
const database = require("./database");
const { initSocket } = require("./modules/socket");

const http = require("http");
const server = http.createServer(app);
initSocket(server);

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
  database.getPosts((error, posts) => {
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
  database.createPost(
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

/* chat feature */
app.post("/user", async (req, res) => {
  if (
    !req.body.sub ||
    !req.body.name ||
    !req.body.picture ||
    !req.body.updated_at
  ) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  const userRes = await database
    .addUserProfile(
      req.body.sub,
      req.body.name,
      req.body.picture,
      req.body.updated_at
    )
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        success: 0,
        message: "There is an error while adding a user. Please check the log.",
      });
    });

  let msg = "Sucessfully add new user.";
  if (userRes === "User is already added") {
    msg = userRes;
  }

  return res.json({
    success: true,
    message: msg,
  });
});

app.get("/user/partner", async (req, res) => {
  if (!req.query.owner_sub) {
    return res.json({
      success: false,
      message: "Parameter owner_sub is not satisfied.",
    });
  }

  const partners = await database
    .getAllPartner(req.query.owner_sub, req.query.keyword)
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        success: 0,
        message:
          "There is an error while getting all partner. Please check the log.",
      });
    });

  return res.json({
    success: true,
    data: partners,
  });
});

app.put("/message/read", async (req, res) => {
  if (!req.body.room_id && !req.body.owner_sub) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  const updatedMessages = await database
    .updateMessageIsSeenByRoomId(req.body.room_id, req.body.owner_sub)
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        success: false,
        message:
          "There was an error while updating message. Please check the log.",
      });
    });

  if (updatedMessages === 0) {
    console.log("No message were updated");
    /* You can improve more here */
  }

  return res.json({
    success: true,
    message: "Successfully update message's is_seen",
  });
});
app.get("/message", async (req, res) => {
  if (!req.query.room_id) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  const messages = await database
    .getAllMessageByRoomid(req.query.room_id)
    .catch((err) => {
      if (err.status) {
        return res.status(err.status).json({
          success: false,
          message: err.msg,
        });
      }
      console.log(err);
      res.status(500).json({
        success: false,
        message:
          "There was an error while getting all room. Please check the log.",
      });
    });

  return res.json({
    success: true,
    data: messages,
  });
});

app.post("/chat/room", async (req, res) => {
  if (!req.body.owner_sub || !req.body.partner_sub) {
    return res.json({
      success: false,
      message: "Parameters is not satisfied.",
    });
  }

  let roomid = short.generate();

  const chatRoomDetail = await database
    .storeChatRoom(roomid, req.body.owner_sub, req.body.partner_sub)
    .catch((err) => {
      if (err.status) {
        return res.status(err.status).json({
          success: false,
          message: err.msg,
        });
      }
      console.log(err);
      res.status(500).json({
        success: false,
        message:
          "There was an error while getting all room. Please check the log.",
      });
    });

  if (chatRoomDetail.roomid) {
    roomid = chatRoomDetail.roomid;
    partnerDetail = chatRoomDetail.partner_detail;
  } else {
    partnerDetail = chatRoomDetail[0];
  }

  return res.json({
    success: true,
    room_id: roomid,
    partner_detail: {
      ...partnerDetail,
    },
  });
});
app.get("/chat/partner-room", async (req, res) => {
  try {
    if (!req.query.owner_sub) {
      return res.json({
        success: false,
        message: "Parameter owner_sub is not satisfied.",
      });
    }

    const partnerRooms = await database.getAllRoomByOwnerSub(
      req.query.owner_sub,
      req.query.keyword
    );

    for (const [key, value] of Object.entries(partnerRooms)) {
      if (value && value.last_chat_minute === 0)
        partnerRooms[key].last_chat_minute = 1;
    }

    return res.json({
      success: true,
      count: partnerRooms.length,
      data: partnerRooms,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message:
        "There was an error while getting all room. Please check the log.",
    });
  }
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`listening on port ${port} llll`);
});
