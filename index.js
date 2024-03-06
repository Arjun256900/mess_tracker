import express from "express";
import bodyParser from "body-parser";
import { check, validationResult } from "express-validator";

const PORT = 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("public/images"))

const passwordConfirmationCheck = (value, { req }) => {
  if (value !== req.body.password) {
    throw new Error("Passwords do not match");
  }
  return true;
};

// const emailConfirmationCheck = ({req}) =>{
//   const email = req.body.email.toLowerCase();
//   if(!email.includes("@citchennai.net")){
//     throw new Error("Email is not associated with CIT");
//   }
// }

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
    check("email").isEmail().withMessage("Enter a valid email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password should be at least 6 characters long"),
    check("confirm")
      .custom(passwordConfirmationCheck)
      .withMessage("Confirm passwords does not match with password"),
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
      res.render("main.ejs", {
        name: req.body.password,
        email: req.body.email,
      });
    } else {
      res.render("static.ejs");
    }
  }
);

app.post(
  "/login/submit",
  [
    check("email").isEmail().withMessage("Enter valid email address"),
    check("password").isLength({ min: 6 }).withMessage("Invalid password"),
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
        cssFile: "styles/styles.css",
      });
    }
    if (errors.isEmpty() && isOpen == true) {
      res.render("main.ejs", {
        name: req.body.password,
        email: req.body.email,
      });
    }
    if (errors.isEmpty() && isOpen == false) {
      res.render("static.ejs");
    }
  }
);

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
var choicesForTheDay = [];
setInterval(selectRandomFood, 24 * 60 * 60 * 1000);

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
