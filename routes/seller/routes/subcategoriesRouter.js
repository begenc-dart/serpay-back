const express = require('express');
const {
    getSubcategoryProducts,
} = require('../../../controllers/seller/categoriesControllers');

const router = express.Router();
router.get('/products/:id', getSubcategoryProducts);

module.exports = router;