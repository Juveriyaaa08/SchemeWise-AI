import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const showPassword = document.getElementById("showPassword");
const password = document.getElementById("password");

// Show/Hide password
showPassword.addEventListener("change", () => {
    password.type = showPassword.checked ? "text" : "password";
});

// LOGIN FORM
document.getElementById("loginForm").addEventListener("submit", (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const passwordValue = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, passwordValue)
        .then((userCredential) => {

            const user = userCredential.user;

            // ✅ IMPORTANT: login flag (assistant ke liye)
            localStorage.setItem("userLoggedIn", "true");

            // ✅ user data store (assistant greeting ke liye)
            localStorage.setItem("userEligibility", JSON.stringify({
                name: user.email.split("@")[0],
                email: user.email,
                uid: user.uid
            }));

            alert("Login Successful! 🎉");

            window.location.href = "dashboard.html";

        })
        .catch((error) => {

            alert("Login Failed: " + error.message);

        });

});