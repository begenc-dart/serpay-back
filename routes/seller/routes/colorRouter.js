const express = require('express');
const {
    addColor,
    editColor,
    uploadColorImage
} = require('../../../controllers/seller/colorsControllers');
const {
    getAllColors,
} = require('../../../controllers/public/colorsControllers');
const router = express.Router();
router.get('/', getAllColors);
router.post('/add', addColor);
router.patch('/:id', editColor);


module.exports = router;