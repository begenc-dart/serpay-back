const express = require('express');
const {
    addCategory,
    editCategory,
    deleteCategory,
    getOneCategory,
    addCategoryBrand,
    uploadCategoryImage
} = require('../../../controllers/admin/categoriesControllers');
const {
    getAllCategories,
} = require('../../../controllers/public/categoriesControllers');
const router = express.Router();
router.get('/', getAllCategories);
router.get("/:category_id", getOneCategory)
router.post('/add', addCategory);
router.post("/brands/add", addCategoryBrand)
router.post("/upload-image/:id", uploadCategoryImage)
router.patch('/:id', editCategory);
router.delete('/delete/:id', deleteCategory);

module.exports = router;