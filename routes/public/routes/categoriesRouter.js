const express = require('express');
const {
    getAllCategories,
    getCategoryProducts,
} = require('../../../controllers/public/categoriesControllers');

const router = express.Router();

router.get('/', getAllCategories);
router.get('/products/:id', getCategoryProducts);

module.exports = router;