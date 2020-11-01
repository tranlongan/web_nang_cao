const connection = require('../db');
const multer = require('multer');
const path = require('path');

// *******************************************************************************
// set up cho việc upload ảnh
// cho biết toàn bộ thông tin về file ảnh
const storage = multer.diskStorage({
    destination: 'public/upload/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// tạo ra function upload
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

// tạp ra function kiểm tra có phải là ảnh ko
function checkFileType(file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Only image');
    }
};
// Kết thúc phần set up ảnh
// *******************************************************************************

// phần cho user
// Đăng ký tài khoản user
const registerAccountUser = (req, res) => {
    upload(req, res, (err) => {
        const {dk_username_user, nameAccount_user, dk_password_user, dk_password_user1} = req.body;
        if (dk_username_user === '' || nameAccount_user === '' || dk_password_user === '' || dk_password_user1 === '') {
            res.json({
                msg: 'Important items must not be left blank'
            })
        } else {
            if (dk_password_user != dk_password_user1) {
                res.json({
                    msg: 'The two passwords are not the same'
                })
            } else {
                const sql = `INSERT INTO account_user (id, username_user, name_user, password_user) VALUES (null, '${dk_username_user}', '${nameAccount_user}','${dk_password_user}')`;
                connection.query(sql, (err, result) => {
                    res.json({
                        msg: 'Sign up success'
                    })
                })
            }
        }
    })
}

// Đăng nhập user
const loginAccountUser = (req, res) => {
    upload(req, res, (err) => {
        const {dn_username_user, dn_password_user} = req.body;
        const sql0 = `SELECT id FROM account_user WHERE username_user = '${dn_username_user}' AND password_user = '${dn_password_user}'`;
        const sql = `SELECT 1 as v FROM account_user WHERE username_user = '${dn_username_user}' AND password_user = '${dn_password_user}'`;
        if (dn_username_user === '' || dn_password_user === '') {
            res.json({
                msg: 'account error'
            })
        } else {
            connection.query(sql0, (err, result_id_account) => {
                connection.query(sql, (err, result) => {
                    if (result[0].v == 1) {
                        res.json({msg: 'login success', rl: result_id_account});
                    } else {
                        res.json({
                            msg: 'account error1'
                        })
                    }
                    // console.log(result_id_account);
                });
            });
        }
    })
}

// load home của user
const homeUser = (req, res) => {
    const id_user0 = req.query.id_user;
    const sql0 = `SELECT * FROM account_user WHERE id = '${id_user0}'`;
    const sql = `SELECT * FROM danh_muc`;
    const sql1 = `SELECT * FROM san_pham`;

    connection.query(sql, (err, result) => {
        connection.query(sql0, (err, result_account) => {
            connection.query(sql1, (err, result1) => {
                // console.log(id_user0)
                res.render('user/homeUser', {result, result1, id_user0, result_account});
            })
        })
    });
}

// xem chi tiết sản phẩm để đặt mua
const detailProduct_User = (req, res) => {
    let id_geted0 = req.query.id_user;
    let id_geted = req.query.id_product;
    const sql0 = `SELECT * FROM account_user WHERE id = '${id_geted0}'`;
    const sql = `SELECT * FROM san_pham WHERE id = '${id_geted}'`;
    const sql1 = `SELECT * FROM comment WHERE id_of_product = '${id_geted}'`;
    connection.query(sql0, (err, result_account) => {
        connection.query(sql1, (err, result_comment) => {
            connection.query(sql, (err, result) => {
                res.render('user/detailProduct_User', {result, id_geted0, result_account, result_comment});
                // console.log(id_geted0);
            })
        })
    })
}

// thêm vào giỏ hàng
const addCart = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            throw err
        } else {
            const id_user = req.query.id_user;
            const id_product = req.query.id_product;
            const {numbers} = req.body;
            const sql0 = `SELECT * FROM san_pham WHERE id = '${id_product}'`;
            connection.query(sql0, (err, result_product) => {
                const link_image = result_product[0].link_image;
                const name_product = result_product[0].name_product;
                const cost = parseFloat(result_product[0].cost);
                const sql1 = `SELECT 1 AS b FROM cart WHERE id_of_product = '${id_product}'`;
                const sql_00 = `SELECT * FROM cart WHERE id_of_product = '${id_product}'`

                const sql = `INSERT INTO cart (id, id_of_user, id_of_product, numbers, link_image, name_product, cost) VALUES (null ,'${id_user}', '${id_product}', '${numbers}', '${link_image}','${name_product}','${cost}')`;
                connection.query(sql_00, (err, result1) => {
                    connection.query(sql1, (err, result_check_product) => {
                        if(result_check_product[0] == undefined) {
                            connection.query(sql, (err, result_user_cart) => {
                                // console.log('đã kamf tới đây')
                                res.json({
                                    msg: 'ok',
                                    rl: id_user
                                })
                            })
                        }else {
                            if (result_check_product[0].b === 1) {
                                let numbers1 = parseInt(result1[0].numbers);
                                let sum = numbers1 + parseInt(numbers);
                                const sql2 = `UPDATE cart SET numbers = '${sum}' WHERE id_of_product ='${id_product}'`;
                                connection.query(sql2, (err, result2) => {
                                    res.json({
                                        msg: 'ok',
                                        rl: id_user,
                                    });
                                    // console.log(numbers);
                                })
                            }
                        }
                    })


                })
            })
        }
    })
}

