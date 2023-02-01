const express = require('express');
const {
    addSubcategory,
    editSubcategory,
    deleteSubcategory,
    getOne,
    uploadSubcategoryImage
} = require('../../../controllers/admin/subcategoriesControllers');

const router = express.Router();
router.get("/get-one/:id", getOne)
router.post('/add', addSubcategory);
router.patch('/:id', editSubcategory);
router.delete('/:id', deleteSubcategory);
router.post("/upload-image/:id", uploadSubcategoryImage)
module.exports = router;