import express from "express";
import bodyParser from "body-parser";
import { check, validationResult } from "express-validator";
import mongoose from "mongoose";

const PORT = 3000;
const app = express();

const mongoURI =
  "mongodb+srv://ArjunAdmin:Arjuncoc_101@messtrackercit.yn9k2qj.mongodb.net/?retryWrites=true&w=majority&appName=MessTrackerCIT";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("styles"));
app.use(express.static("images"));
app.use(express.static("images/VEG"));
app.use(express.static("static_js"));

const passwordConfirmationCheck = (value, { req }) => {
  if (value !== req.body.password) {
    throw new Error("Passwords do not match");
  }
  return true;
};

// const now = new Date();
// const millisTill6PM =
//   new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0) - now;

// if (millisTill6PM > 0) {
//   // If there's still some time left, just wait till 6PM
//   setTimeout(resetIsVoted, millisTill6PM);
// } else {
//   // Run immediatly if it's already past 6PM
//   resetIsVoted();
// }
// Modify the opening hour check
const now = new Date();
const openingHour = 13; // 1 PM
const closingHour = 13; // 1 PM
const closingMinute = 15; // 1:15 PM

const currentHour = now.getHours();
const currentMinute = now.getMinutes();

const isOpen =
  currentHour === openingHour &&
  currentMinute >= 0 &&
  currentMinute <= closingMinute;

// Adjust the interval for resetting the voting status
const millisTillClosing =
  new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    closingHour,
    closingMinute,
    0
  ) - now;

if (millisTillClosing > 0) {
  // If there's still some time left, just wait till closing time
  setTimeout(resetIsVoted, millisTillClosing);
} else {
  // Run immediately if it's already past closing time
  resetIsVoted();
}

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/login", async (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/register/submit",
  [
    check("username")
      .isLength({ min: 3 })
      .withMessage("Username should be minimum 3 characters"),
    check("email")
      .isEmail()
      .custom((value) => {
        return value.endsWith("@citchennai.net");
      })
      .withMessage("Email must be associated with CIT"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password should be at least 6 characters long"),
    check("confirm")
      .custom(passwordConfirmationCheck)
      .withMessage("Confirm password does not match with password"),
  ],
  async (req, res) => {
    var isOpen = false;
    // const time = new Date().getHours();
    const time = new Date();
    const currentHours = time.getHours();
    const currentMinutes = time.getMinutes();
    if (currentHours >= 14 && currentMinutes >=0 && currentMinutes<=15) {
      isOpen = true;
    } else {
      isOpen = false;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("index.ejs", {
        errors: errors.mapped(),
      });
    }
    if (errors.isEmpty() && !isOpen) {
      let isExist = await db
        .collection("users")
        .findOne({ email: req.body.email });

      if (isExist === null) {
        await db.collection("users").insertOne({
          name: req.body.username,
          email: req.body.email,
          password: req.body.password,
          isVoted: false,
          isAdmin: false,
        });
        let currentFoods = await db.collection("foods").find().toArray();
        res.render("main.ejs", {
          choices: currentFoods,
          userEmail: req.body.email,
        });
      } else {
        return res.json({ message: "User with this email already exists." });
      }
    } else {
      res.render("static.ejs"); // DO NOT FORGET TO CHANGE THIS
    }
  }
);

