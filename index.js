const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();



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
        // console.log(productsCollections);


        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = await usersCollections.find(query).toArray();
            res.send(cursor);
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
        app.get('/products/:id', async (req, res) => {
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

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            res.send(result);
        });

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
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


    }
    finally {

    }

}
run().catch(error => console.error(error));


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});