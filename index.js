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
  })
);
// app.use(cors());

app.use(express.json());
app.use(cookieParser());
const verifyToken = (req, res, next) => {
  const token = req.cookie?.token;
  // console.log(token);
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
    const tutorialCollections = database.collection("tutorials");
    const bookedTutorCollection = database.collection("bookedTutor");
    const tutorCollections = database.collection("tutors");
    const usersCollection = database.collection("users");
    const reviewCollections = database.collection("reviews");

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
      const cursor = tutorialCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/tutorials/:language", async (req, res) => {
      const language = req.params.language;
      // console.log("language: " + language);
      const query = { language: language };
      const option = { upsert: false };
      const cursor = tutorialCollections.find(query, option);
      // console.log(cursor);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });
    app.get("/tutorials/email/:email", async (req, res) => {
      const myEmail = req.params.email;
      const query = { email: myEmail };
      const cursor = tutorialCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/cartItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: false };
      const cursor = tutorialCollections.find(query, option);
      const result = await cursor.toArray();
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
      const result = tutorialCollections.findOne(query);
      res.send(result);
    });
    app.post("/add-tutorials", async (req, res) => {
      const product = req.body;
      // (product);
      const result = tutorialCollections.insertOne(product);
      res.send(result);
    });

    app.post("/add-booked-tutorials", async (req, res) => {
      const tutorial = req.body;
      // (product);
      const result = await bookedTutorCollection.insertOne(tutorial);
      // const id = tutorial.tutorId;
      // const query = { _id: new ObjectId(id) };
      // const tutor =tutorialCollections.findOne(query);
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
      // const updateResult = awaittutorialCollections.updateOne(filter, updateTutor);
      res.send(result);
    });
    app.delete("/remove-booked-tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookedTutorCollection.deleteOne(query);
      // console.log(result);
      res.send(result);
    });

    // Increment the review count for a specific tutor
    // app.post("/review/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const id2 = req.body;
    //   // console.log(id, id2.reviewId);
    //   const query = { _id: new ObjectId(id) };
    //   // console.log(query2);

    //   const tutor = tutorialCollections.findOne(query);
    //   // console.log(id, tutor);
    //   let newCount = 0;
    //   if (tutor.review) {
    //     newCount = parseInt(tutor.review) + 1;
    //     console.log(newCount);
    //   } else {
    //     newCount = 1;
    //   }
    //   // now update tutorCollection
    //   const filter = { _id: new ObjectId(id) };
    //   const filter2 = { _id: new ObjectId(id2.reviewId) };

    //   console.log(filter, filter2);
    //   const updateTutor = {
    //     $set: {
    //       review: newCount,
    //     },
    //   };
    //   // console.log(updateTutor);
    //   const updateResult = tutorialCollections.updateOne(filter, updateTutor);
    //   const updateResult2 = await bookedTutorCollection.updateOne(
    //     filter2,
    //     updateTutor
    //   );
    //   console.log(updateResult);
    // });
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollections.insertOne(review);
      res.send(result);
    });
    app.get("/review", async (req, res) => {
      const cursor = reviewCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/review/:email", async (req, res) => {
      const email = req.params.email;
      const query = { tutorEmail: email };
      // console.log(query);
      const cursor = reviewCollections.find(query);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });
    app.delete("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = tutorialCollections.deleteOne(query);
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

      const result = tutorialCollections.updateOne(query, newTutorials, option);
      // console.log(result);
      res.send(result);
    });

    // Become a tutor
    app.post("/tutors", async (req, res) => {
      const becomeATutor = req.body;
      // console.log(becomeATutor);
      const result = await tutorCollections.insertOne(becomeATutor);
      res.send(result);
    });
    app.get("/tutors", async (req, res) => {
      const cursor = tutorCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/tutors/:language", async (req, res) => {
      const language = req.params.language;
      // console.log("language: " + language);
      const query = { language };
      const option = { upsert: false };
      const cursor = tutorCollections.find(query, option);
      // console.log(cursor);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });
    app.get("/tutors/email/:email", async (req, res) => {
      const email = req.params?.email;
      if (email) {
        const query = { email: email };

        const result = await tutorCollections.findOne(query);
        res.send(result);
      } else {
        const result = await tutorCollections.findOne();
        res.send(result);
      }
    });
    app.put("/tutors/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const option = { upsert: false };
      const isTutor = req.body.isTutor;
      // console.log(isTutor);
      const newTutors = {
        $set: {
          isTutor,
        },
      };

      const result = tutorCollections.updateOne(query, newTutors, option);
      //  console.log(result);
      res.send(result);
    });
    app.delete("/tutors/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = tutorCollections.deleteOne(query);
      // console.log(result);
      res.send(result);
    });
    app.get("/allTutors", async (req, res) => {
      const cursor = tutorCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Users post

    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // agend frud
    app.get("/users/:email", async (req, res) => {
      // const isFraud=req.body.isFraud;
      const email = req.params.email;
      // console.log(isFraud,email);
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.put("/users/isAdmin/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const option = { upsert: false };
      const isAdmin = req.body.isAdmin;
      // console.log(isTutor);
      const newAdmin = {
        $set: {
          isAdmin,
        },
      };

      const result = usersCollection.updateOne(query, newAdmin, option);
      //  console.log(result);
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
