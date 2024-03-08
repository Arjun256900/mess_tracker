import express from "express";
import bodyParser from "body-parser";
import { check, validationResult } from "express-validator";
import mongoose from "mongoose";

const PORT = 3000;
const app = express();

const mongoURI = "mongodb://localhost:27017/bookstore";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

const foodSchema = mongoose.Schema({
  name: String,
  votes: { type: Number, default: 0 },
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
  (req, res) => {
    var isOpen = false;
    const time = 19;
    if (time > 6 && time < 18) {
      isOpen = true;
    } else {
      isOpen = false;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("index.ejs", {
        errors: errors.mapped(),
        cssFile: "styles/styles.css",
      });
    }
    if (errors.isEmpty() && !isOpen) {
      res.render("main.ejs", { choices: choicesForTheDay }); //TODO
    } else {
      res.render("main.ejs", { choices: choicesForTheDay }); // DO NOT FORGET TO CHANGE THIS
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
  (req, res) => {
    var isOpen = false;
    const time = new Date().getHours();
    if (time > 6 && time < 18) {
      isOpen = true;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("login.ejs", {
        errors: errors.mapped(),
      });
    }
    if (errors.isEmpty() && isOpen == true) {
      res.render("main.ejs", { choices: choicesForTheDay });
    }
    if (errors.isEmpty() && isOpen == false) {
      res.render("main.ejs", { choices: choicesForTheDay }); //CHANGE THIS
    }
  }
);

app.get("/home", (req, res) => {
  const time = new Date().getHours();
  if (time > 6 && time < 18) {
    res.render("main.ejs", { choices: choicesForTheDay });
  } else {
    res.render("main.ejs");
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
// setInterval(selectRandomFood, 15000);

app.get("/vote", async (req, res) => {
  console.log(req.query.food);
  let time = new Date().getHours();
  if (time > 6 && time < 18) {
    try {
      const foodName = req.query.food;
      const result = await db
        .collection("books")
        .updateOne({ name: foodName }, { $inc: { votes: 1 } });
      if (result.modifiedCount == 0) {
        return res.status(404).send("Food not found");
      }
      res.redirect("/home");
    } catch (err) {
      res.json({ message: err.message });
    }
  } else {
    res.render("static.ejs");
  }
});

app.get("/calculateResult", async (req, res) => {
  const time = new Date().getHours();
  console.log(choicesForTheDay);
  try {
    if (time >= 18 || time < 6) {
      const winner = await db
        .collection("books")
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
function selectRandomFood() {
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
    db.collection("books").insertOne(randFood);
  });
  console.log(choicesForTheDay);
}
