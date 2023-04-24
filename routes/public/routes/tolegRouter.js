const express = require('express');
const router = express.Router();
const { halkFinished, sellerProduct, sellerProductNew, setId, senagatFinished } = require('../../../controllers/public/tolegController')
router.get("/finished/halk", halkFinished)
router.get("/finished/senagat", senagatFinished)
router.get("/setId",setId)
router.get("/:id", sellerProduct)
router.get("/:id/new", sellerProductNew)
module.exports = router