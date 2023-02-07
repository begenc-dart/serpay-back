const express = require("express")
const router = express.Router()
const { protect } = require("../../../controllers/users/authController")
const { getAllChats, getOneChat } = require("../../../controllers/users/chatsController")
router.get("/", protect, getAllChats)
router.get("/:nickname", protect, getOneChat)
router.post("/add-friend")

module.exports = router