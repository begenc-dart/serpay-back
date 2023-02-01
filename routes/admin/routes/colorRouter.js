const express = require('express');
const {
    addColor,
    editColor,
    deleteColor
} = require('../../../controllers/admin/colorsControllers');
const {
    getAllColors,
} = require('../../../controllers/public/colorsControllers');
const router = express.Router();
router.get('/', getAllColors);
router.post('/add', addColor);
router.patch('/:id', editColor);
router.delete('/:id', deleteColor);

module.exports = router;