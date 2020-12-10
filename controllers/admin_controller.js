// database: db_web_nang_cao
const connection = require('../db');
// database: don_vi_hanh_chinh
const connection1 = require('../db1');
const multer = require('multer');
const path = require('path');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);
const query1 = util.promisify(connection1.query).bind(connection1);

// ********************************************************************************************************************
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
// ********************************************************************************************************************
// load lại home , phần danh mục và phần sản phẩm
const loadCategoryAndHome = (req, res, next) => {
    const sql0 = `SELECT * FROM page`;
    const sql = `SELECT * FROM danh_muc`;
    const sql1 = `SELECT * FROM san_pham`;
    const {id_admin} = req.query;
    const number_limit = 6;
    // đếm số trang
    connection.query(sql0, (err, result_page) => {
        // danh mục
        connection.query(sql, (err, result) => {
            // tổng sản phẩm
            connection.query(sql1, (err, result1) => {
                let milestones = Math.ceil((result1.length) / number_limit);
                if (milestones <= (result_page.length)) {
                    const sql2 = `SELECT * FROM page LIMIT ${milestones}`;
                    // số trang vừa đủ
                    connection.query(sql2, (err, pages) => {
                        const sql3 = `SELECT * FROM san_pham LIMIT ${number_limit}`;
                        // in ra số sản phẩm limit
                        connection.query(sql3, (err, result_limit) => {
                            res.render('admin/index', {result, result_limit, pages, id_admin});
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
    const {id_admin} = req.query;
    connection.query(sql1, (err, result1) => {
        connection.query(sql2, (err, result2) => {
            //sql sản phẩm nhưng để tìm kiếm
            res.render('admin/viewAllProduct', {result1, result2, id_admin});
        })
    })


}

// xem chi tiết các sản phẩm, cho phép sửa nội dung sản phẩm
const viewDetailProduct = (req, res, next) => {
    let id = req.query.id;
    const sql1 = `SELECT * FROM danh_muc`;
    const sql2 = `SELECT * FROM san_pham`;
    const sql3 = `SELECT * FROM san_pham WHERE id = '${id}'`;
    const {id_admin} = req.query;

    connection.query(sql1, (err, result1) => {
        connection.query(sql2, (err, result2) => {
            connection.query(sql3, (err, result3) => {
                if (err) throw err
                res.render('admin/viewDetailProduct', {result1, result2, result3, id_admin});
            })
        })
    })
}

// xem tất cả các danh mục
const viewAllCategory = async (req, res) => {
    try {
        const {id_admin} = req.query;
        const result_category = await query(`SELECT * FROM danh_muc`);
        res.render(`admin/viewAllCategory`, {result_category, id_admin});
    } catch (e) {
        console.log(e);
    }
}

// sửa danh mục
const editCategory = async (req, res) => {
    upload(req, res, async () => {
        try {
            const {input_edit_category} = req.body;
            const id_category = req.query.id_category;
            if (input_edit_category === '') {
                res.json({
                    msg: 'nothing'
                })
            } else {
                const result_edit = await query(`UPDATE danh_muc SET name_category = '${input_edit_category}' WHERE id = '${id_category}'`);
                const sql = `UPDATE danh_muc SET name_category = '${input_edit_category}' WHERE id = '${id_category}'`;
                res.json({
                    msg: 'ok'
                })
                console.log(sql);
            }
        } catch (e) {
            console.log(e);
        }
    })
}

// get name category
const getNameCategory = async (req, res) => {
    try {
        const {id_category} = req.query;
        const result_name_category = await query(`SELECT * FROM danh_muc WHERE id = '${id_category}'`);
        res.json({
            result_name_category
        })
    } catch (e) {
        console.log(e);
    }
}

// xóa danh mục
const deleteCategory = async (req, res) => {
    try {
        const {id_category} = req.query;
        const deleteCategory = await query(`DELETE FROM danh_muc WHERE id = '${id_category}'`);
        res.send("<script type='text/javascript'>window.open('/admin/viewAllCategory', '_self');</script>");
    } catch (e) {
        console.log(e);
    }
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

const loginAdmin = async (req, res) => {
    try {
        res.render('login_admin');
    } catch (e) {
        console.error(e)
    }
}

// Đăng nhập admin
const loginAccountAdmin = async (req, res) => {
    upload(req, res, async (err) => {
        const {dn_username_admin, dn_password_admin} = req.body;
        if (dn_username_admin === '' || dn_password_admin === '') {
            res.json({
                msg: 'account error'
            })
        } else {
            const result_id_account = await query(`SELECT id FROM account_admin WHERE username_admin = '${dn_username_admin}' AND password_admin = '${dn_password_admin}'`);
            const result = await query(`SELECT 1 as v FROM account_admin WHERE username_admin = '${dn_username_admin}' AND password_admin = '${dn_password_admin}'`);
            if (result[0] == undefined) {
                res.json({
                    msg: 'account error1'
                })
            }
            if (result[0].v == 1) {
                res.json({msg: 'login success', result_id_account});
            }

        }
    })
}

// xem chi tiết sản phẩm để đặt mua
const detailProduct_admin = (req, res) => {
    let id_admin = req.query.id_admin;
    let id_geted = req.query.id_product;
    const sql0 = `SELECT * FROM account_admin WHERE id = '${id_admin}'`;
    const sql = `SELECT * FROM san_pham WHERE id = '${id_geted}'`;
    const sql1 = `SELECT * FROM comment WHERE id_of_product = '${id_geted}'`;
    const sql2 = `SELECT * FROM comment WHERE id_of_user = '${id_admin}'`;
    // const sql3 = `SELECT * FROM reply_comment WHERE id_of_comment = ${}`

    connection.query(sql0, (err, result_account) => {
        connection.query(sql1, (err, result_comment) => {
            connection.query(sql, (err, result) => {
                connection.query(sql2, (err, result_id_comment) => {
                    res.render('admin/detailProduct_admin', {
                        result,
                        id_admin,
                        result_account,
                        result_comment,
                        result_id_comment,
                    })
                })
            })
        })
    })
}

// thống kê người sử dụng
const pageUserStatistics = async (req, res) => {
    try {
        const {id_admin} = req.query;
        const result_user = await query(`SELECT * FROM account_user`);
        res.render('admin/user_statistics', {id_admin, result_user});
    } catch (e) {
        console.error(e);
    }
}

// trang thanh toán
const pageTrackOderOfAdmin = async (req, res) => {
    const {id_user, id_admin} = req.query;
    const result_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
    const result_productConfirm = await query(`SELECT * FROM confirm_product WHERE id_of_user = '${id_user}'`);
    const result_status_order = await query(`SELECT * FROM status_order`);
    let totalMoney = 0;
    result_productConfirm.map((data) => {
        totalMoney += parseFloat(data.cost) * parseFloat(data.numbers);
    })
    res.render('admin/track_order_of_admin', {
        result_account,
        result_productConfirm,
        id_user,
        id_admin,
        totalMoney,
        result_status_order
    });

}

const updateStatusOrder = async (req, res) => {
    try {
        const {id_admin, id_confirm} = req.query;
        const {selectStatusOrder} = req.body;
        const result_status = await query(``)
        const update_status_order = await query(`UPDATE confirm_product SET status_order = '${selectStatusOrder}' WHERE id = '${id_confirm}'`);
        await res.json({
            msg: 'ok'
        })
    } catch (e) {
        console.error(e);
    }
}
module.exports = {
    loadCategoryAndHome, addCategory, addProduct, deleteProduct, viewAllProduct, viewDetailProduct, loginAdmin,
    viewProductByCategory, viewAllCategory, deleteCategory, getNameCategory, editProduct, editCategory,
    loginAccountAdmin, detailProduct_admin, pageUserStatistics, pageTrackOderOfAdmin, updateStatusOrder
}