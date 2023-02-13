const express = require("express")
const router = express.Router()
const { addFreeProduct, editFreeProduct, uploadImage, deleteFreeProduct, allFreeProducts, getFreeProduct } = require("../../../controllers/admin/freeProductsController")
const { deleteProductImage } = require("../../../controllers/admin/productsControllers")

router.get("/", allFreeProducts)
router.get("/:id",getFreeProduct)
router.post("/add", addFreeProduct)
router.patch("/:id", editFreeProduct)
router.post("/upload-image/:id", uploadImage)
router.post("/delete/:id", deleteFreeProduct)
router.post("/delete/image/:id", deleteProductImage)

module.exports = router