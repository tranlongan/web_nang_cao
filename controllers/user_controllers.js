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
// phần cho user
//Load phần đăng nhập, đăng ký
const loadLogin = (req, res) => {
    res.render('login_user');
}
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
    const number_limit = 3;
    const id_user = req.query.id_user;
    const sql2 = `SELECT * FROM page`;
    const sql = `SELECT * FROM danh_muc`;
    const sql0 = `SELECT * FROM account_user WHERE id = '${id_user}'`;
    const sql3 = `SELECT * FROM san_pham `;
    const sql1 = `SELECT * FROM san_pham LIMIT ${number_limit}`;

    // dùng để đếm số trang
    connection.query(sql2, (err, count_page) => {
        // dùng để lấy dữ liệu danh mục
        connection.query(sql, (err, result_category) => {
            // dùng để lấy name account
            connection.query(sql0, (err, result_account) => {
                // dùng để đếm số lượng sản phẩm
                connection.query(sql3, (err, count_number_product) => {
                    // Nếu không tồn tại cookie number_page thì mặc định sẽ là hiển thị 3 sản phẩm
                    if (req.cookies.number_page == undefined) {
                        const milestones = Math.ceil(((count_number_product.length) / number_limit));
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
                                        id_user,
                                        result_account
                                    });
                                })
                            })
                        } else {
                            console.log('Ko đủ chỗ trống');
                        }
                    }
                    // Trường hợp đã tồn tại cookie number_page
                    if (req.cookies.number_page != undefined) {
                        const data_of_number_page_cookie = req.cookies.number_page;
                        const number_limit_of_cookie = data_of_number_page_cookie.numberPage;
                        const sql5 = `SELECT * FROM san_pham LIMIT ${number_limit_of_cookie}`;

                        const milestones = Math.ceil(((count_number_product.length) / number_limit_of_cookie));
                        const sql4 = `SELECT * FROM page LIMIT ${milestones}`;
                        if (milestones <= parseInt(count_page.length)) {
                            // dùng để in ra số trang vừa đủ
                            connection.query(sql4, (err, pages) => {
                                // dùng để in ra 4 sản phẩm đầu tiên, tương tự như page 1
                                connection.query(sql5, (err, result_4_product) => {
                                    res.render('user/homeUser', {
                                        pages,
                                        result: result_category,
                                        result1: result_4_product,
                                        id_user,
                                        result_account
                                    });
                                })
                            })
                        } else {
                            console.log('Ko đủ chỗ trống');
                        }
                    }
                })
            })
        });
    })
    console.log(req.cookies.number_page)
}

