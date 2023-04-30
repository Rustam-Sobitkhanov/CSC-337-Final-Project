const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const multer = require("multer");
const { resolveSoa } = require("dns");
require('dotenv').config();
const pfp = multer( {dest: __dirname + '/public_html/img/pfp'} );
const posts = multer( {dest: __dirname + '/public_html/img/posts'} );
const communities = multer( {dest: __dirname + '/public_html/img/communities'} );
const chats = multer( {dest: __dirname + '/public_html/img/chats'} )
const port = 80;

app.use(express.json());
app.use(cookieParser());
app.use("/app/*", authenticate);
app.use("/app/community.html", (req, res, next) => {
    res.redirect("/app/home.html");
})
app.use("/app/chat.html", (req, res, next) => {
    res.redirect("/app/home.html");
})

app.use("/app/community/*", express.static(__dirname + "/public_html/app/community.html"));
app.use("/app/chat/*", express.static(__dirname + "/public_html/app/chat.html"));
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
        res.redirect("/");
    }
    else {
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

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
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
        age: Number,
        gender: String,
        pfp: String,
        bio: String,
        friends: [mongoose.Schema.Types.ObjectId],
        pendingFriends: [mongoose.Schema.Types.ObjectId],
        communities: [mongoose.Schema.Types.ObjectId],
        posts: [mongoose.Schema.Types.ObjectId]
    }
));

const Post = new mongoose.model("post", new mongoose.Schema(
    {
        from: String,
        date: Number,
        picture: String,
        content: String,
        community: mongoose.Schema.Types.ObjectId        
    }
));

const Community = new mongoose.model("communitie", new mongoose.Schema(
    {
        owner: mongoose.Schema.Types.ObjectId,
        name: String,
        description: String,
        picture: String,
        members: [mongoose.Schema.Types.ObjectId],
        posts: [mongoose.Schema.Types.ObjectId],
    }
))

const Chat = new mongoose.model("chat", new mongoose.Schema(
    {
        users: [mongoose.Schema.Types.ObjectId],
        chatHistory: [mongoose.Schema.Types.ObjectId]
    }
))

const Message = new mongoose.model("message", new mongoose.Schema(
    {
        user: String,
        content: String,
        picture: String,
        date: Number
    }
))

app.get("/:path", (req, res) => {
    res.redirect("/");
})

app.post("/createAccount", (req, res) => {
    let u = req.body.username;
    let p = req.body.password;
    User.findOne({username: u})
    .then( (response) => {
        if (response != null) {
            res.send("Username already taken!");
        }
        else {
            let salt = Math.floor(Math.random() * 100000); //generate salt to attach to password
            req.body.password = crypto.createHash("sha3-256").update(p + salt, "utf-8").digest("hex"); //hash the password + salt
            req.body.salt = salt;
            newUser = new User(req.body);
            newUser.pfp = "default.png";
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

app.post("/app/pfp", pfp.single("img"), (req, res) => {
    if (req.file == undefined) {
        User.findOneAndUpdate(
            {username: req.cookies.login.username},
            {$set: {pfp: "default.png"} }
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

app.get("/app/getProfilePic", (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        if (response == null) {
            res.send(undefined);
        }
        else {
            res.send(response.pfp);
        }
    })
})

app.get("/app/getFriends", (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        res.send(response.friends);
    })
})

app.get("/app/getFriendRequests", (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        res.send(response.pendingFriends);
    })
})

app.get("/app/getPosts/", (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        res.send(response.posts);
    })
})

app.get("/app/getInfo/:user", (req, res) => {
    User.findOne( {_id: req.params.user} )
    .then( (response) => {
        res.send(response);
    })
})

app.get("/app/getProfile/:user", (req, res) => {
    User.findOne( {username: req.params.user} )
    .then( (response) => {
        res.send(response);
    })
})

app.post("/app/sendFriendRequest/", (req, res) => {
    if (req.body.toUser == req.cookies.login.username) {
        res.send("Cannot send friend request to yourself");
    }
    else {
        User.findOne( {username: req.body.toUser} )
        .then( (response) => {
            if (response == null) {
                res.send("User not found!");
            }
            else {
                User.findOne( {username: req.cookies.login.username} )
                .then( (response) => {
                    let sentFrom = response._id;
                    User.find( {_id: {$in: response.friends}} )
                    .then( (response) => {
                        let found = false;
                        for (i in response) {
                            if (response[i].username == req.body.toUser) {
                                found = true;
                            }
                        }
                        if (found) {
                            res.send("User is already your friend");
                        }
                        else {
                            User.findOneAndUpdate( {username: req.body.toUser}, {$addToSet: {pendingFriends: sentFrom}}, {new: true} )
                            .then( (response) => {
                                res.send("Friend request sent to user: " + req.body.toUser);
                            })
                        }
                    })
                })
            }
        })
    }
})

app.post("/app/acceptFriendRequest", (req, res) => {
    User.updateOne( { username: req.cookies.login.username}, {$pull: {pendingFriends: req.body.fromUser}}, {new: true} )
    .then( (response) => {
        User.findOneAndUpdate( { username: req.cookies.login.username}, {$addToSet: {friends: req.body.fromUser}}, {new: true})
        .then( (response) => {
            let acceptingUser = response._id;
            User.findOneAndUpdate( { _id: req.body.fromUser}, {$addToSet: {friends: acceptingUser}}, {new: true} )
            .then( (response) => {
                User.findOneAndUpdate( { _id: req.body.fromUser}, {$pull: {pendingFriends: acceptingUser}}, {new: true} )
                .then( (response) => {
                    res.send("Accepted friend request");
                })
            })
        })
    })
})

app.get("/app/search/:type/:query", (req, res) => {
    if (req.params.type == "user") {
        User.find( {username: {$regex: "(?i)" + req.params.query}} )
        .then( (response) => {
            res.send(response);
        })
    }
    else {
        Community.find( {name: {$regex: "(?i)" + req.params.query}} )
        .then( (response) => {
            res.send(response);
        })
    }
})

app.post("/app/post", posts.single("picture"), (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        let user = response._id;
        if (req.file != undefined) {
            newPost = new Post(
                {
                    from: response.username,
                    date: Date.now(),
                    picture: req.file.filename,
                    content: req.body.content
                }
            )
        }
        else {
            newPost = new Post(
                {
                    from: response.username,
                    date: Date.now(),
                    content: req.body.content
                }
            )
        }
        newPost.save()
        .then( (response) => {
            User.updateOne( {_id: user}, {$addToSet: {posts: response._id}}, {new: true})
            .then( (response) => {
                res.send("Created new post!");
            })
        })
    })
    .catch( (err) => {
        console.log("Error finding user to post: " + err);
        res.send(err);
    })
})

