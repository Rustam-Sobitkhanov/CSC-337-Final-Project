function loginUser() { //index.html
    document.getElementById("status").innerText = "";
    let u = document.getElementById("username").value.trim();
    let p = document.getElementById("password").value.trim();

    if (u.trim() == "" || p.trim() == "") {
        document.getElementById("status").innerText = "Fields cannot be empty!";
    }
    else {
        let loginData = {username: u, password: p};
        let url = "/login";
        fetch(url,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(loginData),
            })
        .then( (response) => {
            if (response.redirected == false) {
                return response.text();
            }
            else {
                window.location.href = response.url;
                return "";
            }
        })
        .then( (response) => {
            document.getElementById("status").innerText = response;
        })
        .catch( (err) => {
            console.log("Error logging in: " + err);
        })
    }
}

function createAccount() { //signup.html
    document.getElementById("status").innerText = "";
    let u = document.getElementById("username").value.trim();
    let p = document.getElementById("password").value.trim();
    let a = document.getElementById("age").value;
    let g = document.getElementById("gender").value;
    if (u.trim() == "" || p.trim() == "" || a == "") {
        document.getElementById("status").innerText = "Fields cannot be empty!";
    }
    else if (u.split(" ").length > 1) {
        document.getElementById("status").innerText = "Username cannot have a space in it!";   
    }
    else {
        let data = {username: u, password: p, age: a, gender: g};
        let url = "/createAccount";
        fetch(url, 
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            })
        .then( (response) => {
            if (response.redirected == false) {
                return response.text();
            }
            else {
                window.location.href = response.url;
                alert("Account created successfully!");
                return "";
            }
        })
        .then( (response) => {
            document.getElementById("status").innerText = response;
        })
    }
}

function greetUser() { //profile.html
    let x = usernameFromCookie();
    document.getElementById("greeting").innerText += " " + x;
}

function logout() { //home.html
    let url = "/logout";
    fetch(url, 
        {
            method: "POST"
        })
    window.location.href = window.location.origin;
}

function setProfilePic() { //profile.html
    document.getElementById("imgStatus").innerText = "";
    if (document.getElementById("img").files.length == 0) {
        document.getElementById("imgStatus").innerText = "Cannot leave field empty";
    }
    else {
        let formData = new FormData();
        formData.append("img", document.getElementById("img").files[0]);
        let url = "/app/pfp";
        fetch(url,
            {
                method: "POST",
                body: formData
            })
        .then( (response) => {
            document.getElementById("img").value = "";
            setTimeout(fetchProfilePic, 200);
        })
    }
}

function removeProfilePic() { //profile.html
    document.getElementById("img").value = "";
    let formData = new FormData();
    formData.append("img", document.getElementById("img").files[0]);
    let url = "/app/pfp";
    fetch(url,
        {
            method: "POST",
            body: formData
        })
    .then( (response) => {
        setTimeout(fetchProfilePic, 200);
    })
}

function fetchProfilePic() { //profile.html
    document.getElementById("pfp").innerHTML = "";
    let url = "/app/getProfilePic";
    fetch(url)
    .then( (response) => {
        return response.text();
    })
    .then( (response) => {
        document.getElementById("pfp").innerHTML += "<img id='profilePic' src='../img/pfp/" + response + "' alt='Your profile picture' width='450px;' height='450px'>";
    })
}

function goHome() { //all html files in "app" directory
    window.location.href = window.location.origin + "/app/home.html";
}

function goBack() {
    window.history.back();
}

function goToProfile() { //post.html
    window.location.href = window.location.origin + "/app/profile.html";
}

function getFriends() { //friends.html
    let url = "/app/getFriends";
    fetch(url)
    .then( (response) => {
        return response.json(); //return the json and get the array of friends in the next block
    })
    .then( (response) => {
        for (i in response) {
            let url = "/app/getInfo/" + response[i];
            fetch(url)
            .then( (response) => {
                return response.json();
            })
            .then( (response) => {
                document.getElementById("friends").innerHTML += "<div' class='user'><img src='../img/pfp/" + response.pfp + "' alt='ProfilePicture' width='50px' height='50px'><a class='username' href='/app/user/" + response.username + "'>" + response.username + "</a>" + "<button onclick='goChat(this)' id='" + response.username + "' class='chatButton'>Chat now!</button></div>";
            })
        }
    })
}