// xem chi tiết sản phẩm để đặt mua
const detailProduct_User = (req, res) => {
    let id_user = req.query.id_user;
    let id_geted = req.query.id_product;
    const sql0 = `SELECT * FROM account_user WHERE id = '${id_user}'`;
    const sql = `SELECT * FROM san_pham WHERE id = '${id_geted}'`;
    const sql1 = `SELECT * FROM comment WHERE id_of_product = '${id_geted}'`;
    const sql2 = `SELECT * FROM comment WHERE id_of_user = '${id_user}'`;
    // const sql3 = `SELECT * FROM reply_comment WHERE id_of_comment = ${}`

    connection.query(sql0, (err, result_account) => {
        connection.query(sql1, (err, result_comment) => {
            connection.query(sql, (err, result) => {
                connection.query(sql2, (err, result_id_comment) => {
                    res.render('user/detailProduct_User', {
                        result,
                        id_user,
                        result_account,
                        result_comment,
                        result_id_comment,
                    })
                })
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
            let date_ob = new Date();
            let date = ("0" + date_ob.getDate()).slice(-2);
            // current month
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            // current year
            let year = date_ob.getFullYear();
            let timeFull = "Ngày " + date + " tháng " + month + ", " + year;

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

                const sql = `INSERT INTO cart (id, id_of_user, id_of_product, numbers, link_image, name_product, cost, date_addCart) VALUES (null ,'${id_user}', '${id_product}', '${numbers}', '${link_image}','${name_product}','${cost}', '${timeFull}')`;
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
const pageCart = async (req, res) => {
    try {
        const id_user = req.query.id_user;
        const result_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
        const result_user_cart = await query(`SELECT * FROM cart WHERE id_of_user = '${id_user}'`);
        const result_address_default = await query(`SELECT * FROM address WHERE id_of_user = '${id_user}' AND chosen = '1'`);
        res.render('user/cart', {result_user_cart, id_user, result_account, result_address_default});
    } catch (e) {
        console.log(e);
    }

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

// trả lời bình luận
const addReplyComment = async (req, res) => {
    upload(req, res, async (err) => {
        try {
            const id_user = req.query.id_user;
            const id_product = req.query.id_product;
            const id_comment = req.query.id_comment;
            const {text_area_reply} = req.body;

            let date_ob = new Date();
            let date = ("0" + date_ob.getDate()).slice(-2);
            // current month
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            // current year
            let year = date_ob.getFullYear();
            let timeFull = "Ngày " + date + " tháng " + month + ", " + year;

            const result_name_user = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
            const name_user = result_name_user[0].name_user;
            const add_reply = await query(`INSERT INTO reply_comment (id, id_of_user, id_of_product, id_of_comment, name_user,content_reply, date_reply) VALUES (null ,'${id_user}','${id_product}','${id_comment}','${name_user}','${text_area_reply}','${timeFull}')`)

            res.json({
                msg: 'ok'
            })

            console.log(text_area_reply);
            // console.log(result_reply);
        } catch (e) {
            console.error(e);
        }
    })

}

const getReplyComment = async (req, res) => {
    try {
        const id_comment = req.query.id_comment;
        const id_user = req.query.id_user;
        const result_reply = await query(`SELECT * FROM reply_comment`);
        res.json({
            result_reply
        })
    } catch (e) {
        console.log(e);
    }
}

// phân trang
const pagination = async (req, res) => {
    const {page = 1, limit = 3, id_user} = req.query;
    try {
        if (req.cookies.number_page == undefined) {
            const sanpham = await query(`SELECT * FROM san_pham LIMIT ${limit} OFFSET ${(page - 1) * limit}`);
            const count = (await query(`SELECT COUNT(*) as numberSp FROM san_pham`))[0].numberSp;

            res.json({
                id_user,
                sanpham,
                totalPages: Math.ceil(count / limit),
                currentPage: page * 1,
            })
        }
        if (req.cookies.number_page != undefined) {
            const data_of_number_page_cookie = req.cookies.number_page;
            const number_limit_of_cookie = data_of_number_page_cookie.numberPage;
            const sanpham = await query(`SELECT * FROM san_pham LIMIT ${number_limit_of_cookie} OFFSET ${(page - 1) * number_limit_of_cookie}`);
            const count = (await query(`SELECT COUNT(*) as numberSp FROM san_pham`))[0].numberSp;

            res.json({
                id_user,
                sanpham,
                totalPages: Math.ceil(count / number_limit_of_cookie),
                currentPage: page * 1,
            })
        }
    } catch (error) {
        res.json({
            error
        })
    }
}

// thêm số sản phẩm hiển thị vào cookie
const insertNumberPageToCookie = (req, res) => {
    const {data_select_number_page} = req.body;
    const id_user = req.query.id_user;
    let number_page = {
        idUser: id_user,
        numberPage: data_select_number_page
    }
    // lưu cookie trong vòng 12 giờ
    res.cookie('number_page', number_page, {maxAge: 12 * 60 * 60 * 1000});
    res.json({
        msg: 'ok'
    })
}

// Tìm kiếm sản phẩm
const searchProduct = (req, res) => {
    const {data_input_search} = req.body;
    const id_user = req.query.id_user;
    // const sql = `SELECT * FROM san_pham WHERE cost < '${data_input_search}'`;
    const sql1 = `SELECT * FROM san_pham WHERE name_product LIKE '%${data_input_search}%' OR cost LIKE '%${data_input_search}%' OR name_category LIKE '%${data_input_search}%'`;
    // connection.query(sql, (err, result_search)=>{
    connection.query(sql1, (err, result_search) => {
        res.json({result_search, id_user});
        console.log(sql1);
    })
    // })
}

// Tìm kiếm theo danh mục
const viewProductByCategory_user = (req, res) => {
    let id_category = req.query.id_category;
    let id_user = req.query.id_user;
    let sql = `SELECT * FROM san_pham WHERE id_of_category = '${id_category}'`;
    connection.query(sql, (err, result_of_search_by_category) => {
        res.json({id_user, result_of_search_by_category});
    })
}

// Tìm kiếm theo giá tiền
const searchProductByMoney = async (req, res) => {
    upload(req, res, async (err) => {
        try {
            const id_user = req.query.id_user;
            const id_category = req.query.id_category;
            const {headMoney, tailMoney} = req.body;

            if (headMoney === '' && tailMoney === '') {
                res.json({id_user, msg: 'nothing to find'});
            }
            if (headMoney === '' || tailMoney === '') {
                if (tailMoney === '') {
                    const starting_price = await query(`SELECT * FROM san_pham WHERE  cost > '${headMoney}' AND id_of_category = '${id_category}'`);
                    res.json({
                        msg: 'starting_price',
                        id_user,
                        starting_price
                    });
                }
                if (headMoney === '') {
                    const end_price = await query(`SELECT * FROM san_pham WHERE cost < '${tailMoney}' AND id_of_category = '${id_category}'`);
                    res.json({
                        msg: 'end_price',
                        id_user,
                        end_price
                    })
                }
            }
            if (headMoney === tailMoney) {
                const start_equal_end_price = await query(`SELECT * FROM san_pham WHERE cost = '${headMoney}' AND id_of_category = '${id_category}' `);
                res.json({
                    msg: 'start_equal_end_price',
                    id_user,
                    start_equal_end_price
                })
            }
            if (headMoney != '' && tailMoney != '') {
                const start_and_end_price = await query(`SELECT * FROM san_pham WHERE (cost > '${headMoney}' AND cost < '${tailMoney}') AND id_of_category = '${id_category}' `);
                res.json({
                    msg: 'start_and_end_price',
                    id_user,
                    start_and_end_price
                })
                // console.log(start_and_end_price);
            }
        } catch (e) {
            console.log(e);
        }
    })
}

// load phần profile của user
const profile_user = async (req, res) => {
    try {
        const {id_user} = req.query;
        const result_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
        const result_province = await query1(`SELECT * FROM devvn_tinhthanhpho`);

        await res.render('user/profile_user', {id_user, result_account, result_province});
    } catch (e) {
        console.log(e)
    }
}

// lấy dữ liệu các tỉnh thành
const getDataProvince = async (req, res) => {
    try {
        const {matp, maqh} = req.query;
        const result_district = await query1(`SELECT * FROM devvn_quanhuyen WHERE matp = '${matp}'`);
        const result_ward = await query1(`SELECT * FROM devvn_xaphuongthitran WHERE maqh = '${maqh}'`);

        res.json({
            result_district,
            result_ward
        })
    } catch (e) {
        console.log(e);
    }
}

// thêm đại chỉ giao hàng
const addAddress = async (req, res) => {
    upload(req, res, async () => {
        const {id_user} = req.query;
        const {name_receiver, number_phone_receiver, optionMatp, optionMaqh, optionMapx, detail_address} = req.body;

        const result_city = await query1(`SELECT name FROM devvn_tinhthanhpho WHERE matp = '${optionMatp}'`)
        const result_district = await query1(`SELECT name FROM devvn_quanhuyen WHERE maqh = '${optionMaqh}'`);
        const result_ward = await query1(`SELECT name FROM devvn_xaphuongthitran WHERE xaid = '${optionMapx}'`);

        const insertAddress = await query(`INSERT INTO address (id, id_of_user, chosen, name_receiver, number_receiver, city_receiver, district_receiver, ward_receiver, detail_address) VALUES (null , '${id_user}', '0','${name_receiver}', '${number_phone_receiver}', '${result_city[0].name}', '${result_district[0].name}', '${result_ward[0].name}','${detail_address}')`);
    })
}

// lấy danh sách địa chỉ
const getAddress = async (req, res) => {
    const {id_user} = req.query;
    const result_address = await query(`SELECT * FROM address WHERE id_of_user = '${id_user}'`);
    res.json({
        result_address
    })
}

const getProductFromCart = async (req, res) => {
    try {

    } catch (e) {
        console.error(e);
    }
}

const pageProductConfirm = async (req, res) => {
    try {
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        // current year
        let year = date_ob.getFullYear();
        let timeFull = "Ngày " + date + " tháng " + month + ", " + year;

        const {id_user, id_address} = req.query;
        const result_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
        const result_productFromCart = await query(`SELECT * FROM cart WHERE id_of_user = '${id_user}'`);
        const result_address = await query(`SELECT * FROM address WHERE id = '${id_address}'`);
        const name_user = result_account[0].name_user;
        const detail_address = result_address[0].detail_address;
        let totalMoney = 0;
        result_productFromCart.map(async (data) => {
            const add_confirm = await query(`INSERT INTO confirm_product (id, id_of_user, id_of_product, id_of_address, numbers, name_product, cost, detail_address,date_confirm,status_order) VALUES (null, '${id_user}', '${data.id_of_product}', '${id_address}','${data.numbers}', '${data.name_product}', '${data.cost}', '${detail_address}','${timeFull}','Chờ xác nhận')`);
        })
        const delete_cart = await query(`DELETE FROM cart WHERE id_of_user = '${id_user}'`);
        const result_productConfirm = await query(`SELECT * FROM confirm_product WHERE id_of_user = '${id_user}'`);
        result_productConfirm.map((data) => {
            totalMoney += parseFloat(data.cost) * parseFloat(data.numbers);
        })
        res.render('user/product_confirm', {result_productConfirm, result_account, id_user, totalMoney});
    } catch (e) {
        console.error(e);
    }
}

// trang thanh toán
const pageTrackOder = async (req, res) => {
    const id_user = req.query.id_user;
    const result_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
    const result_productConfirm = await query(`SELECT * FROM confirm_product WHERE id_of_user = '${id_user}'`);
    let totalMoney = 0;
    result_productConfirm.map((data) => {
        totalMoney += parseFloat(data.cost) * parseFloat(data.numbers);
    })
    res.render('user/track_order', {result_account, result_productConfirm, id_user, totalMoney});

}

// cập nhật số lượng sản phẩm
const updateNumbersProduct = async (req, res) => {
    try {
        const {id_product, id_cart} = req.query;
        const {original} = req.body;
        const updateNumbersProduct = await query(`UPDATE cart SET numbers = '${original}' WHERE id_of_product = '${id_product}'`);
        await res.json({
            msg: 'ok'
        })
    } catch (e) {
        console.error(e);
    }
}

// chọn địa chỉ mặc định
const chooseAddress = async (req, res) => {
    try {
        const {id_user, id_address} = req.query;
        const check_address_default = await query(`SELECT 1 AS v FROM address WHERE id_of_user = '${id_user}' AND chosen = '1'`);
        if (check_address_default[0] == undefined) {
            const updateChooseAddress = await query(`UPDATE address SET chosen = '1' WHERE id_of_user = '${id_user}' AND id = '${id_address}'`);
            await res.json({
                msg: 'ok'
            })
        }
        if (check_address_default[0].v == 1) {
            const address_default = await query(`SELECT * FROM address WHERE id_of_user = '${id_user}' AND chosen = '1'`);
            const id_address_default = address_default[0].id;
            const reset_address_default = await query(`UPDATE address SET chosen = '0' WHERE id = '${id_address_default}'`);
            const result_address_default = await query(`UPDATE address SET chosen = '1' WHERE id = '${id_address}'`);
            await res.json({
                msg: 'ok1'
            })
        }
    } catch (e) {
        console.error(e);
    }
}

const useJson = async (req, res) => {
    try {
        const {id_user} = req.query;
        const result_address = await query(`SELECT * FROM address WHERE id_of_user = '${id_user}' AND chosen = '1'`);
        await res.json({result_address});
    } catch (e) {
        console.error(e);
    }
}

// trang địa chỉ
const pageAddress = async (req, res) => {
    try {
        const id_user = req.query.id_user;
        const result_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
        const result_province = await query1(`SELECT * FROM devvn_tinhthanhpho`);
        const result_address = await query(`SELECT * FROM address WHERE id_of_user = '${id_user}'`);

        res.render(`user/address`, {id_user, result_account, result_province, result_address});
    } catch (e) {
        console.error(e);
    }
}


// ********************************************************************************************************************

module.exports = {
    loadLogin, homeUser, pageCart, profile_user, getDataProvince, addCart, addComment, deleteProductFromCart, addReplyComment,
    sumCost, viewProductByCategory_user, searchProduct, pageTrackOder, getReplyComment, registerAccountUser,
    loginAccountUser, searchProductByMoney, insertNumberPageToCookie, detailProduct_User,
    pagination, addAddress, getAddress, useJson, getProductFromCart, pageProductConfirm, updateNumbersProduct,
    chooseAddress, pageAddress
}