const express = require('express');
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json())

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    });
}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.35l3b.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        const partsCollection = client.db("bicycleverse").collection("parts");
        const reviewsCollection = client.db("bicycleverse").collection("reviews");
        const ordersCollection = client.db("bicycleverse").collection("orders");

        app.get('/parts', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            let result;

            if (page || size) {
                result = await partsCollection.find().skip(page * size).limit(size).toArray();
            }
            else {
                result = await partsCollection.find().toArray();
            }
            res.send(result)
        });

        app.get('/partscount', async (req, res) => {
            const count = await partsCollection.countDocuments();
            res.send({ count });
        })

        app.get('/featured', async (req, res) => {
            const featuredParts = await partsCollection.find({ featured: true }).toArray();
            res.send(featuredParts)
        })

        app.get('/partsCollection', async (req, res) => {
            const category = req.query.category;
            const categoryParts = await partsCollection.find({ category: category }).toArray();
            res.send(categoryParts);

        })

        app.get('/part/:id', async (req, res) => {
            const id = req.params.id;
            const result = await partsCollection.findOne({ _id: ObjectId(id) });
            res.send(result);
        })

        app.put('/part/:id', async (req, res) => {
            const id = req.params.id;
            const newStock = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    stock: newStock
                }
            }
            const result = await partsCollection.updateOne(filter, updateDoc, { upsert: true })
        })

        app.get('/orders', async (req, res) => {
            const result = await ordersCollection.find().toArray();
            res.send(result);
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })

    }
    finally {

    }

}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('BicycleVerse is running');
})

app.listen(port, () => {
    console.log('Listening to port', port);
})