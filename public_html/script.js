function login() {
    let u = document.getElementById("username").value;
    let p = document.getElementById("password").value;
    let url = "/login/" + u + "/" + p;
    fetch(url)
    .then( (response) => {
        console.log(response);
    })
    .catch( (err) => {
        console.log("Error logging in: " + err);
    })
}

function createAccount() {
    let u = document.getElementById("username").value;
    let p = document.getElementById("password").value;
    if (u.trim() == "" || p.trim() == "") {
        document.getElementById("status").innerText = "Fields cannot be empty!";
    }
    else {
        let data = {username: u, password, p};
        let url = "/createAccount/" + u + "/" + p;
        fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
    }
}

function goToLogin() {
    window.location.href = window.location.origin;
}