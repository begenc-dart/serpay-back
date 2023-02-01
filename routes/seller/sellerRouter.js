const express = require('express')
const router = express.Router()
const { login, protect } = require("../../controllers/seller/sellersControllers")
router.post("/login", login)
router.use("/account", protect, require("./routes/sellerRouter"))
router.use("/products", protect, require("./routes/productsRouter"))
router.use("/orders", protect, require("./routes/ordersRouter"))
router.use("/sub-categories", protect, require("./routes/subcategoriesRouter"))
module.exports = router