const express = require("express")
const router = express.Router()
const {
    searchProducts,
    getOneProduct,
    discount,
    newProducts,
    actionProducts,
    getProducts,
    getLikedProducts,
    getTopProducts,
    getBrandProducts,
    getCategoryProducts,
    getSubcategoryProducts
} = require('../../../controllers/users/productsControllers');
router.get("/", getProducts)
router.get("/top", getTopProducts)
router.get("/liked", getLikedProducts)
router.get('/search', searchProducts);
router.get("/discount", discount)
router.get("/new", newProducts)
router.get("/action", actionProducts)
router.get("/brands/:id", getBrandProducts)
router.get("/categories/:id", getCategoryProducts)
router.get("/sub-categories/:id", getSubcategoryProducts)
router.get("/:id", getOneProduct)


module.exports = router