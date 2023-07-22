
var http = require('http');
var fs = require('fs');
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Product = require('./models/products');
const app = express();

app.set('view engine', 'ejs');



// Thiết lập lưu trữ file ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Kết nối tới MongoDB
mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// API để lưu sản phẩm vào MongoDB
app.post('/products', upload.single('image'), async function (req, res) {
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        color: req.body.color,
    });
    try {
        await product.save();
        console.log('Product saved to MongoDB');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});
// Route để hiển thị danh sách sản phẩm
app.get('/', function (req, res) {
    Product.find({})
        .then(products => {
            res.render('Products', { products: products });
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal server error');
        });
});

// Xóa sản phẩm bằng phương thức DELETE
app.delete('/products/:id', function (req, res) {
    const id = req.params.id;
    Product.findByIdAndRemove(id)
      .then(() => {
        console.log(`Product ${id} deleted`);
        res.sendStatus(204);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Internal server error');
      });
  });

  


app.listen(8000, function () {
    console.log('Server started on port 8000');
});