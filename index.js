const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express()

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.kcgiuct.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const collegesCollection = client.db("EduVenueDB").collection("colleges");
        const usersCollection = client.db("EduVenueDB").collection("users");
        const ratingsCollection = client.db("EduVenueDB").collection("ratings");
        const admittedUsersCollection = client.db("EduVenueDB").collection("admitted_users");

        app.get('/colleges', async (req, res) => {
            const name = req.query.name;
            console.log(name);
            let result = null;
            if (name) {
                const reg = new RegExp(name, 'i')
                const query = { name: { $regex: reg } };
                result = await collegesCollection.find(query).toArray();
            }
            else {
                result = await collegesCollection.find().toArray();
            }
            res.send(result)
        })

        app.get('/colleges/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await collegesCollection.findOne(query);
            // console.log(result)
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            // console.log(existingUser)
            if (existingUser) {
                return res.send({ message: "user already exists" });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        // app.get('/users', async (req, res) => {
        //     const result = await usersCollection.find();
        //     res.send(result)
        // })

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })

        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const details = req.body;
            // console.log(email, details);
            const filter = { email: email };
            const updateDoc = {
                $set: {
                    name: details.name,
                    email: details.email,
                    address: details.address,
                    university: details.university
                },
            }
            const options = { upsert: true };
            // const result = await usersCollection.findOne(query);
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.get("/admitted_users", async(req, res) => {
            const result = await admittedUsersCollection.find().toArray();
            res.send(result)
        })
        
        app.put('/admitted_users/:email', async (req, res) => {
            const email = req.params.email;
            const details = req.body;
            // console.log(email, details);
            const filter = { email: email };
            const updateDoc = {
                $set: {
                    name: details.name,
                    subject: details.subject,
                    email: details.email,
                    phone: details.phone,
                    address: details.address,
                    birth_date: details.birth_date
                },
            }
            const options = { upsert: true };
            // const result = await usersCollection.findOne(query);
            const result = await admittedUsersCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.get('/ratings', async (req, res) => {
            const result = await ratingsCollection.find().toArray();
            // console.log(result)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("server is running")
})

app.listen(port, () => {
    console.log('running on', port)
})