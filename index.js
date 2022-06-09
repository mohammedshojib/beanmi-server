const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.lm3uy.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//<===== Verify Auth ====>

function verifyAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).send({ message: "unauthorize" });
  }
  const token = auth.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "details not verified" });
    }
    req.decoded = decoded;
    next();
  });
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});
async function run() {
  try {
    await client.connect();

    const userCollection = client.db("Beanmi").collection("users");
    const ordersCollection = client.db("Beanmi").collection("orders");
    const courseCollection = client.db("Beanmi").collection("course");
    const videosCollection = client.db("Beanmi").collection("videos");

    //<===== AUTH ====>

    app.post("/login", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send(token);
    });
    // <<===ALL Orders===>

    app.get("/users", verifyAuth, async (req, res) => {
      const query = {};
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });
    // <<===ALL Orders===>

    app.get("/orders", verifyAuth, async (req, res) => {
      const query = {};
      const orders = await ordersCollection.find(query).toArray();
      res.send(orders);
    });
    // <<===ALL Orders===>

    app.get("/videos", async (req, res) => {
      const query = {};
      const videos = await videosCollection.find(query).toArray();
      res.send(videos);
    });
    // <<<=====add money=====>>>
    app.put("/update/:email", async (req, res) => {
      const email = req.params.email;
      const balance = req.body.balance;
      const filter = await userCollection.findOne({ email: email });
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          balance,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    app.put("/updatedata/:email", async (req, res) => {
      const email = req.params.email;
      const updatedData = req.body.updatedData;
      console.log(updatedData);
      const filter = await userCollection.findOne({ email: email });
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          updatedData,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //<===== MY Users ====>
    app.get("/usersdata/:email", async (req, res) => {
      const email = req.params;
      console.log(email);
      const filter = await userCollection.find({ email: email });
      console.log(filter);
      res.send(filter);
    });

    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne({ orders });
      res.send(result);
    });

    // <<===set user===>
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    // <<<< order DELETE  >>>>>

    app.delete("/deleteo/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderColection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

run().catch(console.dir);
