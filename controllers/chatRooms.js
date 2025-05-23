const ChatRoom = require("../models/chatRoom");

const ChatRoomsController = {
  // Lấy tất cả các phòng chat
  getAllRoom: async (req, res) => {
    try {
      const rooms = await ChatRoom.find();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  },

  // Tạo phòng mới
  createNewRoom: async (req, res) => {
    try {
      const newRoom = new ChatRoom({ messages: [] });
      await newRoom.save();
      res.json(newRoom);
    } catch (error) {
      res.status(500).json({ error: "Failed to create room" });
    }
  },

  // Gửi tin nhắn vào phòng
  addMessage: async (req, res) => {
    const { roomId, text, is_admin, name } = req.body;

    try {
      const room = await ChatRoom.findById(roomId);
      if (!room) return res.status(404).json({ error: "Room not found" });

      const newMessage = {
        senderId: is_admin ? "admin" : name || "unknown",
        senderName: is_admin ? "Admin" : name || "Guest",
        message: text,
        isAdmin: is_admin,
        createdAt: new Date(),
      };

      room.messages.push(newMessage);
      await room.save();

      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  },

  // Lấy tin nhắn trong phòng theo ID
  getMessageByRoomId: async (req, res) => {
    const { roomId } = req.query;

    try {
      const room = await ChatRoom.findById(roomId);
      if (!room) return res.status(404).json({ error: "Room not found" });

      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  },
  // Xóa phòng chat theo roomId (ID MongoDB)
  deleteRoom: async (req, res) => {
    const { roomId } = req.body; // gửi roomId trong body

    try {
      const deleted = await ChatRoom.findOneAndDelete({ roomId });
      if (!deleted) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete room" });
    }
  },
};

module.exports = ChatRoomsController;
