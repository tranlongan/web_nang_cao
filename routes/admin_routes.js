const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin_controller');

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

router.post('/editProduct', controller.editProduct);

// xem tổng quan danh mục
router.get('/admin/viewAllCategory', controller.viewAllCategory);

// get name category
router.get('/getNameCategory', controller.getNameCategory);
// sửa danh mục
router.post('/editCategory', controller.editCategory);
// xóa danh mục
router.get('/deleteCategory', controller.deleteCategory);

// tìm kiếm sản phẩm theo danh mục
router.get('/viewProductByCategory', controller.viewProductByCategory);

// xóa sản phẩm
router.get('/deleteProduct', controller.deleteProduct);

// load login admin
router.get('/loginAdmin', controller.loginAdmin);

router.post('/loginAccountAdmin', controller.loginAccountAdmin);

router.get('/admin/detailProduct_admin', controller.detailProduct_admin);

// trang thống kê người sử dụng
router.get('/admin/user_statistics', controller.pageUserStatistics);

// trang thanh toán
router.get('/user/pageTrackOderOfAdmin', controller.pageTrackOderOfAdmin);

router.post('/updateStatusOrder', controller.updateStatusOrder);
module.exports = router;