function getUserInfo() { //profile.html
    let x = usernameFromCookie();
    let url = "/app/getProfile/" + x;
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        document.getElementById("nameField").innerText += " " + response.username;
        document.getElementById("ageField").innerText += " " + response.age;
        document.getElementById("genderField").innerText += " " + response.gender.toUpperCase();
    })
}

function getFriendRequests() { //friends.html
    let url = "/app/getFriendRequests";
    fetch(url)
    .then( (response) => {
        return response.json(); //return the json and get the array of friends in the next block
    })
    .then( (response) => {
        if (response.length == 0) {
            document.getElementById("friendRequests").innerHTML = "<h3 class='msg'>No new friend requests at this time!</h3>";
        }
        else {
            document.getElementById("friendRequests").innerHTML = "<h3 class='msg'>Incoming friend requests from:</h3>";
            for (i in response) {
                let url = "/app/getInfo/" + response[i];
                fetch(url)
                .then( (response) => {
                    return response.json();
                })
                .then( (response) => {
                    document.getElementById("friendRequests").innerHTML += "<div' class='user'><img src='../img/pfp/" + response.pfp + "' alt='ProfilePicture' width='50px' height='50px'><a class='username' href='/app/user/" + response.username + "'>" + response.username + "</a><button class='accept' id='" + response._id + "' onclick='acceptRequest(this)'>Accept</button></div><br>";
                })
            }
        }
    })
}

function sendFriendRequest() { //friends.html
    document.getElementById("reqStatus").innerText = "";
    let data = {toUser: document.getElementById("toUser").value};
    let url = "/app/sendFriendRequest/";
    fetch(url,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
    .then( (response) => {
        return response.text();
    })
    .then( (response) => {
        document.getElementById("reqStatus").innerText = response;
    })
}

function acceptRequest(button) { //friends.html
    let url = "/app/acceptFriendRequest";
    let data = {fromUser: button.id};
    fetch(url,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
    .then( (response) => {
        window.location.reload();
    })
}

function search() { //search.html
    document.getElementById("searchResults").innerHTML = "";
    let url = "/app/search/";
    if (document.getElementById("user").checked) {
        url += "user/";
    }
    else {
        url += "community/";
    }
    url += document.getElementById("query").value;
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        document.getElementById("query").value = "";
        if (response.length == 0) {
            document.getElementById("searchResults").innerHTML = "<h3>No results were returned</h3>";
            return;
        }
        let results = [];
        if (document.getElementById("user").checked) {
            for (i in response) {
                document.getElementById("searchResults").innerHTML += "<div id='userID'><img src='../img/pfp/" + response[i].pfp + "' alt='ProfilePicture' width='50px' height='50px'><a href='/app/user/" + response[i].username + "'>" + response[i].username +  "</a></div>";
            }
        }
        else {
            for (i in response) {
                document.getElementById("searchResults").innerHTML += "<div id='containerJS'><div id='communityID'><img src='../img/communities/" + response[i].picture + "' alt='ProfilePicture' width='50px' height='50px'><span><a href='community/" + response[i]._id + "'>" + response[i].name + "</a></span></div><div id='comDescription'> Description: " + response[i].description + "</div></div>";            }
        }
    })
}

function checkEmptySearchQuery() { //search.html
    if (document.getElementById("query").value.trim() != "" && (document.getElementById("user").checked || document.getElementById("community").checked)) {
        document.getElementById("submitButton").innerHTML = '<button type="button" onclick="search()">Search</button>';
    }
    else {
        document.getElementById("submitButton").innerHTML = '<button type="button" disabled="disabled">Search</button>';
    }
}

function checkEmptyPostContent() { //post.html
    if (document.getElementById("postContent").value.trim() == "") {
        document.getElementById("submitButton").innerHTML = '<button type="button" disabled="disabled">Post</button>';
    }
    else {
        document.getElementById("submitButton").innerHTML = '<button type="button" onclick="post()">Post</button>';
    }
}

function post() { //post.html
    let formData = new FormData();
    formData.append("content", document.getElementById("postContent").value);
    formData.append("picture", document.getElementById("img").files[0]);
    if (window.location.href.split("/").length == 6) {
        formData.append("community", window.location.href.split("/")[5]);
    }
    let url = "/app/post/";
    fetch(url,
        {
            method: "POST",
            body: formData
        })
    .then( (response) => {
        return response.text();
    })
    .then( (response) => {
        alert(response);
        goBack();
    })
}

