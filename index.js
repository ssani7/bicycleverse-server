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

        app.get('/parts', async (req, res) => {
            const result = await partsCollection.find().toArray();
            res.send(result)
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