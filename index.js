const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();

// payment for stripe
const stripe = require('stripe')('sk_test_51Io76EFe9X02hyfxekpLXBLSGlNGu7IgPMBC0iI4akbawAtMr47vtwrmhi6hFgimTNDv0oT3gmUIduleJCYnNun700GqLD1XsA');

//middleware
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xetzjun.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        const productsCollections = client.db('classified').collection('products');
        const usersCollections = client.db('classified').collection('users');
        const categoryCollections = client.db('classified').collection('categories');
        const bookingsCollections = client.db('classified').collection('bookings');
        const paymentsCollection = client.db('classified').collection('payments');
        const wishlistCollection = client.db('classified').collection('wishlist');
        // console.log(productsCollections);



        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = await usersCollections.find(query).toArray();
            res.send(cursor);
        });

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollections.deleteOne(filter);
            res.send(result);
        });



        app.get('/products/:categoryId', async (req, res) => {
            const categoryId = req.params.categoryId;
            const query = { categoryId };
            const product = await productsCollections.find(query).toArray();
            res.send(product);
        });
        // app.get('/products/:categoryId', async (req, res) => {
        //     const categoryId = req.params.categoryId;
        //     const query = { categoryId };
        //     const product = await productsCollections.find(query).toArray();
        //     res.send(product);
        // });
        app.get('/allproducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollections.findOne(query);
            res.send(product);
        });


        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productsCollections.find(query);
            const service = await cursor.toArray();
            // if (service.length === 0) {
            //     res.send('No service were added')
            // }
            res.send(service);
        });

        app.get('/categories', async (req, res) => {
            const query = {};
            const result = await categoryCollections.find(query).toArray();
            res.send(result);
        });
        // app.get('categories/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await cate.findOne(query);
        //     res.send(result);
        // });

        app.post('/categories', async (req, res) => {
            const category = req.body;
            const result = await categoryCollections.insertOne(category);
            res.send(result);
        });


        app.get('/categories/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category };
            const allCategory = await productsCollections.find(query).toArray();
            res.send(allCategory);

        });

        // for sellers
        app.get('/users/seller', async (req, res) => {
            const query = { role: 'Seller' };
            const user = await usersCollections.find(query).toArray();
            res.send(user);
        });
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollections.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' });
        });

        // for buyer
        app.get('/users/buyer', async (req, res) => {
            const query = { role: 'Buyer' };
            const user = await usersCollections.find(query).toArray();
            res.send(user);
        });
        // for admin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollections.findOne(query);
            res.send({ isAdmin: user?.role === 'Admin' });
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            res.send(result);
        });

        // for making admin 
        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'Admin'
                }
            };
            const result = await usersCollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
            res.send(result);
        });

        app.delete('/allproducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productsCollections.deleteOne(filter);
            res.send(result);
        });

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const booking = { _id: ObjectId(id) };
            const result = await bookingsCollections.findOne(booking);
            res.send(result);
        });

        app.get('/bookings', async (req, res) => {
            const query = {};
            const result = await bookingsCollections.find(query).toArray();
            res.send(result);
        });


        app.post('/bookings', async (req, res) => {
            const product = req.body;
            const result = await bookingsCollections.insertOne(product);
            res.send(result);
        });

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const productprice = booking.productprice;
            const amount = productprice * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                'payment_method_types': [
                    'card'
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret
            });

        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId

                }
            };
            const updatedResult = await bookingsCollections.updateOne(filter, updatedDoc);
            res.send({ result, updatedResult });
        });

        app.get('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const wishlist = { _id: ObjectId(id) };
            const result = await wishlistCollection.findOne(wishlist);
            res.send(result);
        });

        app.get('/wishlist', async (req, res) => {
            const query = {};
            const wishlist = await wishlistCollection.find(query).toArray();
            res.send(wishlist);
        });

        app.post('/wishlist', async (req, res) => {
            const wishlist = req.body;
            const result = await wishlistCollection.insertOne(wishlist);
            res.send(result);
        });


    }
    finally {

    }

}
run().catch(error => console.error(error));


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});