const express = require('express');
const router = express.Router();

const {
    addMyOrders,
    getMyOrders,
    deleteOrderedProduct,
    deleteAllOrderedProducts
} = require('../../../controllers/users/ordersControllers');

router.post('/add', addMyOrders);
// router.post("/kart-halk",)
router.get('/', getMyOrders);
router.post("/delete", deleteOrderedProduct)
router.post("/delete/all", deleteAllOrderedProducts)

module.exports = router