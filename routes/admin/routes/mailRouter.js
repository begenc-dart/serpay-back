const express = require('express');
const { getAllMail,deleteMail, getMail } = require('../../../controllers/admin/mailControllers');

const router = express.Router();
router.get('/', getAllMail);
router.get("/:id",getMail)
router.post('/delete/:id', deleteMail);

module.exports = router;