app.post(
  "/login/submit",
  [
    check("email")
      .isEmail()
      .custom((value) => {
        return value.endsWith("@citchennai.net");
      })
      .withMessage("Email must be associated with CIT"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    var isOpen = false;
    // const time = new Date().getHours();
    const time = new Date();
    const currentHours = time.getHours();
    const currentMinutes = time.getMinutes();
    if (currentHours>=14 && currentMinutes>=0 && currentMinutes<=15) {
      isOpen = true;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("login.ejs", {
        errors: errors.mapped(),
      });
    }
    if (errors.isEmpty() && isOpen == true) {
      const isExist = await db
        .collection("users")
        .findOne({ email: req.body.email });
      if (isExist != null && isExist.isVoted == false) {
        let currentFoods = await db.collection("foods").find().toArray();
        res.render("main.ejs", {
          choices: currentFoods,
          userEmail: req.body.email,
        });
      } else if (isExist != null && isExist.isVoted == true) {
        res.render("main.ejs", { isVoted: true, userEmail: req.body.email });
      } else {
        return res.json({ message: "User with this email does not exist." });
      }
    }
    if (errors.isEmpty() && isOpen == false) {
      res.render("main.ejs", { userEmail: req.body.email }); //CHANGE THIS
    }
  }
);

app.get("/home", async (req, res) => {
  // const time = new Date().getHours();
  const time = new Date();
  const currentHours = time.getHours();
  const currentMinutes = time.getMinutes();
  if (currentHours>=14 && currentMinutes>=0 && currentMinutes<=15) {
    let currentFoods = await db.collection("foods").find().toArray();
    let voted = await db
      .collection("users")
      .findOne({ email: req.query.email });
    if (voted == false) {
      res.render("main.ejs", {
        choices: currentFoods,
        userEmail: req.query.email,
      });
    } else {
      res.render("main.ejs", { isVoted: true, userEmail: req.query.email });
    }
  } else {
    res.render("main.ejs", { userEmail: req.query.email });
  }
});

//Voting logic
const vegFoods = [
  {
    name: "idly",
  },
  {
    name: "sambar-rice",
  },
  {
    name: "vegetable-rice",
  },
  {
    name: "curd-rice",
  },
  {
    name: "gobi-rice",
  },
  {
    name: "veg-noodles",
  },
  {
    name: "vada-curry",
  },
  {
    name: "pongal",
  },
  {
    name: "bread-toast",
  },
  {
    name: "parotta",
  },
  {
    name: "chappathi",
  },
];

// selecting the menu of the day
var choicesForTheDay = [
  { name: "chappathi", votes: 0 },
  { name: "curd-rice", votes: 0 },
  { name: "parotta", votes: 0 },
  { name: "veg-noodles", votes: 0 },
  { name: "pongal", votes: 0 },
  { name: "gobi-rice", votes: 0 },
  { name: "vada-curry", votes: 0 },
  { name: "idly", votes: 0 },
];

// setInterval(selectRandomFood, 10000);

app.get("/vote", async (req, res) => {
  // let time = new Date().getHours();
  const time = new Date();
  const currentHours = time.getHours();
  const currentMinutes = time.getMinutes();
  if (currentHours >= 14 && currentMinutes >= 0 && currentMinutes<=15) {
    try {
      const userEmail = req.query.email.toLocaleLowerCase();
      const user = await db.collection("users").findOne({ email: userEmail });
      if (!user) {
        return res.status(404).send("User not found");
      }
      if (user.isVoted == false) {
        const foodName = req.query.food;
        const result = await db
          .collection("foods")
          .updateOne({ name: foodName }, { $inc: { votes: 1 } });
        if (result.modifiedCount == 0) {
          return res.status(404).send("Food not found");
        }
        await db
          .collection("users")
          .updateOne({ email: userEmail }, { $set: { isVoted: true } });
        res.render("main.ejs", { isVoted: true, userEmail: userEmail });
      } else {
        res.render("main.ejs", { isVoted: true, userEmail: userEmail });
      }
    } catch (err) {
      res.json({ message: err.message });
    }
  } else {
    res.render("static.ejs");
  }
});

app.get("/calculateResult", async (req, res) => {
  // const time = new Date().getHours();
  const time = new Date();
  const currentHours = time.getHours();
  const currentMinutes = time.getMinutes();
  try {
    // if (time >= 18 || time < 6) {
      if(currentHours >=14 && currentMinutes >15){
      const winner = await db
        .collection("foods")
        .aggregate([{ $sort: { votes: -1 } }, { $limit: 1 }])
        .toArray();
      if (winner.length == 0) {
        return res.status(404).send("No votes received");
      }
      console.log(winner);
      res.render("result.ejs", { food: winner });
    } else {
      res.render("result.ejs");
    }
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/CIT/policy", (req, res) => {
  res.render("policy.ejs");
});

//functions
async function selectRandomFood() {
  try {
    await db.collection("foods").deleteMany({});
    choicesForTheDay = [];
    const randomIndex = [];
    while (randomIndex.length < 8) {
      const idx = Math.floor(Math.random() * vegFoods.length);
      if (!randomIndex.includes(idx)) {
        randomIndex.push(idx);
      }
    }
    randomIndex.forEach((index) => {
      const randFood = {
        name: vegFoods[index].name,
        votes: 0,
      };
      choicesForTheDay.push(randFood);
      db.collection("foods").insertOne(randFood);
    });
    console.log(choicesForTheDay);
  } catch (e) {
    console.log("Error selecting random foods", e);
  }
}

async function resetIsVoted() {
  try {
    await db.collection("users").updateMany({}, { $set: { isVoted: false } });
    console.log("Reset isVoted is successful");
  } catch (e) {
    console.log("Error resetting isVoted", e);
  }
}
