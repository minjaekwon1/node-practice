const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const AppError = require('./AppError');

// Imports over the Product model we need
const Product = require('./models/product');
const req = require('express/lib/request');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Required Middleware for this project
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

main().catch(err => console.log(err));

async function main() {
    // The URI (uniform resource identifier) below identifies where to find MongoDB locally on my PC and which DB to use, 'farmStand' DB
    await mongoose.connect('mongodb://localhost:27017/farmStand2');

    ///////////////////////////// READING /////////////////////////////

    // Lists out all the docs stored in the 'products' collec 
    //// the 'wrapAsync' func rets a func after calling the async func that is passed in, mimicking the try/catch block
    app.get('/products', wrapAsync(async (req, res) => {
        // When u add a query string to the URL (from 'show.ejs'), u can extract the val from the field in 'req.query' by specifying 'category'
        //// (EX) In '?category=fruit', the field is 'category' and the val is 'fruit'
        const { category } = req.query;
        if (category) {
            const products = await Product.find({ category });
            res.render('products/index', { products, category });
        } else {
            const products = await Product.find({});
            res.render('products/index', { products, category: 'All' });
        }
    }))

    ///////////////////////////// CREATING /////////////////////////////

    // This streamlines the process of adding new categories as new.ejs will just loop over this arr to list out the avail categories
    // Also makes editing/updating the docs smoother as you want the correct category already selected before editing
    const categories = ['fruit', 'vegetable', 'dairy'];

    // Can get to this URL thru a button on the './products' page
    // This will then render the webpage in './views/products/new.ejs'
    app.get('/products/new', (req, res) => {
        res.render('products/new', { categories });
    })

    // Processes the POST req sent by the form in 'new.ejs' and creates a new 'products' doc using the data in the form, then saves it to DB
    // Then redirects u to GET req below
    app.post('/products', async (req, res, next) => {
        try {
            const newProduct = new Product(req.body);
            await newProduct.save();
            res.redirect(`/products/${newProduct._id}`);
        } catch (e) {
            next(e); // Moves on to the err handler MW at the bottom
        }

    })

    // When an 'ObjectId' that is in the 'farmStand' DB is added to the URL after '/products/', this finds it using a Mongoose method & passes it into the file ('./views/products/show') being rendered
    app.get('/products/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);
            if (!product) {
                // Errs ret from async funcs invoked by route handlers and MW must be passed to 'next()' -> Express will catch/process them
                throw new AppError(404, 'Product Not Found');
            } else
                res.render('products/show', { product });
        } catch (e) {
            // The err thrown above is being passed into 'next()' here
            next(e);
        }
    })

    //////////////////////////// UPDATING ////////////////////////////

    // When the below str is added to the URL, it finds the doc w/ the specified id & renders the webpage in './views/products/edit.ejs' while sending the found doc and 'categories' arr for use in the file
    // The file contains a form that will be used to edit the docs
    app.get('/products/:id/edit', async (req, res, next) => {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            // Errs ret from async funcs invoked by route handlers and MW must be passed to 'next()' -> Express will catch/process them
            next(new AppError(404, 'Product Not Found'));
        } else
            res.render('products/edit', { product, categories });
    })

    // Processes the PUT req sent from './views/products/edit.ejs' thru method-override (as can only do GET & POST reqs normally)
    // This then updates the product's fields & redirects u to the updated version of the page thru the GET req
    app.put('/products/:id', wrapAsync(async (req, res, next) => {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
        res.redirect(`/products/${product._id}`);
    }))

    ///////////////////////////// DELETING /////////////////////////////

    // Processes the DELETE req sent from './views/products/show.ejs' thru a form
    // This del's the doc associated w/ the specified id and redirects u to the GET req for '/products'
    app.delete('/products/:id', async (req, res) => {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        res.redirect('/products');
    }
    )

    ///////////////////////////// ASYNC ERRORS /////////////////////////

    const handleValidationErr = err => {
        console.dir(err);
        return new AppError(400, `Validation Failed...${err.message}`);
    }

    // This prints out the name of the error generated by Express
    // Used to show we could specify how we handle errors
    app.use((err, req, res, next) => {
        console.log(err.name);
        if (err.name === 'ValidationError')
            err = handleValidationErr(err);
        next(err);
    })

    // This error handler is used whenever the app throws an error
    app.use((err, req, res, next) => {
        const { status = 500, message = 'Something went wrong' } = err;
        res.status(status).send(message);
    })

    // Rets a func after calling the async func that is passed in, mimicking the try/catch block
    function wrapAsync(fn) {
        return function (req, res, next) {
            fn(req, res, next).catch(e => next(e));
        }
    }

    app.listen(3000, () => {
        console.log('Listening on Port 3000');
    })
}
