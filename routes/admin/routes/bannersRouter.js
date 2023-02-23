const express = require('express');
const {
    uploadBannerImage,
    addBanner,
    deleteBanner,
    editBanner
} = require('../../../controllers/admin/bannerControllers');
const {
    getAllBanners,
    getBanner,
} = require('../../../controllers/public/bannerControllers');
const { protect } = require("../../../controllers/admin/adminControllers")
const router = express.Router();

router.get('/', getAllBanners);
router.get('/:id', getBanner);
router.post('/add', addBanner);
router.patch("/:id", editBanner)
router.post('/delete/:id', deleteBanner);
router.post('/upload-image/:id', uploadBannerImage);

module.exports = router;