app.post("/app/createCommunity", communities.single("picture"), (req, res) => {
    Community.findOne( {name: req.body.name} )
    .then( (response) => {
        if (response == undefined) {
            User.findOne( { username: req.cookies.login.username} )
            .then( (response) => {
                let userId = response._id;
                let newCommunity = new Community(req.body);
                newCommunity.owner = userId;
                newCommunity.picture = req.file.filename;
                newCommunity.members.push(response._id);
                newCommunity.save()
                .then( (response) => {
                    let communityId = response._id;
                    User.updateOne( {_id: userId}, {$addToSet: {communities: communityId}}, {new: true} )
                    .then( (response) => {
                        res.send("Created Community!");
                    })
                })
            })
        }
        else {
            res.send("A community with this name already exists!");
        }
    })
})

app.get("/app/findCommunity/:communityId", (req, res) => {
    Community.findOne( {_id: req.params.communityId} )
    .then( (response) => {
        res.send(response);
    })
})

app.get("/app/inCommunity/:communityId", (req, res) => {
    Community.findOne( {_id: req.params.communityId} )
    .then( (response) => {
        let communityId = response._id;
        User.findOne( {username: req.cookies.login.username, communities: {$in: [response._id]}} )
        .then( (response) => {
            if (response == null) {
                res.send(communityId);
            }
            else {
                res.send("In community");
            }
        })
    })
})

app.post("/app/joinCommunity", (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response => {
        let userId = response._id;
        Community.findOneAndUpdate( {_id: req.body.communityId}, {$addToSet: {members: userId}} )
        .then( (response) => {
            User.updateOne( {username: req.cookies.login.username}, {$addToSet: {communities: response._id}}, {new: true} )
            .then( (response) => {
                res.send("Joined community!");
            })
        })
    }))
})

app.get("/app/getChat/:otherUser", (req, res) => {
    if (req.cookies.login.username == req.params.otherUser) {
        res.send({msg: "Cannot send a chat to yourself!"});
    }
    else {
        User.findOne( {username: req.cookies.login.username} )
        .then( (response) => {
            let user1 = response._id;
            User.findOne( {username: req.params.otherUser, friends: {$in: [user1]}} )
            .then( (response) => {
                if (response == null) {
                    res.send({msg: "Cannot send message to user because they are not your friend!"});
                }
                else {
                    let user2 = response._id;
                    Chat.findOne( {users: {$all: [user1, user2]}} )
                    .then( (response) => {
                        res.cookie("chat", {user1: user1, user2: user2}, {maxAge: 1200000});
                        if (response == null) {
                            newChat = new Chat( {users: [user1, user2]} );
                            newChat.save();
                            res.send([]);
                        }
                        else {
                            res.send(response.chatHistory);
                        }
                    })
                }
            })
        })
    }
})

app.post("/app/postChat/:otherUser", chats.single("picture"), (req, res) => {
    let newMessage = new Message(req.body);
    newMessage.user = req.cookies.login.username;
    newMessage.date = Date.now();
    if (req.file != undefined) {
        newMessage.picture = req.file.filename;
    }
    newMessage.save()
    .then( (response) => {
        let chatId = response._id;
        Chat.findOneAndUpdate( {users: {$all: [req.cookies.chat.user1, req.cookies.chat.user2]}}, {$addToSet: {chatHistory: chatId}}, {new: true} )
        .then( (response) => {
            res.send("Message saved!");
        })
    })
})

app.get("/app/getMessage/:msgId", (req, res) => {
    Message.findOne( {_id: req.params.msgId} )
    .then( (response) => {
        res.send(response);
    })
})

app.listen(port, () => {
    console.log("Server is up and running!");
})