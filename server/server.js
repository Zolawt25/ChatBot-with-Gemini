require("dotenv").config();
const express = require("express");
const cors = require("cors");
const generateContent = require("./routes/gemini.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/gemini", generateContent);

app.get("/", (req, res) => res.send("Hello World!"));

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
