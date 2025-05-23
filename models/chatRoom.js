const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: String,
  senderName: String,
  message: String,
  isAdmin: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const chatRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  messages: [messageSchema],
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
