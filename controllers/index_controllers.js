const connection = require('../db');
const multer = require('multer');
const path = require('path');
var ejs = require('ejs');


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


// load lại home và phần danh mục
const loadCategoryAndHome = function (req, res, next) {
    const sql = `SELECT * FROM danh_muc`;
    connection.query(sql, (err, result, fields) => {
        console.log(result)
        res.render('index', {result})
    });
};

// thêm danh mục
const addCategory = (req, res, next) => {
    const {name_category} = req.body;
    const sql = `INSERT INTO danh_muc (id, name_category) VALUES (NULL, '${[name_category]}')`;
    connection.query(sql, (err) => {
        if (err) throw err
        res.send("<script type='text/javascript'>alert('Thêm danh mục thành công'); window.open('/', '_self');</script>")
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
                const {id_of_category, name_product, cost_product,description} = req.body;
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
const viewAllProduct = (req, res, next ) =>{
    const sql1 = `SELECT * FROM danh_muc`;
    const sql2 = `SELECT * FROM san_pham`;
    // sql bảng danh mục
    connection.query(sql1, (err,result1)=>{
        // sql bảng sản phẩm
        connection.query(sql2, (err,result2)=>{
            res.render('viewAllProduct',{result1, result2});
        })
    })


}

const viewDetailProduct = (req, res, next) =>{
    let id = req.query.id;
    const sql1 = `SELECT * FROM danh_muc`;
    const sql2 = `SELECT * FROM san_pham`;
    const sql3 = `SELECT * FROM san_pham WHERE id = '${id}'`;

    connection.query(sql1, (err, result1)=>{
        connection.query(sql2, (err, result2)=>{
            connection.query(sql3,(err, result3)=>{
                if (err) throw err
                res.render('viewDetailProduct', {result1,result2,result3})
            })
        })
    })
}

module.exports = {
    loadCategoryAndHome,
    addCategory,
    addProduct,
    viewAllProduct,
    viewDetailProduct
}