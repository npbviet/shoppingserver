const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const authAdminRoutes = require("./routers/admin/auth.routes");
const getDataAdminRouter = require("./routers/admin/getData.routes");
const setDataAdminRouter = require("./routers/admin/setData.routes");

const authClientRoutes = require("./routers/client/auth.routes");
const getDataClientRouter = require("./routers/client/getData.routes");
const setDataClientRouter = require("./routers/client/setData.routes");

const chatRoomRoutes = require("./routers/chatRooms.routes");

const app = express();
const http = require("http");
const { Server } = require("socket.io");

const ChatRoom = require("./models/chatRoom");

// ===================== CONFIG =====================
const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 5000;

// ===================== SESSION STORE =====================
const clientSessionStore = new MongoDBStore({
  uri: MONGODB_URL,
  collection: "clientSessions",
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
  },
});
const adminSessionStore = new MongoDBStore({
  uri: MONGODB_URL,
  collection: "adminSessions",
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
  },
});
clientSessionStore.on("error", (err) =>
  console.error("Client session error:", err)
);
adminSessionStore.on("error", (err) =>
  console.error("Admin session error:", err)
);

// ===================== MULTER CONFIG =====================
const imagePath = path.join(__dirname, "images");
if (!fs.existsSync(imagePath)) fs.mkdirSync(imagePath, { recursive: true });

const fileStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "images"),
  filename: (_, file, cb) =>
    cb(
      null,
      new Date().toISOString().replace(/[.\-:]/g, "") + "-" + file.originalname
    ),
});
const fileFilter = (_, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValid =
    allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);
  cb(isValid ? null : new Error("Chỉ chấp nhận các định dạng ảnh!"), isValid);
};

// ===================== MIDDLEWARE =====================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://clientshopping-66b41.web.app",
      "https://adminshopping-fabfc.web.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(multer({ storage: fileStorage, fileFilter }).array("fileUpload", 5));
app.use("/images", express.static(imagePath));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const sessionConfig = (store, name) => ({
  secret: "secretSession",
  resave: false,
  saveUninitialized: false,
  store,
  name,
  cookie: {
    httpOnly: true,
    maxAge: 2 * 60 * 60 * 1000,
    sameSite: "none",
    secure: true,

    // sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
  },
});

app.use("/client", session(sessionConfig(clientSessionStore, "client.sid")));
app.use("/admin", session(sessionConfig(adminSessionStore, "admin.sid")));

// ===================== ROUTES =====================
app.use("/client", authClientRoutes);
app.use("/client", getDataClientRouter);
app.use("/client", setDataClientRouter);

app.use("/admin", authAdminRoutes);
app.use("/admin", getDataAdminRouter);
app.use("/admin", setDataAdminRouter);

app.use(chatRoomRoutes);
app.get("/", (_, res) => res.send("Hello world!"));

// ===================== MONGODB + SOCKET.IO =====================
mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
  })
  .then(() => {
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:3001",
          "https://clientshopping-66b41.web.app",
          "https://adminshopping-fabfc.web.app",
        ],
        credentials: true,
      },
    });

    const clientNamespace = io.of("/client");
    const adminNamespace = io.of("/admin");

    // Hàm xử lý chung khi nhận sendMessage để tránh lặp code
    const handleSendMessage = async (namespace, socket, msg) => {
      const { roomId, sender, message, role } = msg;

      if (message.trim() === "/end") {
        // Xóa phòng chat
        await ChatRoom.deleteOne({ roomId });

        // Phát sự kiện "roomEnded" đến tất cả thành viên trong room (cả client và admin)
        clientNamespace
          .to(roomId)
          .emit("roomEnded", { roomId, message: "Phiên tư vấn đã kết thúc." });
        adminNamespace
          .to(roomId)
          .emit("roomEnded", { roomId, message: "Phiên tư vấn đã kết thúc." });

        // Socket hiện tại rời phòng
        socket.leave(roomId);
        return;
      }

      const messageData = {
        senderId: msg.senderId || "unknown",
        senderName: sender,
        message,
        isAdmin: role === "admin",
      };

      await ChatRoom.findOneAndUpdate(
        { roomId },
        { $push: { messages: messageData } },
        { upsert: true }
      );

      // Gửi tin nhắn đến tất cả thành viên trong room (cả client và admin)
      clientNamespace.to(roomId).emit("receiveMessage", messageData);
      adminNamespace.to(roomId).emit("receiveMessage", messageData);
    };

    clientNamespace.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("joinRoom", async ({ userId, roomId, fullName, role }) => {
        socket.join(roomId);
        console.log(`${fullName} (client) joined room ${roomId}`);

        const existingRoom = await ChatRoom.findOne({ roomId });
        if (!existingRoom) {
          await ChatRoom.create({
            roomId,
            userId,
            messages: [],
          });
          clientNamespace.emit("new_room", { roomId, userId, fullName });
        } else {
          socket.emit("chatHistory", existingRoom.messages);
        }
      });

      socket.on("sendMessage", (msg) => {
        handleSendMessage(clientNamespace, socket, msg);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    adminNamespace.on("connection", (socket) => {
      console.log("Admin connected:", socket.id);

      socket.on("joinRoom", async ({ userId, roomId, fullName, role }) => {
        socket.join(roomId);
        console.log(`${fullName} (admin) joined room ${roomId}`);

        const existingRoom = await ChatRoom.findOne({ roomId });
        if (!existingRoom) {
          await ChatRoom.create({
            roomId,
            userId,
            messages: [],
          });
          adminNamespace.emit("new_room", { roomId, userId, fullName });
        }
      });

      socket.on("sendMessage", (msg) => {
        handleSendMessage(adminNamespace, socket, msg);
      });

      socket.on("disconnect", () => {
        console.log("Admin disconnected:", socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log("Server with Socket.IO is running on port " + PORT);
    });
  });
