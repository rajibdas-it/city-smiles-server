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
    // const service = {
    //   title: "service One",
    //   des: "services one",
    // };

    // const result = await servicesCollection.insertOne(service);
    // console.log(result);

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
    app.get("/service/:id", (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = servicesCollection.findOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log("server running on port", port);
});
