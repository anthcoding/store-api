const express = require('express');
const router = express.Router();

const { gettAllProducts, gettAllProductsStatic } = require('../controllers/products');

router.route('/').get(gettAllProducts);
router.route('/static').get(gettAllProductsStatic);

module.exports = router;
