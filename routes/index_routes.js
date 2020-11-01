const express = require('express');
const router = express.Router();

const controller = require('../controllers/index_controllers');

/* GET home page. */
// router.get('/', (req, res) => res.render('index'));

router.get('/', controller.loadLogin);

// load home của user
router.get('/homeUser', controller.homeUser);

// đăng ký tài khoản - của bên user
router.post('/registerAccountUser', controller.registerAccountUser);
// đăng nhập - của bên user
router.post('/loginAccountUser', controller.loginAccountUser);

// xem chi tiết sản phẩm để đặt hàng - của bên user
router.get('/user/detailProduct_User', controller.detailProduct_User);

//thêm vào giỏ hàng
router.post('/addCart', controller.addCart);

// xóa khỏi giỏ hàng
router.get('/deleteProductFromCart', controller.deleteProductFromCart);

// trang giỏ hàng
router.get('/user/pageCart', controller.pageCart);

//Tính tổng số tiền trong giỏ hàng
router.get('/sumCost', controller.sumCost);

// bình luận trong bài viết chi tiết
router.post('/addComment', controller.addComment);
// ****************************************************************************
// load home của admin
router.get('/admin/loadCategoryAndHome', controller.loadCategoryAndHome);

// thêm danh mục - của bên admin
router.post('/addCategory', controller.addCategory);

// thêm sản phẩm - của bên admin
router.post('/addProduct', controller.addProduct);

// xem tổng quan các sản phẩm - của bên admin
router.get('/admin/viewAllProduct', controller.viewAllProduct);

// xem chi tiết để chỉnh sửa sản phẩm - của bên admin
router.get('/admin/viewDetailProduct', controller.viewDetailProduct);
// giống với phương thức trên
router.post('/editProduct', controller.editProduct);

// tìm kiếm sản phẩm - của bên admin
router.post('/searchProduct', controller.searchProduct);

// tìm kiếm sản phẩm theo danh mục - của bên admin
router.get('/viewProductByCategory', controller.viewProductByCategory);


module.exports = router;
