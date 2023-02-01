const express = require("express")
const router = express.Router()
const { addFreeProduct, editFreeProduct, uploadImage, deleteFreeProduct, allFreeProducts } = require("../../../controllers/admin/freeProductsController")

router.get("/", allFreeProducts)
router.post("/add", addFreeProduct)
router.patch("/:id", editFreeProduct)
router.post("/upload-image/:id", uploadImage)
router.delete("/:id", deleteFreeProduct)

module.exports = router