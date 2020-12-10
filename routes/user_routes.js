const express = require('express');
const router = express.Router();
const controller = require('../controllers/user_controllers');
/* GET home page. */
// router.get('/', (req, res) => res.render('index'));

router.get('/', controller.loadLogin);

// load home của user
router.get('/homeUser', controller.homeUser);

// đăng ký tài khoản - của bên user
router.post('/registerAccountUser', controller.registerAccountUser);
// đăng nhập - của bên user
router.post('/loginAccountUser', controller.loginAccountUser);

// hồ sơ của user
router.get('/user/profile_user', controller.profile_user);

// tìm kiếm sản phẩm theo tên sản phẩm hoặc tên danh mục
router.post('/searchProduct', controller.searchProduct);

// tìm kiếm sản phẩm theo danh mục
router.get('/viewProductByCategory_user', controller.viewProductByCategory_user);

// tìm sản phẩm theo mức tiền
router.post('/searchProductByMoney', controller.searchProductByMoney);

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

// rep bình luận
router.post('/addReplyComment', controller.addReplyComment);
router.get('/getReplyComment', controller.getReplyComment);

//phân trang
router.post('/pagination', controller.pagination);

// thêm số sản phẩm mà user muốn hiển thị vào cookie
router.post('/insertNumberPageToCookie', controller.insertNumberPageToCookie);

// xem chi tiết sản phẩm để đặt hàng - của bên user
router.get('/user/detailProduct_User', controller.detailProduct_User);

// lấy dữ liệu các tỉnh thành
router.get('/getDataProvince', controller.getDataProvince);

// thêm địa chỉ gia hàng
router.post('/addAddress', controller.addAddress);

// load danh sách các địa chỉ
router.get('/getAddress', controller.getAddress);

router.get('/getProductFromCart', controller.getProductFromCart);

// xác nhận mua
router.get('/user/pageProductFromCart', controller.pageProductConfirm);

// trang thanh toán
router.get('/user/pageTrackOder', controller.pageTrackOder);

// thay đổi số lượng sản phẩm trong giỏ hàng
router.post('/updateNumbersProduct', controller.updateNumbersProduct);

// chọn địa chỉ mặc định
router.get('/chooseAddress', controller.chooseAddress);

// sử dụng json
router.get('/useJson', controller.useJson);

// trang địa chỉ
router.get('/user/pageAddress', controller.pageAddress);
// ********************************************************************************************************************


module.exports = router;