function checkEmptyCommunityFields() { //createCommunity.html
    if (document.getElementById("name").value.trim() == "" || document.getElementById("picture").files.length == 0 || document.getElementById("desc").value.trim() == "") {
        document.getElementById("submitButton").innerHTML = "<button type='button' disabled='disabled'>Create</button>";
    }
    else {
        document.getElementById("submitButton").innerHTML = "<button type='button' onclick='createCommunity()'>Create</button><p id='status'></p>";
    }
}

function createCommunity() { //createCommunity.html
    let url = "/app/createCommunity";
    let formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("description", document.getElementById("desc").value);
    formData.append("picture", document.getElementById("picture").files[0]);
    document.getElementById("status").innerText = "";
    fetch(url,
        {
            method: "POST",
            body: formData
        })
    .then( (response) => {
        return response.text();
    })
    .then( (response) => {
        if (response == "Community Created!") {
            document.getElementById("name").value = "";
            document.getElementById("desc").value = "";
            document.getElementById("picture").value = "";
        }
        document.getElementById("status").innerText = response;
    })
}

function getCommunity() { //community.html
    let community = window.location.href.split("/")[5];
    let url = "/app/findCommunity/" + community;
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => { //fetch community info, console log the json object containing all its info and add it to the page
        document.getElementsByTagName("title")[0].innerText += response.name;
        document.getElementById("img").innerHTML = "<img src='../../img/communities/" + response.picture + "' alt='Community Picture'>";
        document.getElementsByClassName("title")[0].innerText = response.name;
        document.getElementsByClassName("title")[1].innerText = response.name;
        document.getElementById("desc").innerText = "Description: " + response.description;
    })
}

function userInCommunity() {
    let community = window.location.href.split("/")[5];
    let url = "/app/inCommunity/" + community;
    fetch(url)
    .then( (response) => {
        return response.text();
    })
    .then( (response) => {
        if (!(response == "In community")) { //adds a join button to the community page if the user is not already a member
            document.getElementById("desc").innerHTML += "<button onclick='joinCommunity()' id='joinBTN'>Join</button>"
            document.getElementById("posts").innerHTML += "Please join this community to view its posts";
        }
        else {
            document.getElementById("desc").innerHTML += "<a href='/app/post/" + community + "'><input type='button' id='createBTN' value='Create post'></a>";
            getCommunityPosts();
        }
    })
}

function getCommunityPosts() { //community.html
    let posts = document.getElementById("comPosts");
    let communityId = window.location.href.split("/")[5];
    let url = "/app/getPosts/" + communityId;
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        for (i in response) {
            let postId = response[i];
            fetch("/app/getPost/" + response[i])
            .then( (response) => {
                return response.json();
            })
            .then( (response) => {
                let content = response.content;
                let picture = response.picture;
                let date = response.date;
                let fromUser = response.from;
                fetch("/app/getProfile/" + fromUser)
                .then( (response) => {
                    return response.json();
                })
                .then( (response) => {
                    let postContent = '<div id="pfpUserName"><img id="pfpImg" src="../../img/pfp/' + response.pfp + '" alt="Profile Picture" class="postPicture">';
                    postContent += "<span class='username'>" + fromUser + "</span></div>";
                    postContent += '<p class="content">' + content + '</p>';
                    if (picture != undefined) {
                        postContent += '<div id="noUse"><img id="postedPic" src="/img/posts/' + picture + '" alt="picture" width="300px" height="300px"></div>';
                    }
                    let time = new Date(date).toLocaleTimeString("en-US");
                    let day = new Date(date).toLocaleDateString("en-US");
                    let timestamp = '<div class="timestamp">' + day + " " + time + '</div>';
                    posts.innerHTML += '<div class="post">' + postContent + timestamp + '</div>';
                })
            })
        }
    })
}

function joinCommunity() { //community.html
    let url = "/app/joinCommunity";
    let data = {communityId: window.location.href.split("/")[5]};
    fetch(url,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        })
    .then( (response) => {
        return response.text();
    })
    .then( (response) => {
        window.location.reload();
    })
}

