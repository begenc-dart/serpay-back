const express = require('express');
const {
    getAllOrders,
    getOrderProducts,
    changeOrderStatus,
    deleteOrderProduct,
} = require('../../../controllers/admin/ordersControllers');

const router = express.Router();

router.get('/', getAllOrders);
router.delete('/order-products/delete/:id', deleteOrderProduct);
router.get('/order-products/:id', getOrderProducts);
router.patch('/status/:id', changeOrderStatus);

module.exports = router;