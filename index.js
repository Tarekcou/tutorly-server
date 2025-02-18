const express = require("express");
const cors = require("cors");
const ck = require("ckey");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const ports = process.env.PORT || 5005;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://online-tutor-2c707.firebaseapp.com",
    ],
    credentials: true,
  }))
// app.use(cors());

app.use(express.json());
app.use(cookieParser());
const verifyToken = (req, res, next) => {
  const token = req.cookie?.token;
  console.log(token);
  if (!token) return res.status(401).send({ message: "unauthorized access" });

  jwt.verify(token, ck.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: "invalid token" });
    req.user = decoded;
    next();
  });
};
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

    app.post("/jwt", (req, res) => {
      const user = req.body;
      // console.log(user);
      // console.log(ck.ACCESS_TOKEN_SECRET);
      const token = jwt.sign(user, ck.ACCESS_TOKEN_SECRET, { expiresIn: "5h" });
      // console.log(token);
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          // expires: new Date(Date.now() + 5*60*100s0) });
        })
        .send({ success: true });
      // return res.status(200).json({ success: true });
    });
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

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
      console.log(req);
      // if (req.user.email !== req.query.email) {
      //   return res.status(403).send({ message: "forbidded  access" });
      // }
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
      const id2 = req.body;
      // console.log(id, id2.reviewId);
      const query = { _id: new ObjectId(id) };
      // console.log(query2);

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
      const filter2 = { _id: new ObjectId(id2.reviewId) };

      console.log(filter, filter2);
      const updateTutor = {
        $set: {
          review: newCount,
        },
      };
      // console.log(updateTutor);
      const updateResult = await tutorCollection.updateOne(filter, updateTutor);
      const updateResult2 = await bookedTutorCollection.updateOne(
        filter2,
        updateTutor
      );
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
