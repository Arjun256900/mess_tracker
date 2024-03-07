import express from "express";
import bodyParser from "body-parser";
import { check, validationResult } from "express-validator";

const PORT = 3000;
const app = express();

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
      res.render("main.ejs", {choices: choicesForTheDay});  //TODO
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
      res.render("static.ejs"); //CHANGE THIS
    }
  }
);

app.get("/home", (req, res) => {
  res.render("main.ejs");
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
    name: "vadagari",
  },
  {
    name: "pongal",
  },
  {
    name: "bread-toast",
  },
  {
    name: "porota",
  },
  {
    name: "chappathi",
  },
];

// selecting the menu of the day
var choicesForTheDay = [
  { name: "vadagari", votes: 0 },
  { name: "curd-rice", votes: 0 },
  { name: "sambar-rice", votes: 0 },
  { name: "chappathi", votes: 0 },
  { name: "gobi-rice", votes: 0 },
  {name: "pongal", votes: 0 },
  {name: "porota", votes: 0 },
  {name: "bread-toast", votes: 0 },
  { name: "veg-noodles", votes:0},
];
// setInterval(selectRandomFood, 24 * 60 * 60 * 1000);

app.post("/vote", (req, res) => {
  console.log(req.body.choice);
  choicesForTheDay.forEach((choice) => {
    if (choice.name == req.body.choice) {
      choice.votes++;
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

//functions
function selectRandomFood() {
  choicesForTheDay = [];
  const randomIndex = [];
  while (randomIndex.length < 5) {
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
  });
  console.log(choicesForTheDay);
}
