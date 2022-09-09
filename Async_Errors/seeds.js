// This file is used when I want to populate the 'farmStand' DB w/ docs
const mongoose = require('mongoose');

// Imports over the Product model we need
const Product = require('./models/product');

main().catch(err => console.log(err));

async function main() {
    // The URI (uniform resource identifier) below identifies where to find MongoDB locally on my PC and which DB to use, 'farmStand' DB
    await mongoose.connect('mongodb://localhost:27017/farmStand2');

    // Commenting out docs that have already been added to avoid dupes
    /*
    const p = new Product({
        name: 'Grapefruit',
        price: 1.99,
        category: 'fruit'
    })
    p.save()
        .then(p => {
            console.log(p);
        })
        .catch(e => {
            console.log(e);
        })

    const seedProducts = [
        {
            name: 'Fairy Eggplant',
            price: 1.00,
            category: 'vegetable'
        },
        {
            name: 'Organic Goddess Melon',
            price: 4.99,
            category: 'fruit'
        },
        {
            name: 'Organic Mini Seedless Watermelon',
            price: 3.99,
            category: 'fruit'
        },
        {
            name: 'Organic Celery',
            price: 1.50,
            category: 'vegetable'
        },
        {
            name: 'Chocolate Whole Milk',
            price: 2.69,
            category: 'dairy'
        },
    ]
    Product.insertMany(seedProducts)
        .then(res => {
            console.log(res);
        })
        .catch(e => {
            console.log(e);
        })
    */
}