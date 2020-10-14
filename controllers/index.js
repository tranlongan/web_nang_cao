const connection = require('../db');

const loadCategoryAndLoadHome = function (req, res, next) {
    const sql = 'SELECT * FROM `danh_muc`';
    connection.query(sql, (err, result, fields) => {
        console.log(result.name_category)
        res.render('index', {result})
    });
}

const addCategory = (req, res, next) => {
    const value1 = res.json({output: req.params.name_category});
    const sql = "INSERT INTO danh_muc value (" + value1 + ")";
    connection.query(sql,(err, result, fields)=>{
        res.render('index', {title: 'Data Saved',
        message:'Data Saved successfully.'})
    });
};

// const addCategory = (req, res, next)=>{
//     const sql = 'INSERT INTO danh_muc (name_category) value (name_category)';
//     connection.query(sql,(err, result, fields)=>{
//         res.render('index')
//     })
// }

module.exports = {
    loadCategoryAndLoadHome,
    addCategory
}