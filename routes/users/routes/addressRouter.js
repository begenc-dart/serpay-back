const express = require("express")
const router = express.Router()

const {
    addMyAddress,
    editMyAddress,
    getAddress,
    deleteMyAddress,
    getAllAddress
} = require("../../../controllers/users/addressController")

router.post("/", addMyAddress)
router.get("/", getAllAddress)
router.patch("/:id", editMyAddress)
router.get("/:id", getAddress)
router.delete("/:id", deleteMyAddress)

module.exports = router