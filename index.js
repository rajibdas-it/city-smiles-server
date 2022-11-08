const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("city smiles server running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fe8xrlp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const servicesCollection = client.db("citySmiles").collection("services");
    const reviewCollection = client.db("citySmiles").collection("review");

    app.get("/limited-service", async (req, res) => {
      const query = {};
      const size = parseInt(req.query.size);
      const cursor = servicesCollection.find(query);
      const result = await cursor.limit(size).toArray();
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    app.get("/all-reviews", async (req, res) => {
      const sId = req.query.sId;
      // console.log(sId);
      const query = { serviceId: sId };
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();

      res.send({
        success: true,
        result: result,
      });
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log("server running on port", port);
});