function getChatHistory() { //chat.html
    let otherUser = window.location.href.split("/")[5];
    if (document.getElementsByTagName("title")[0].innerText == "") {
        document.getElementsByTagName("title")[0].innerText = otherUser;
    }
    let url = "/app/getChat/" + otherUser;
    let currMsgCount = 0;
    fetch(url)
    .then( (response) => {
        if (response.redirected == true) {
            window.location.href = response.url;
        }
        return response.json();
    })
    .then( (response) => {
        if (response.msg == "Cannot send message to user because they are not your friend!" || response.msg == "Cannot send a chat to yourself!") {
            document.getElementById("chatHistory").innerHTML = "<h2>" + response.msg + "</h2>";
            document.getElementById("inputMessage").innerHTML = '<button onclick="goToFriends()">Return</button>';
            return response.msg;
        }
        else {
            var messages = [];
            if (numMsgs != response.length) {
                for (let i = numMsgs; i < response.length; i++) {
                    currMsgCount += 1;
                    let url = "/app/getMessage/" + response[i];
                    fetch(url)
                    .then( (response) => {
                        return response.json();
                    })
                    .then( (response) => {
                        messages.push(response.date + ":" + response.user + ":" + response.content + ":" + response.picture);
                        return messages;
                    })
                    .then( (response) => {
                        if (currMsgCount == response.length) {
                            messages.sort();
                            for (i in messages) {
                                numMsgs += 1;
                                let msg = messages[i].split(":");
                                if (msg[1] != lastUser) {
                                    document.getElementById("chatHistory").innerHTML += "<strong class='username'>" + msg[1] + ":</strong>";
                                }
                                if (msg[3] != "undefined") {
                                    document.getElementById("chatHistory").innerHTML += '<br><img src="../../img/chats/' + msg[3] + '" alt="picture" width="60px" height="60px">';
                                }
                                document.getElementById("chatHistory").innerHTML += "<p>" + msg[2] + "</p>";
                                lastUser = msg[1];
                            }
                        }
                    })
                }
            }
        }
    })
}

function checkEmptyMsg() { //chat.html
    if (document.getElementById("message").value.trim() == "" && document.getElementById("img").files.length == 0) {
        document.getElementById("button").innerHTML = '<button type="submit" disabled="disabled">Send message</button>';
    }
    else {
        document.getElementById("button").innerHTML = '<button type="submit" onclick="sendMessage()">Send message</button>';
    }
}

function sendMessage() { //chat.html
    let formData = new FormData();
    formData.append("content", document.getElementById("message").value);
    formData.append("picture", document.getElementById("img").files[0]);
    let url = "/app/postChat/" + window.location.href.split("/")[5];
    fetch(url,
        {
            method: "POST",
            body: formData
        })
    .then( () => {
        document.getElementById("message").value = "";
        document.getElementById("img").value = "";        
    })
}

function goToFriends() {
    window.location.href = window.location.origin + "/app/friends.html";
}

function goChat(button) { //friends.html
    window.location.href = window.location.origin + "/app/chat/" + button.id;
}

function getPfpAndUsername() { //profile.html
    let x = usernameFromCookie();
    let url = "/app/getProfile/" + x;
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        document.getElementById("pfpName").innerHTML += "<img src='../img/pfp/" + response.pfp + "' alt='ProfilePicture' width='45px' height='45px' class='pfp'>";
        document.getElementById("pfpName").innerHTML += "<p class='username'>" + response.username + "</p>";
    })
}

function fetchPosts() { //profile.html
    let x = usernameFromCookie();
    let url = "/app/getProfile/" + x;
    let posts = document.getElementById("posts");
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        if (response.posts.length != 0) {
            let username = response.username;
            let pfp = response.pfp;
            for (i in response.posts) {
                fetch("/app/getPost/" + response.posts[i])
                .then( (response) => {
                    return response.json();
                })
                .then( (response) => {
                    let postContent = '<span class="postUser"><img src="../img/pfp/' + pfp + '" alt="Profile Picture" width="30px" height="30px" class="postPicture">';
                    postContent += "<p class='username'>" + username + "</p></span>";
                    postContent += '<p class="content">' + response.content + '</p>';
                    if (response.picture != undefined) {
                        postContent += '<img src="../img/posts/' + response.picture + '" alt="picture" width="300px" height="300px">';
                    }
                    let time = new Date(response.date).toLocaleTimeString("en-US");
                    let date = new Date(response.date).toLocaleDateString("en-US");
                    let timestamp = '<span class="timestamp">' + date + " " + time + '</span>';
                    posts.innerHTML += '<div class="post">' + postContent + timestamp + '</div>';
                })
            }
        }
        else {
            posts.innerHTML += "<div class='post'><p style='margin-left: 260px;' class='content'>You have no posts!</p></div>";
        }
    })
}