// xóa sản phẩm ra khỏi giỏ hàng
const deleteProductFromCart = (req, res) => {
    const id_user = req.query.id_user;
    const id_product = req.query.id_product;
    const sql = `DELETE FROM cart WHERE id_of_user = '${id_user}' AND id_of_product = '${id_product}'`;
    connection.query(sql, (err, result_delete) => {
        res.redirect('back');
    })
}

// trang xem giỏ hàng
const pageCart = (req, res) => {
    const id_geted = req.query.id_user;
    const sql0 = `SELECT * FROM account_user WHERE id = '${id_geted}'`;
    const sql = `SELECT * FROM cart WHERE id_of_user = '${id_geted}'`;
    connection.query(sql0, (err, result_account) => {
        connection.query(sql, (err, result_user_cart) => {
            res.render('user/cart', {result_user_cart, id_geted, result_account});
            // console.log(id_geted)
        })
    })
}

// tính tổng số tiền trong giỏ hàng
const sumCost = (req, res) => {
    const id_user = req.query.id_user;
    const sql = `SELECT * FROM cart WHERE id_of_user ='${id_user}'`;
    connection.query(sql, (err, result_sum_cost) => {
        res.json({result_sum_cost});
    })
}

// tính năng bình luận
const addComment = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            throw err
        } else {
            const id_user = req.query.id_user;
            const id_product = req.query.id_product;
            const {data_input_answer} = req.body;
            const sql0 = `SELECT * FROM account_user WHERE id = '${id_user}'`;

            let date_ob = new Date();
            let date = ("0" + date_ob.getDate()).slice(-2);
            // current month
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            // current year
            let year = date_ob.getFullYear();
            let timeFull = "Ngày " + date + " tháng " + month + ", " + year;
            connection.query(sql0, (err, result_account) => {
                const name_user = result_account[0].name_user;
                const sql = `INSERT INTO comment (id, id_of_user, id_of_product, name_user, comment_content, time_comment) VALUES (null, '${id_user}', '${id_product}', '${name_user}', '${data_input_answer}', '${timeFull}')`;
                connection.query(sql, (err, result_comment) => {
                    res.json({msg: 'ok'});
                })
            })
        }
    })
}
// *********************************************************************************


// load lại home , phần danh mục và phần sản phẩm
const loadCategoryAndHome = (req, res, next) => {
    const sql = `SELECT * FROM danh_muc`;
    const sql1 = `SELECT * FROM san_pham`
    connection.query(sql, (err, result) => {
        connection.query(sql1, (err, result1) => {
            console.log(result)
            res.render('admin/index', {result, result1})
        })
    });
};

// thêm danh mục
const addCategory = (req, res, next) => {
    const {name_category} = req.body;
    const sql = `INSERT INTO danh_muc (id, name_category) VALUES (NULL, '${[name_category]}')`;
    connection.query(sql, (err) => {
        if (err) throw err
        res.send("<script type='text/javascript'>alert('Thêm danh mục thành công'); window.open('/', '_self');</script>");
    })
};

// thêm sản phẩm
const addProduct = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.json({
                msg: err
            })
        } else {
            if (req.file == undefined) {
                res.json({
                    msg: 'no_files_have_been_selected'
                })
            } else {
                const {id_of_category, name_product, cost_product, description} = req.body;
                if (name_product === '' || cost_product === '') {
                    res.json({
                        msg: 'important_parts_must_not_be_removed'
                    })
                } else {
                    const sql0 = `SELECT name_category FROM danh_muc WHERE id = '${id_of_category}'`;
                    connection.query(sql0, (err, result1) => {
                        let data_name_category = (result1[0].name_category)

                        const sql = `INSERT INTO san_pham (id, id_of_category, link_image, name_product, cost, name_category, description) VALUES (NULL ,'${id_of_category}','/upload/${req.file.filename}','${name_product}','${cost_product}','${data_name_category}','${description}') `;
                        console.log(result1);
                        connection.query(sql, (err) => {
                            res.json({
                                msg: 'is_allowed_to_post'
                            })
                            console.log(req.file.filename);
                        })
                    })
                }
            }
        }
    });
}

