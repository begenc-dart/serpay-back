const express = require('express');
const router = express.Router();
const { getAll, sellerProduct, sellerProductNew, setId } = require('../../../controllers/public/sellerController')
router.get("/", getAll)
router.get("/setId",setId)
router.get("/:id", sellerProduct)
router.get("/:id/new", sellerProductNew)
module.exports = router