const connection = require('../db');
const multer = require('multer');
const path = require('path');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);

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
const homeUser = async (req, res) => {
    const six = 6;
    const id_user0 = req.query.id_user;
    const sql2 = `SELECT * FROM page`;
    const sql = `SELECT * FROM danh_muc`;
    const sql0 = `SELECT * FROM account_user WHERE id = '${id_user0}'`;
    const sql3 = `SELECT * FROM san_pham `;
    const sql1 = `SELECT * FROM san_pham LIMIT ${six}`;

    // dùng để đếm số trang
    connection.query(sql2, (err, count_page) => {
        // dùng để lấy dữ liệu danh mục
        connection.query(sql, (err, result_category) => {
            // dùng để lấy name account
            connection.query(sql0, (err, result_account) => {
                // dùng để đếm số lượng sản phẩm
                connection.query(sql3, (err, count_number_product) => {
                    const milestones = Math.ceil(((count_number_product.length) / six));
                    const sql4 = `SELECT * FROM page LIMIT ${milestones}`;
                    if (milestones <= parseInt(count_page.length)) {
                        // dùng để in ra số trang vừa đủ
                        connection.query(sql4, (err, pages) => {
                            // dùng để in ra 4 sản phẩm đầu tiên, tương tự như page 1
                            connection.query(sql1, (err, result_4_product) => {
                                res.render('user/homeUser', {
                                    pages,
                                    result: result_category,
                                    result1: result_4_product,
                                    id_user0,
                                    result_account
                                });
                            })
                        })
                    } else {
                        console.log('Ko đủ chỗ trống');
                    }
                })
            })
        });
    })

}

