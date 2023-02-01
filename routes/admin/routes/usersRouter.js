const express = require("express")
const { getAllUsers } = require("../../../controllers/admin/usersController")
const router = express.Router()

router.get("/", getAllUsers)
module.exports = router