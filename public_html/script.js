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
    if (u.trim() == "" || p.trim() == "") {
        document.getElementById("status").innerText = "Fields cannot be empty!";
    }
    else if (u.split(" ").length > 1) {
        document.getElementById("status").innerText = "Username cannot have a space in it!";   
    }
    else {
        let data = {username: u, password: p};
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
        if (response == "") {
            document.getElementById("pfp").innerHTML += "<img src='../img/default.png' alt='Your profile picture' width='450px' height='450px'>";
        }
        else {
            document.getElementById("pfp").innerHTML += "<img src='../img/" + response + "' alt='Your profile picture' width='450px;' height='450px'>";
        }
    })
}

function goHome() { //return to homepage
    window.location.href = window.location.origin + "/app/home.html";
}

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
                console.log("Incoming request from: " + response.username);
            })
        }
    })
}

function sendFriendRequest() {
    let data = {toUser: document.getElementById("toUser").value};
    let url = "/app/sendFriendRequest/";
    console.log(url);
    fetch(url,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
}