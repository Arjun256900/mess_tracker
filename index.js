import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const PORT = 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.render("index.ejs");
});

app.listen(PORT, (req, res) => {
    console.log(`Server listening on port ${PORT}`);
});