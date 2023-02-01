const express = require('express');
const router = express.Router();

const {
    addMyOrders,
    getMyOrders,
    deleteOrderedProduct,
    deleteAllOrderedProducts
} = require('../../../controllers/users/ordersControllers');

router.post('/add', addMyOrders);

router.get('/', getMyOrders);
router.delete("/", deleteOrderedProduct)
router.delete("/all", deleteAllOrderedProducts)

module.exports = router