const express = require('express')
const router = express.Router()
const { login, protect, updateMe, sendMe, getTime, changeTime } = require("../../controllers/admin/adminControllers")
router.post("/login", login)
router.post("/edit", protect, updateMe)
router.get("/get-me", protect, sendMe)
router.get("/time", getTime)
router.post("/time", changeTime)
router.use("/banners", require("./routes/bannersRouter")) //test edildi
router.use('/categories', require('./routes/categoriesRouter')); //delete test etmeli
router.use("/subcategories", require("./routes/subcategoriesRouter")) //test edildi
router.use("/brands", require("./routes/brandsRouter")) //test etmeli
router.use("/products", require("./routes/productsRouter")) //test etmeli
router.use("/orders", require("./routes/ordersRouter"))
router.use("/free-products", require("./routes/free-productsRouter")) //test etmeli
router.use("/users", protect, require("./routes/usersRouter"))
router.use("/currency", protect, require("./routes/currencyRouter"))
router.use("/seller", protect, require("./routes/sellerRouter"))
module.exports = router