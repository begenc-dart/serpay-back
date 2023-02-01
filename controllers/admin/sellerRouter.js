const express = require('express');
const router = express.Router()
const { addSeller, isActive, allSellers, oneSeller } = require("../../../controllers/admin/sellerControllers")
const { protect } = require("../../../controllers/admin/adminControllers")
router.post("/add", protect, addSeller)
router.post("/isActive", protect, isActive)
router.get("/", protect, allSellers)
router.get("/:id", protect, oneSeller)


module.exports = router;