function getFriendPosts() { //home.html
    let posts = document.getElementById("childB");
    let x = usernameFromCookie();
    let url = "/app/getProfile/" + x;
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        for (i in response.friends) {
            fetch("/app/getInfo/" + response.friends[i])
            .then( (response) => {
                return response.json();
            })
            .then( (response) => {
                let pfp = response.pfp;
                let username = response.username;
                if (response.posts.length != 0) {
                    for (let i = 0; response.posts.length != i; i++) {
                        let postId = response.posts[response.posts.length - (i + 1)];
                        fetch("/app/getPost/" + postId)
                        .then( (response) => {
                            return response.json();
                        })
                        .then( (response) => {
                            if (!response.community) {
                                let postContent = '<span class="userDetails"><img src="../img/pfp/' + pfp + '" alt="Profile Picture" width="20px" height="20px" class="postUser">';
                                postContent += "<p class='username'>" + username + "</p></span>";
                                postContent += '<p class="content">' + response.content + '</p>';
                                if (response.picture != undefined) {
                                    postContent += '<img src="../img/posts/' + response.picture + '" alt="picture" width="300px" height="300px">';
                                }
                                let time = new Date(response.date).toLocaleTimeString("en-US");
                                let date = new Date(response.date).toLocaleDateString("en-US");
                                let timestamp = '<span class="timestamp">' + date + " " + time + '</span>';
                                posts.innerHTML = '<div class="postMain">' + postContent + timestamp + '</div>' + posts.innerHTML;
                            }
                        })
                    } 
                }
            })
        }
    })
}

function getOtherUser() { //user.html
    let user = window.location.href.split("/")[5];
    document.getElementById("greeting").innerText += user;
    let otherUser = window.location.href.split("/")[5];
    document.getElementsByTagName("title")[0].innerText = otherUser;
}

function getOtherUserInfo() { //profile.html
    console.log("penis");
    let user = window.location.href.split("/")[5];
    let url = "/app/getProfile/" + user;
    fetch(url)
    .then( (response) => {
        if (response.redirected == true) {
            window.location.href = response.url;
        }
        else {
            return response.json();
        }
    })
    .then( (response) => {
        document.getElementById("nameField").innerText += " " + response.username;
        document.getElementById("ageField").innerText += " " + response.age;
        document.getElementById("genderField").innerText += " " + response.gender.toUpperCase();
    })
}

function fetchOtherPosts() { //profile.html
    let user = window.location.href.split("/")[5];
    let url = "/app/getProfile/" + user;
    let posts = document.getElementById("posts");
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        if (response.posts.length != 0) {
            let username = response.username;
            let pfp = response.pfp;
            for (i in response.posts) {
                fetch("/app/getPost/" + response.posts[i])
                .then( (response) => {
                    return response.json();
                })
                .then( (response) => {
                    if (response.community == undefined || user == usernameFromCookie()) {//here
                        let postContent = '<span class="postUser"><img src="../../img/pfp/' + pfp + '" alt="Profile Picture" width="30px" height="30px" class="postPicture">';
                        postContent += "<p class='username'>" + username + "</p></span>";
                        postContent += '<p class="content">' + response.content + '</p>';
                        if (response.picture != undefined) {
                            postContent += '<img src="../../img/posts/' + response.picture + '" alt="picture" width="300px" height="300px">';
                        }
                        let time = new Date(response.date).toLocaleTimeString("en-US");
                        let date = new Date(response.date).toLocaleDateString("en-US");
                        let timestamp = '<span class="timestamp">' + date + " " + time + '</span>';
                        posts.innerHTML += '<div class="post">' + postContent + timestamp + '</div>';
                    }
                })
            }
        }
        else {
            posts.innerHTML += "<div class='post'><p style='margin-left: 260px;' class='content'>User has no posts!</p></div>";
        }
    })
}

function fetchOtherProfilePic() { //profile.html
    let user = window.location.href.split("/")[5];
    let url = "/app/getProfile/" + user;
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        document.getElementById("pfp").innerHTML += "<img id='profilePic' src='../../img/pfp/" + response.pfp + "' alt='Your profile picture' width='450px;' height='450px'>";
    })
}

function usernameFromCookie() {
    let username = decodeURI(document.cookie).split("; ");
    for (i in username) {
        if (username[i].substring(0,5) == "login") {
            username = username[i];
        }
    }
    username = username.split("username")[1];
    username = username.split('"')[2];
    return username;
}

var numMsgs = 0;
var lastUser = "";