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
app.use('/images', express.static('upload/images')); // Correct the path here

app.post('/upload', upload.single('product'), (req, res) => {
    // Check if the file is uploaded correctly
    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'File upload failed' });
    }

    // Respond with success and the image URL
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}` // Ensure the image URL is correct
    });
});



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
    })
    try {
        await product.save();
        console.log('Saved product:', product);
        res.json({
            success: true,
            name: req.body.name,
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
    res.send(products)
})



// shema creating for user model
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

// api for user registration
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({email: req.body.email});
    if (check) {
        return res.status(400).json({
            success: false,
            errors: 'existing user found with same email address'
        })
    }
    let cart = {}
    for (let i = 0; i < 300; i++) {
        cart[i] = 0
    }
    const user = new Users({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })
    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecom')
    res.json({
        success: true,
        token
    })
})



// creating end point 
app.post('/login', async (req, res) => {
    let user = await Users.findOne({email: req.body.email})
    if (user) {
        const isMatch = req.body.password === user.password
        if (isMatch) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom')
            res.json({
                success: true,
                token
            })
        }
        else {
            res.json({
                success: false,
                errors: 'Invalid password',
            })
        }
    }
    else {
        res.json({
            success: false,
            errors: 'Invalid Email Id',
        })
    }
})




// creating End point new collectiom
app.get('/newcollection', async (req, res) => {
    let products = await Product.find({})
    let newcollection = products.slice(1).slice(-8)
    res.send(newcollection)
})


// popular in women
app.get('/popular', async (req, res) => {
    let products = await Product.find({category: 'women'})
    let popular = products.slice(0, 4)
    res.send(popular)
})



// midleware
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({
            errors: 'please authenticate using valied token'
        })
    }
    else {
        try {
            const data = jwt.verify(token, 'secret_ecom')
            req.user = data.user
            next()
        } catch (error) {
            res.status(401).send({
                errors: 'please authenticate using a valied token'
            })
        }
    }
}




// certing addcart
app.post('/addcart', fetchUser, async (req, res) => {
    console.log('removed', req.body.itemId)

    let userData = await Users.findOne({_id: req.user.id})
    userData.cartData[req.body.itemId] += 1
    await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData})

    res.send("Added")
})



// remove product
app.post('/removecart', fetchUser, async (req, res) => {
    console.log('removed', req.body.itemId)
    let userData = await Users.findOne({_id: req.user.id})

    if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1
        await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData})
    }

    res.send("removed")
})



// get cart data
app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({_id: req.user.id})
    res.json(userData.cartData)
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