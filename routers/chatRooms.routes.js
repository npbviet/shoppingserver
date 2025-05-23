const express = require("express");
const router = express.Router();
const ChatRoomsController = require("../controllers/chatRooms");

router.get("/chatrooms/getAllRoom", ChatRoomsController.getAllRoom);
router.post("/chatrooms/createNewRoom", ChatRoomsController.createNewRoom);
router.put("/chatrooms/addMessage", ChatRoomsController.addMessage);
router.get("/chatrooms/getById", ChatRoomsController.getMessageByRoomId);
router.delete("/chatrooms/deleteRoom", ChatRoomsController.deleteRoom);

module.exports = router;