// xem chi tiết sản phẩm để đặt mua
const detailProduct_User = (req, res) => {
    let id_geted0 = req.query.id_user;
    let id_geted = req.query.id_product;
    const sql0 = `SELECT * FROM account_user WHERE id = '${id_geted0}'`;
    const sql = `SELECT * FROM san_pham WHERE id = '${id_geted}'`;
    const sql1 = `SELECT * FROM comment WHERE id_of_product = '${id_geted}'`;
    const sql2 = `SELECT * FROM comment WHERE id_of_user = '${id_geted0}'`;
    connection.query(sql0, (err, result_account) => {
        connection.query(sql1, (err, result_comment) => {
            connection.query(sql, (err, result) => {
                connection.query(sql2, (err, result_id_comment)=>{
                    res.render('user/detailProduct_User', {result, id_geted0, result_account, result_comment, result_id_comment});
                })
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
                        if (result_check_product[0] == undefined) {
                            connection.query(sql, (err, result_user_cart) => {
                                // console.log('đã kamf tới đây')
                                res.json({
                                    msg: 'ok',
                                    rl: id_user
                                })
                            })
                        } else {
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

// thanh toán
const toPay = async (req, res) => {
    try {
        const id_user = req.query.id_user;
        const total_money = req.query.total_money;
        const total_money1 = Intl.NumberFormat().format(total_money);
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        // current year
        let year = date_ob.getFullYear();
        let timeFull = "Ngày " + date + " tháng " + month + ", " + year;

        const result_name_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);

        const name_user = result_name_account[0].name_user;
        const result_total_money = await query(`SELECT * FROM pay WHERE id_of_user = '${id_user}'`);
        const check_pay = await query(`SELECT 1 AS c FROM pay WHERE id_of_user = '${id_user}'`);
        if (check_pay[0] == undefined) {
            if (total_money != 0) {
                const add_to_the_invoice = await query(`INSERT INTO pay (id, id_of_user, name_user, total_amount, date_order) VALUES (null, '${id_user}', '${name_user}', '${total_money}', '${timeFull}')`);
            } else {
                console.log("Không cần lưu vào database");
            }
        } else {
            if (check_pay[0].c == 1) {
                let total_money_old = (result_total_money[0].total_amount) * 1;
                let total_money_new = total_money_old + ((total_money) * 1);
                const total_money_new1 = (total_money_new).toString();
                const update_total_amount = await query(`UPDATE pay SET total_amount = '${total_money_new1}' WHERE id_of_user = '${id_user}'`);
                // console.log(total_money1);
            } else {
                console.log('Không làm gì cả');
            }
        }
        const delete_product_in_cart = await query(`DELETE FROM cart WHERE id_of_user = '${id_user}'`);
        // res.send("<script type='text/javascript'>alert('Thêm danh mục thành công'); window.open('/', '_self');</script>");
    } catch (e) {
        console.log(e);
    }
}

// trang thanh toán
const pay = async (req, res) => {
    const id_user = req.query.id_user;
    const result_name_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
    const result_total_money = await query(`SELECT * FROM pay WHERE id_of_user = '${id_user}'`);
    res.render('user/pay', {result_name_account, result_total_money, id_user});
    // res.json({result_total_money});
    console.log(result_total_money);

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

// phân trang
const pagination = async (req, res) => {
    const {page = 1, limit = 6, id_user} = req.query;
    try {
        const sanpham = await query(`SELECT * FROM san_pham LIMIT ${limit} OFFSET ${(page - 1) * limit}`);
        const count = (await query(`SELECT COUNT(*) as numberSp FROM san_pham`))[0].numberSp;

        res.json({
            id_user,
            sanpham,
            totalPages: Math.ceil(count / limit),
            currentPage: page * 1,
        })

    } catch (error) {
        res.json({
            error
        })
    }
}

// Tìm kiếm sản phẩm
const searchProduct = (req, res) => {
    const {data_input_search} = req.body;
    const id_user = req.query.id_user;
    const sql = `SELECT * FROM san_pham WHERE cost = '${data_input_search}' OR name_product ='${data_input_search}'`;
    connection.query(sql, (err, result_search) => {
        res.json({result_search, id_user});
        console.log(sql);
    })
}

// Tìm kiếm theo danh mục
const viewProductByCategory_user = (req, res) => {
    let id_category = req.query.id_category;
    let id_user = req.query.id_user;
    let sql = `SELECT * FROM san_pham WHERE id_of_category = '${id_category}'`;
    connection.query(sql, (err, result_of_search_by_category) => {
        res.json({result_of_search_by_category});
    })
}

// append div
const appendDiv = async (req, res) =>{
    try {
        const id_comment = req.query.id_comment;
        const result_div = await query(`SELECT * FROM text_area`);

    }catch (e) {
        console.log(e);
    }
}
// *********************************************************************************


// load lại home , phần danh mục và phần sản phẩm
const loadCategoryAndHome = (req, res, next) => {
    const sql0 = `SELECT * FROM page`;
    const sql = `SELECT * FROM danh_muc`;
    const sql1 = `SELECT * FROM san_pham`;
    const six = 6;
    // đếm số trang
    connection.query(sql0, (err, result_page) => {
        // danh mục
        connection.query(sql, (err, result) => {
            // tổng sản phẩm
            connection.query(sql1, (err, result1) => {
                let milestones = Math.ceil((result1.length) / six);
                if (milestones <= (result_page.length)) {
                    const sql2 = `SELECT * FROM page LIMIT ${milestones}`;
                    // số trang vừa đủ
                    connection.query(sql2, (err, pages) => {
                        const sql3 = `SELECT * FROM san_pham LIMIT ${six}`;
                        // in ra số sản phẩm limit
                        connection.query(sql3, (err, result_limit) => {
                            res.render('admin/index', {result, result_limit, pages});
                            console.log(sql2);
                        })
                    })
                } else {
                    console.log('Bạn cần tạo thêm số trang để chứa');
                }
            })
        })
    })
};

// thêm danh mục
const addCategory = (req, res, next) => {
    const {name_category} = req.body;
    const sql = `INSERT INTO danh_muc (id, name_category) VALUES (NULL, '${[name_category]}')`;
    connection.query(sql, (err) => {
        if (err) throw err
        res.send("<script type='text/javascript'>alert('Thêm danh mục thành công'); window.open('/admin/loadCategoryAndHome', '_self');</script>");
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

// xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const result_delete = await query(`DELETE FROM san_pham WHERE id = '${id}'`);
        res.send("<script type='text/javascript'>window.open('/admin/viewAllProduct', '_self');</script>");
    } catch (e) {
        console.log(e);
    }
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

// Tìm kiếm theo danh mục
const viewProductByCategory = (req, res) => {
    let id_category = req.query.id;
    let sql = `SELECT * FROM san_pham WHERE id_of_category = '${id_category}'`;
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
    addCategory, addProduct, addCart, addComment, deleteProductFromCart, deleteProduct,
    viewAllProduct, viewDetailProduct, viewProductByCategory_user, viewProductByCategory,
    editProduct, searchProduct, sumCost, toPay, pay, appendDiv,
    registerAccountUser, loginAccountUser,
    detailProduct_User, pagination
}