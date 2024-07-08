const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.ku98crh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();


    //Create
    const spotCollection = client.db('spotDB').collection('spot');

    app.post('/spot', async (req, res) => {
      const newSpot = req.body;
      console.log(newSpot);
      const result = await spotCollection.insertOne(newSpot);
      res.send(result);
    })


    //Read
    app.get('/spot', async (req, res) => {
      const cursor = spotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    
    //Delete
    app.delete('/spot/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await spotCollection.deleteOne(query);
      res.send(result);
    })


    //Update
    app.get('/spot/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await spotCollection.findOne(query);
      res.send(result);
    })

    app.put('/spot/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = {upsert: true };
      const updatedPage = req.body;

      const spots = {
        $set: {
          spot: updatedPage.spot,
          photo: updatedPage.photo,
          supplier: updatedPage.supplier,
          country: updatedPage.country,
          location: updatedPage.location,
          description: updatedPage.description,
          seasonality: updatedPage.seasonality,
          time: updatedPage.time,
          visitors: updatedPage.visitors
        }
      }
      const result = await spotCollection.updateOne(filter, spots, options);
      res.send(result)
    })


    const countryCollection = client.db('spotDB').collection('countries');

    app.get('/countries', async(req, res)=>{
      const cursor = countryCollection.find();
      const result = await cursor.toArray();
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



app.get('/', (rew, res) => {
  res.send('trip-voyage is running')
})
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})