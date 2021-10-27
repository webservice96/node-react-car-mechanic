import express from 'express';
import cors from 'cors';
import mongodb from 'mongodb';
import dotenv from "dotenv";
dotenv.config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kthq4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new mongodb.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json());

async function run() {
    try {
        await client.connect();
        const database = client.db("carMechanic");
        const servicesCollection = database.collection("services");

        /* GET API */
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        /* GET API - single post */
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: mongodb.ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        });

        /* POST API */
        app.post('/services', async (req, res) => {
            const newData = req.body;
            const result = await servicesCollection.insertOne(newData);
            res.json(result);
        });

        /* PUT API */
        app.put('/service/:id', async (req, res) => {
            const id = req.params.id;
            const updateService = req.body;
            const filter = { _id: mongodb.ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateService.name,
                    desc: updateService.desc,
                    price: updateService.price,
                    img: updateService.img
                },
            };
            const result = await servicesCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        /* DELETE API */
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: mongodb.ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        });


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Mongodn');
});

app.get('/hello', (req, res) => {
    res.send('Hello API TEXT');
});

app.listen(PORT);