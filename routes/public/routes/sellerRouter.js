const express = require('express');
const router = express.Router();
const { getAll, sellerProduct, sellerProductNew } = require('../../../controllers/public/sellerController')
router.get("/", getAll)
router.get("/:id", sellerProduct)
router.get("/:id/new", sellerProductNew)

module.exports = router