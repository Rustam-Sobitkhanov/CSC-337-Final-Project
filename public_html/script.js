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

function greetUser() { //home.html
    let x = decodeURI(document.cookie).split("; ");
    for (i in x) {
        if (x[i].substring(0,5) == "login") {
            x = x[i];
        }
    }
    x = x.split("username")[1];
    x = x.split('"')[2];
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
        document.getElementById("pfp").innerHTML += "<img src='../img/pfp/" + response + "' alt='Your profile picture' width='450px;' height='450px'>";
    })
}

function goHome() { //all html files in "app" directory
    window.location.href = window.location.origin + "/app/home.html";
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
                document.getElementById("friends").innerHTML += "<div' class='user'><img src='../img/pfp/" + response.pfp + "' alt='ProfilePicture' width='50px' height='50px'><p class='username'>" +response.username + "</p></div>";
            })
        }
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
                    document.getElementById("friendRequests").innerHTML += "<div' class='user'><img src='../img/pfp/" + response.pfp + "' alt='ProfilePicture' width='50px' height='50px'><p class='username'>" +response.username + "</p><button class='accept' id='" + response._id + "' onclick='acceptRequest(this)'>Accept</button></div><br>";
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
    window.location.reload();
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
        if (response.length == 0) {
            document.getElementById("searchResults").innerHTML = "<h3>No results were returned</h3>";
            return;
        }
        let results = [];
        if (document.getElementById("user").checked) {
            for (i in response) {
                document.getElementById("searchResults").innerHTML += "<div><img src='../img/pfp/" + response[i].pfp + "' alt='ProfilePicture' width='50px' height='50px'><p>" +response[i].username + "</p></div>";
            }
        }
        else {
            for (i in response) {
                document.getElementById("searchResults").innerHTML += "<div style='border: 1px solid black; margin-top: 10px; margin-bottom: 10px;'><img src='../img/communities/" + response[i].picture + "' alt='ProfilePicture' width='50px' height='50px'><h3><a href='community/" + response[i]._id + "'>" + response[i].name + "</a></h3><p>" + response[i].description + "</p></div>";
            }
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
        window.location.href = window.location.origin + "/app/home.html";
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
        if (response == "Created Community!") {
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
        console.log(response);
        document.getElementsByTagName("title")[0].innerText += response.name;
        document.getElementsByTagName("body")[0].innerHTML = "<img src='../../img/communities/" + response.picture + "' alt='Community Picture' width='200px' height='200px'>" + document.getElementsByTagName("body")[0].innerHTML;
        document.getElementById("title").innerText = response.name;
        document.getElementById("desc").innerText = response.description;
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
            document.getElementsByTagName("body")[0].innerHTML += "<button onclick='joinCommunity(this)' id=" + response + ">Join</button>"
        }
        document.getElementsByTagName("body")[0].innerHTML += '<div><button onclick="goHome()">Return</button></div>';
    })
}

function joinCommunity(button) {
    let url = "/app/joinCommunity";
    let data = {communityId: button.id};
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

function getChats() { //chat.html
    let otherUser = window.location.href.split("/")[5];
    let url = "/app/getChat/" + otherUser;
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
            document.getElementById("inputMessage").innerHTML = '<button onclick="goHome()">Return</button>';
            return response.msg;
        }
        else {
            var messages = [];
            if (numMsgs != response.length) {
                for (let i = numMsgs; i < response.length; i++) {
                    numMsgs += 1;
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
                        if (numMsgs == response.length) {
                            messages.sort();
                            for (i in messages) {
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

function checkEmptyMsg() {
    if (document.getElementById("message").value.trim() == "" && document.getElementById("img").files.length == 0) {
        document.getElementById("button").innerHTML = '<button type="submit" disabled="disabled">Send message</button>';
    }
    else {
        document.getElementById("button").innerHTML = '<button type="submit" onclick="sendMessage()">Send message</button>';
    }
}

function sendMessage() {
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

var numMsgs = 0;
var lastUser = "";