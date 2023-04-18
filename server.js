const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectionString = "mongodb://127.0.0.1:27017/app";
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const multer = require("multer");
const upload = multer( {dest: __dirname + '/public_html/img'} );
const port = 80;

app.use(express.json());
app.use(cookieParser());
app.use("/app/*", authenticate);
app.use(express.static("public_html"));

app.use("*", (req, res, next) => { //refreshes the user's session everytime they interact with the webpage
    if (req.cookies.login) {
        if (hasSession(req.cookies.login.username, req.cookies.login.sessionId)) {
            addOrRefreshSession(req.cookies.login.username, req.cookies.login.sessionId);
        }
    }
    next();
})

function authenticate(req, res, next) {
    if (req.cookies.login == undefined || !hasSession(req.cookies.login.username, req.cookies.login.sessionId)) {
        console.log("no session");
        res.redirect("/");
    }
    else {
        console.log("has a session!");
        next();
    }
}

var sessions = {};

function clearSessions() {
    for (i in sessions) { //clear any sessions that have existed for 3+ hours
        if (sessions[i].start + (60000 * 180) < Date.now()) {
            delete sessions[i];
        }
    }
}
setInterval(clearSessions, 0);
//setInterval(() => {console.log(sessions);}, 5000);

mongoose.connect(connectionString)
.then( () => {
    console.log("Connected to the database!");
})
.catch( (err) => {
    console.log("An error occurred while connecting to the database: " + err);
})

const User = new mongoose.model("user", new mongoose.Schema( //user schema, will definitely add to this more as needed
    {
        username: String,
        salt: Number,
        password: String,
        bio: String,
        pfp: String
    }
));

app.post("/createAccount", (req, res) => {
    let u = req.body.username;
    let p = req.body.password;
    User.findOne( {username: u} )
    .then( (response) => {
        if (response != null) {
            res.send("Username already taken!");
        }
        else {
            let salt = Math.floor(Math.random() * 100000); //generate salt to attach to password
            req.body.password = crypto.createHash("sha3-256").update(p + salt, "utf-8").digest("hex"); //hash the password + salt
            req.body.salt = salt;
            newUser = new User(req.body);
            newUser.save();
            res.redirect("http://" + req.hostname);
        }
    })
})

function addOrRefreshSession(user, sid) {
    let sessionId = Math.floor(Math.random() * 100000);
    let sessionStart = Date.now();

    if (user in sessions && sessions[user]["id"] == sid) { //update session if the user exists
        sessions[user].start = sessionStart;
    }
    else {  //otherwise create a new session for the user
        sessions[user] = {"id": sessionId, "start": sessionStart};
    }
    return sessionId;
}

function hasSession(username, sessionId) {
    if (sessions[username] == undefined) {
        return false;
    }
    return sessions[username].id == sessionId;
}

app.post("/login", (req, res) => {
    let u = req.body.username;
    let p = req.body.password;
    User.findOne( {username: u} )
    .then( (response) => {
        if (response == null) {
            res.send("Invalid login credentials!");
        }
        else {
            let password = crypto.createHash("sha3-256").update(p + response.salt, "utf-8").digest("hex");
            if (response.password == password) {
                let sid = addOrRefreshSession(u, undefined);
                res.cookie("login", {sessionId: sid, username: u}, {maxAge: 60000 * 120}); //max age of any cookie is currently 2 hours, could be more or less. can also refresh session everytime user interacts with the page
                res.redirect("http://" + req.hostname + "/app/home.html"); //redirect to the mainpage called home.html or whatever we want to call it will add this later
            }
            else {
                res.send("Invalid login credentials");
            }
        }
    })
})

app.post("/logout", (req, res) => {
    if (req.cookies.login != undefined) {
        delete sessions[req.cookies.login.username];
    }
    res.send("Successfully logged out");
})

app.post("/pfp", upload.single("img"), (req, res) => {
    if (req.file == undefined) {
        User.findOneAndUpdate(
            {username: req.cookies.login.username},
            {$unset: {pfp: ""} }
        )
        .then( (response) => {
            res.send("Successfully removed profile picture");
        })
        .catch( (err) => {
            console.log("Error removing profile picture: " + err);
        })
    }
    else {
        User.findOneAndUpdate(
            {username: req.cookies.login.username},
            {$set: {pfp: req.file.filename} }
        )
        .then( (response) => {
            res.send("Successfully set profile picture for user");
        })
        .catch( (err) => {
            console.log("Error uploading profile picture: " + err);
        })
    }
})

app.get("/getProfilePic", (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        if (response == null) {
            console.log("it's null");
            res.send(undefined);
        }
        else {
            res.send(response.pfp);
        }
    })
})

app.listen(port, () => {
    console.log("Server is up and running!");
})