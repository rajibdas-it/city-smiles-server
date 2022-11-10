const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  // console.log(process.env.USER_TOKEN);
  res.send("city smiles server running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fe8xrlp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.USER_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });

  // console.log("inside verifyJWT function", req.headers);
  //  const authHeader = req.headers["authorization"];
}

async function run() {
  try {
    const servicesCollection = client.db("citySmiles").collection("services");
    const reviewCollection = client.db("citySmiles").collection("review");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.USER_TOKEN, {
        expiresIn: "1h",
      });
      // console.log(token);
      res.send({ token });
    });
    app.post("/add-services", verifyJWT, async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });
    app.get("/limited-service", async (req, res) => {
      const query = {};
      const size = parseInt(req.query.size);
      const cursor = servicesCollection.find(query);
      const result = await cursor.limit(size).sort({ date: -1 }).toArray();
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const result = await cursor.sort({ date: -1 }).toArray();
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
      const result = await cursor.sort({ date: -1 }).toArray();
      res.send({
        success: true,
        result: result,
      });
    });
    app.get("/reviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      // console.log("email after decoded", decoded);
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }
      const query = { email: req.query.email };
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });
    app.patch("/reviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const newReview = req.body;
      const updatedDoc = {
        $set: {
          phone: newReview.phone,
          ratings: newReview.ratings,
          comment: newReview.comment,
        },
      };
      const result = await reviewCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    app.delete("/reviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log("server running on port", port);
});

module.exports = app;
