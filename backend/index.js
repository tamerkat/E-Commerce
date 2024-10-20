const express = require('express')
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const { error, log } = require('console')
const { type } = require('os')

app.use(express.json())
app.use(cors())



// DataBase Conection using mongo
require('dotenv').config();



// connectToDatabase();
mongoose.connect("mongodb+srv://tamerkat:007007@cluster0.o4jhs.mongodb.net/product")




// image storage engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({ storage: storage })



// Api Creation
app.get('/', (req, res) => {
    res.send('express app is running')
})

// creating Upload Endpoint for images
app.use('./images', express.static('upload/images'))
app.post('/upload', upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})



// schema for greating product
const Product = mongoose.model('Product',{
    id:{
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true,
    },
    new_price:{
        type: Number,
        required: true,
    },
    old_price:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now
    },
    avilable:{
        type: Boolean,
        default: true
    },
})

// api add product
app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }else{
        id = 1;
    }

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    try {
        await product.save();
        console.log('Saved product:', product);
        res.json({
            success: true,
            product: product,
        });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: 'Failed to save product' });
    }
})



// api del product
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({id:req.body.id})
    console.log("Removed")
    res.json({
        success: true,
        name: req.body.name,
    })
})




//  api for getall products
app.get('/allproduct', async (req, res) => {
    let products = await Product.find({});
    console.log('allproduct fetched')
    res.send(products)
})



// run server
const port = 4000;
app.listen(port, (error) => {
    if (!error){
        console.log(`Server running on port ${port}`)
    }else{
        console.log(`Error ${error}`)
    }
})