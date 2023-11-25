const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51Jw9GSII8bV4mbobMKaDxcVkAq9WVtEcugd724d2xSCSMUYQqe1qQHW0m0vYkM72c1tdHoGJTZHk0imIKyAAdJiU00NJy0yJTW"
);
const fileUpload = require("express-fileupload");

const app = express();
const port = process.env.PORT || 5000;

//middleaware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7s5ai.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("fragranceShop");

    //database collections
    const brandCollection = database.collection("fragrance-brand");
    const reviewsCollection = database.collection("fragrance-review");
    const purchaseCollection = database.collection("fragrance-purchase");
    const usersCollection = database.collection("fragrance-users");

    //POST API- Add brand
    app.post("/brands", async (req, res) => {
      // const name = req.body.name;
      // const desc = req.body.desc;
      // const price = req.body.price;
      // const pic = req.files.image;

      // const picData = pic.data;
      // const encodedPic = picData.toString('base64');
      // const imgBuffer = Buffer.from(encodedPic, 'base64');
      // const brandThumb = {
      //     name,
      //     desc,
      //     price,
      //     image: imgBuffer
      // };
      // const brand = await brandCollection.insertOne(brandThumb);
      const brand = await brandCollection.insertOne(req.body);
      res.json(brand);
      res.json(brand);
    });

    //GET brand api
    app.get("/brands", async (req, res) => {
      const brands = await brandCollection.find({}).toArray();
      res.send(brands);
    });

    //GET API - Product details
    app.get("/brands/:id", async (req, res) => {
      const productDetails = await brandCollection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.send(productDetails);
      console.log(productDetails);
    });

    //Delete API - product brand

    app.delete("/brands/:id", async (req, res) => {
      const deletedProduct = await brandCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.json(deletedProduct);
    });

    //POST API- Add review
    app.post("/reviews", async (req, res) => {
      const review = await reviewsCollection.insertOne(req.body);
      res.json(review);
    });

    //GET API - reviews
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewsCollection.find({}).toArray();
      res.send(reviews);
    });

    //POST API- Purchase products

    app.post("/orders", async (req, res) => {
      const orders = await purchaseCollection.insertOne(req.body);
      res.json(orders);
    });

    //GET API - orders
    app.get("/orders", async (req, res) => {
      const order = await purchaseCollection.find({}).toArray();
      res.send(order);
    });

    //
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.findOne(query);
      res.json(result);
    });

    //UPDATE API - booking orders status property
    app.put("/orders/:id", async (req, res) => {
      const order = req.body;
      const options = { upsert: true };
      const updatedOrder = {
        $set: { status: order.status, payment: order },
      };
      const updateStatus = await purchaseCollection.updateOne(
        { _id: ObjectId(req.params.id) },
        updatedOrder,
        options
      );

      res.json(updateStatus);
    });

    //Delete API - order

    app.delete("/orders/:id", async (req, res) => {
      const deletedOrder = await purchaseCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.json(deletedOrder);
    });

    //POST API- users
    app.post("/users", async (req, res) => {
      const user = await usersCollection.insertOne(req.body);
      console.log(user);
      res.json(user);
    });

    // UPDATE API - users

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateUser = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.json(result);
    });

    // UPDATE API- update users role

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //GET API- users

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      console.log(isAdmin);
      res.json({ admin: isAdmin });
    });

    //
    app.post("/create-payment-intent", async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    });
  } finally {
    //await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" server is running");
});

app.listen(port, () => {
  console.log("server running at port", port);
});
