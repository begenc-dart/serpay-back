const express = require('express');
const router = express.Router();
const { halkFinished, sellerProduct, sellerProductNew, setId } = require('../../../controllers/public/tolegController')
router.get("/finished/halk", halkFinished)
router.get("/setId",setId)
router.get("/:id", sellerProduct)
router.get("/:id/new", sellerProductNew)
module.exports = router