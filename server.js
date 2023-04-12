const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectionString = "mongodb://127.0.0.1:27017/app";
const cookieParser = require("cookie-parser");
const port = 80;

app.use(express.static("public_html"));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(connectionString)
.then( () => {
    console.log("Connected to the database!");
})
.catch( (err) => {
    console.log("An error occurred while connecting to the database: " + err);
})

const User = new mongoose.model("user", new mongoose.Schema(
    {
        username: String,
        salt: Number,
        password: String,
    }
));

app.post("/createAccount/:username/:password", (req, res) => {
    let u = req.params.username;
    let p = req.params.password;
    User.findOne( {username: u} )
    .then( (response) => {
        console.log(response);
        res.send("Username already taken!");
    })
})

app.get("/login/:username/:password", (req, res) => {
    let u = req.params.username;
    let p = req.params.username;
})

app.listen(port, () => {
    console.log("Server is up and running!");
})