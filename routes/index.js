var express = require('express');
var router = express.Router();

const controller = require('../controllers/index');

/* GET home page. */
router.get('/', controller.loadCategoryAndLoadHome);


router.get('/index/:name_category', controller.addCategory);

module.exports = router;
