const express = require("express");
const cors = require("cors");
const ck = require("ckey");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const ports = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());
// console.log(ck.DB_USER + ": " + ck.DB_PASS);

const uri = `mongodb+srv://${ck.DB_USER}:${ck.DB_PASS}@cluster0.ufb0a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const database = client.db("tutorDB");
    const productCollection = database.collection("tutor");
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/category/:categoryName", async (req, res) => {
      const categoryName = req.params.categoryName;
      const query = { categoryName: categoryName };
      const option = { upsert: false };
      const cursor = productCollection.find(query, option);
      // (cursor);
      const result = await cursor.toArray();
      // (result);
      res.send(result);
    });
    app.get("/cartItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: false };
      const cursor = productCollection.find(query, option);
      // (cursor);
      const result = await cursor.toArray();
      result;
      res.send(result);
    });
    app.get("/myEquipment/:myEmail", async (req, res) => {
      const myEmail = req.params.myEmail;
      const query = { email: myEmail };
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);

      res.send(result);
    });
    app.post("/add-product", async (req, res) => {
      const product = req.body;
      // (product);
      const result = await productCollection.insertOne(product);
      res.send(result);
    });
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      // console.log(result);
      res.send(result);
    });
    // Update product
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      // (id);

      const query = { _id: new ObjectId(id) };
      const option = { upsert: false };
      const updateProduct = req.body;
      // (updateProduct);
      const newProduct = {
        $set: {
          imageUrl: updateProduct.imageUrl,
          itemName: updateProduct.itemName,
          categoryName: updateProduct.categoryName,
          description: updateProduct.description,
          originalPrice: updateProduct.originalPrice,
          discountedPrice: updateProduct.discountedPrice,
          discountPercentage: updateProduct.discountPercentage,

          rating: updateProduct.rating,
          customization: updateProduct.customization,
          processingTime: updateProduct.processingTime,
          stockStatus: updateProduct.stockStatus,
          stockItem: updateProduct.stockItem,
        },
      };
      newProduct;

      const result = await productCollection.updateOne(
        query,
        newProduct,
        option
      );
      // (result);
      res.send(result);
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(ports, () => {
  `Server is running on port ${ports}`;
});
