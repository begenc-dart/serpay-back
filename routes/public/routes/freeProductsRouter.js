const express = require('express');
const {
    getAllFreeProducts,
    getOne,
} = require('../../../controllers/public/freeProductsControllers');

const router = express.Router();

router.get('/', getAllFreeProducts);
router.get("/:id", getOne)

module.exports = router;