// xem tất cả các sản phẩm
const viewAllProduct = (req, res, next) => {
    const sql1 = `SELECT * FROM danh_muc`;
    const sql2 = `SELECT * FROM san_pham`;
    connection.query(sql1, (err, result1) => {
        connection.query(sql2, (err, result2) => {
            //sql sản phẩm nhưng để tìm kiếm
            res.render('admin/viewAllProduct', {result1, result2});
        })
    })


}

// xem chi tiết các sản phẩm, cho phép sửa nội dung sản phẩm
const viewDetailProduct = (req, res, next) => {
    let id = req.query.id;
    const sql1 = `SELECT * FROM danh_muc`;
    const sql2 = `SELECT * FROM san_pham`;
    const sql3 = `SELECT * FROM san_pham WHERE id = '${id}'`;

    connection.query(sql1, (err, result1) => {
        connection.query(sql2, (err, result2) => {
            connection.query(sql3, (err, result3) => {
                if (err) throw err
                res.render('admin/viewDetailProduct', {result1, result2, result3})
            })
        })
    })
}

// chỉnh sửa sản phẩm
const editProduct = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.json({
                msg: err
            })
        } else {
            let id_geted = req.query.id;
            const {id_of_category1, name_product1, cost_product1, description1} = req.body;
            const sql4 = `SELECT name_category FROM danh_muc WHERE id = '${id_of_category1}'`;
            const sql6 = `SELECT link_image FROM san_pham WHERE id = '${id_geted}'`
            if (req.file === undefined) {
                connection.query(sql6, (err, result6) => {
                    connection.query(sql4, (err, result4) => {
                        let data_name_category1 = (result4[0].name_category);
                        let data_link_image1 = result6[0].link_image;
                        const sql5 = `UPDATE san_pham SET id_of_category ='${id_of_category1}', 
                            link_image = '${data_link_image1}', name_product = '${name_product1}', 
                            cost ='${cost_product1}', name_category = '${data_name_category1}', 
                            description = '${description1}' WHERE id = '${id_geted}'`;
                        connection.query(sql5, (err, result5) => {
                            res.json({
                                msg: 'successful_editing'
                            })
                            console.log(result6[0].link_image);
                        })
                    })
                })
            } else {
                connection.query(sql4, (err, result4) => {
                    let data_name_category1 = (result4[0].name_category);
                    const sql5 = `UPDATE san_pham SET id_of_category ='${id_of_category1}', 
                            link_image = '/upload/${req.file.filename}', name_product = '${name_product1}', 
                            cost ='${cost_product1}', name_category = '${data_name_category1}', 
                            description = '${description1}' WHERE id = '${id_geted}'`;
                    connection.query(sql5, (err, result5) => {
                        res.json({
                            msg: 'successful_editing'
                        })
                        console.log(req.file.filename);
                    })
                })
            }
        }
    });
}

// Tìm kiếm sản phẩm
const searchProduct = (req, res) => {
    const {data_input_search} = req.body;
    const sql = `SELECT * FROM san_pham WHERE name_category = '${data_input_search}' OR name_product ='${data_input_search}'`;
    connection.query(sql, (err, result_search) => {
        res.json({result_search});
        console.log(sql);
    })
}

// Tìm kiếm theo danh mục
const viewProductByCategory = (req, res) => {
    let idGeted = req.query.id;
    let sql = `SELECT * FROM san_pham WHERE id_of_category = '${idGeted}'`;
    connection.query(sql, (err, result_of_search_by_category) => {
        res.json({result_of_search_by_category});
    })
}

//Load phần đăng nhập, đăng ký
const loadLogin = (req, res) => {
    res.render('login_user');
}
// *******************************************************************************


module.exports = {
    loadLogin, loadCategoryAndHome, homeUser, pageCart,
    addCategory, addProduct, addCart, addComment, deleteProductFromCart,
    viewAllProduct, viewDetailProduct, viewProductByCategory,
    editProduct, searchProduct, sumCost,
    registerAccountUser, loginAccountUser,
    detailProduct_User
}