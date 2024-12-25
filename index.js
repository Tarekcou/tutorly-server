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
    const tutorCollection = database.collection("tutor");
    const bookedTutorCollection = database.collection("bookedTutor");
    app.get("/tutorials", async (req, res) => {
      const cursor = tutorCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/tutorials/:language", async (req, res) => {
      const language = req.params.language;
      // console.log("language: " + language);
      const query = { language: language };
      const option = { upsert: false };
      const cursor = tutorCollection.find(query, option);
      // console.log(cursor);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });
    app.get("/cartItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: false };
      const cursor = tutorCollection.find(query, option);
      // (cursor);
      const result = await cursor.toArray();
      result;
      res.send(result);
    });
    app.get("/myTutorials/:myEmail", async (req, res) => {
      const myEmail = req.params.myEmail;
      const query = { email: myEmail };
      const cursor = tutorCollection.find(query);
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });
    app.get("/booked-tutors/:myEmail", async (req, res) => {
      const myEmail = req.params.myEmail;
      const query = { email: myEmail };
      const cursor = bookedTutorCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tutorCollection.findOne(query);

      res.send(result);
    });
    app.post("/add-tutorials", async (req, res) => {
      const product = req.body;
      // (product);
      const result = await tutorCollection.insertOne(product);
      res.send(result);
    });

    app.post("/add-booked-tutorials", async (req, res) => {
      const tutorial = req.body;
      // (product);
      const result = await bookedTutorCollection.insertOne(tutorial);
      // const id = tutorial.tutorId;
      // const query = { _id: new ObjectId(id) };
      // const tutor = tutorCollection.findOne(query);
      // const newCount = 0;
      // if (tutor.tutorCount) {
      //   newCount = tutor.tutorCount + 1;
      // } else {
      //   newCount = 1;
      // }
      // // now update tutorCollection
      // const filter = { _id: new ObjectId(id) };
      // const updateTutor = {
      //   $set: {
      //     tutorCount: newCount,
      //   },
      // };
      // const updateResult = await tutorCollection.updateOne(filter, updateTutor);
      res.send(result);
    });

    // Increment the review count for a specific tutor
    app.post("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tutor = await tutorCollection.findOne(query);
      // console.log(id, tutor);
      let newCount = 0;
      if (tutor.review) {
        newCount = parseInt(tutor.review) + 1;
        console.log(newCount);
      } else {
        newCount = 1;
      }
      // now update tutorCollection
      const filter = { _id: new ObjectId(id) };
      const updateTutor = {
        $set: {
          review: newCount,
        },
      };
      // console.log(updateTutor);
      const updateResult = await tutorCollection.updateOne(filter, updateTutor);
      console.log(updateResult);
    });
    app.delete("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tutorCollection.deleteOne(query);
      // console.log(result);
      res.send(result);
    });
    // Update product
    app.put("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const option = { upsert: false };
      const updateTutorials = req.body;
      // console.log(updateTutorials);
      const newTutorials = {
        $set: {
          image: updateTutorials.image,
          country: updateTutorials.country,
          rating: updateTutorials.rating,
          price: updateTutorials.price,
          language: updateTutorials.language,

          description: updateTutorials.description,
        },
      };

      const result = await tutorCollection.updateOne(
        query,
        newTutorials,
        option
      );
      console.log(result);
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
