const express = require('express');
const {
    getAllBrands,
    addBrand,
    editBrand,
    deleteBrand,
    uploadBrandImage,
    addBrandCategory,
    deleteBrandCategory,
    getBrand,
    getUnlimited,
} = require('../../../controllers/admin/brandsControllers');
const router = express.Router();
router.get('/', getAllBrands);
router.get("/all", getUnlimited)
router.get("/:id", getBrand)
router.post('/add', addBrand);
router.post('/add-category/:id', addBrandCategory);
router.patch('/:id', editBrand);
router.delete('/:id', deleteBrand);
router.delete('/delete-category', deleteBrandCategory);
router.post('/upload-image/:id', uploadBrandImage);

module.exports = router;