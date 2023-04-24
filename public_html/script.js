function loginUser() {
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

function createAccount() {
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

function goToLogin() {
    window.location.href = window.location.origin;
}

function greetUser() {
    document.getElementById("greeting").innerText += " " + decodeURI(document.cookie.split("username")[1]).split('"')[2];
}

function logout() {
    let url = "/logout";
    fetch(url, 
        {
            method: "POST"
        })
    window.location.href = window.location.origin;
}

function setProfilePic() {
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

function removeProfilePic() {
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

function fetchProfilePic() { //fetch pfp from db
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

function goHome() { //return to homepage
    window.location.href = window.location.origin + "/app/home.html";
}

//need to incorporate this function somewhere to get user's friends
function getFriends() {
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
                console.log(response);
            })
        }
    })
}

function getFriendRequests() {
    let url = "/app/getFriendRequests";
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
                document.getElementById("friendRequests").innerHTML += "<span><p>" + response.username + "</p><button id='" + response._id + "' onclick='acceptRequest(this)'>Accept</button></span><br>";
            })
        }
    })
}

function sendFriendRequest() {
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

function acceptRequest(button) {
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

function search() {
    if (document.getElementById("query").value.trim() == "") {
        alert("Please input something in the search field");
        return;
    }
    if (!(document.getElementById("user").checked || document.getElementById("post").checked)) {
        alert("Please select a search option");
        return;
    }
    let url = "/app/search/";
    if (document.getElementById("user").checked) {
        url += "user/";
    }
    else {
        url += "post/";
    }
    url += document.getElementById("query").value;
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        console.log(response);
        let results = [];
        if (document.getElementById("user").checked) {
            for (i in response) {
                document.getElementById("searchResults").innerHTML += "<div><img src='../img/pfp/" + response[i].pfp + "' alt='ProfilePicture width='200px' height='200px'>" + response[i].username + "</div>";
            }
        }
        else {
            let posts = [];
            for (i in response) {
                results.push(response[i].content);
            }
        }

        console.log(results);
    })
}

function checkEmptyPostContent() {
    if (document.getElementById("postContent").value.trim() == "") {
        document.getElementById("submitButton").innerHTML = '<button type="button" disabled="disabled">Post</button>';
    }
    else {
        document.getElementById("submitButton").innerHTML = '<button type="button" onclick="post()">Post</button>';
    }
}

function post() {
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