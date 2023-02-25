const express = require('express');
const { getOneProduct } = require('../../../controllers/admin/productsControllers');
const router = express.Router()
const { addSeller, isActive, allSellers, oneSeller, deleteSeller, getAccount, editSellerProduct } = require("../../../controllers/admin/sellerControllers")

router.post("/add", addSeller)
router.post("/isActive", isActive)
router.get("/", allSellers)
router.get("/accounting",getAccount)
router.get("/:id", oneSeller)
router.get("/product/:id", getOneProduct)
router.patch("/product/:id", editSellerProduct)
router.post("/delete/:id", deleteSeller)
module.exports = router;