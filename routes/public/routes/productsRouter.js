const express = require('express');
const {
    searchProducts,
    getOneProduct,
    discount,
    newProducts,
    actionProducts,
    getProducts,
    getLikedProducts,
    getTopProducts,
    searchLite,
    getMostSearches,
    getOwnerProducts,
    searchProductsMore,
    addFromExcel
} = require('../../../controllers/public/productsControllers');

const router = express.Router();
router.get("/", getProducts)
router.get("/top", getTopProducts)
router.get("/liked", getLikedProducts)
router.get('/search', searchProducts);
router.get("/search-lite", searchLite)
router.get("/search-more",searchProductsMore)
router.get("/discount", discount)
router.get("/new", newProducts)
router.get("/action", actionProducts)
router.get("/most-searches",getMostSearches)
router.get("/own",getOwnerProducts)
router.get("/:id", getOneProduct)
router.post("/set-rating/:id")
router.get("/add/from-excel",addFromExcel)
module.exports = router;