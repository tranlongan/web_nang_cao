const express = require('express');
const router = express.Router();

const controller = require('../controllers/index_controllers');

/* GET home page. */
// router.get('/', (req, res) => res.render('index'));

router.get('/', controller.loadCategoryAndHome);

router.post('/addCategory', controller.addCategory);

router.post('/addProduct', controller.addProduct)

router.get('/viewAllProduct', controller.viewAllProduct);

router.get('/viewDetailProduct', controller.viewDetailProduct);

module.exports = router;
