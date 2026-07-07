import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ---------------------------
// User Data
// ---------------------------

const userData = JSON.parse(localStorage.getItem("userEligibility")) || {};
const history = JSON.parse(localStorage.getItem("schemeHistory")) || [];

// ---------------------------
// Firebase Auth
// ---------------------------

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("email").textContent = user.email;

});

// ---------------------------
// Personal Information
// ---------------------------

document.getElementById("name").textContent =
    userData.name || "Guest User";

document.getElementById("assistantName").textContent =
    userData.name || "User";

document.getElementById("nameInfo").textContent =
    userData.name || "-";

document.getElementById("age").textContent =
    userData.age || "-";

document.getElementById("gender").textContent =
    userData.gender || "-";

document.getElementById("occupation").textContent =
    userData.occupation || "-";

document.getElementById("occupationInfo").textContent =
    userData.occupation || "-";

document.getElementById("education").textContent =
    userData.education || "-";

document.getElementById("income").textContent =
    userData.income
        ? `₹${Number(userData.income).toLocaleString("en-IN")}`
        : "-";

document.getElementById("state").textContent =
    userData.state || "-";

document.getElementById("category").textContent =
    userData.category || "-";

document.getElementById("disability").textContent =
    userData.disability || "-";

// ---------------------------
// Statistics
// ---------------------------

document.getElementById("searchCount").textContent =
    history.length;

document.getElementById("assistantSearchCount").textContent =
    history.length;

// ---------------------------
// Profile Completion
// ---------------------------

const fields = [
    "name",
    "age",
    "gender",
    "state",
    "occupation",
    "income",
    "education",
    "category",
    "disability"
];

let completed = 0;

fields.forEach(field => {
    if (
        userData[field] !== undefined &&
        userData[field] !== null &&
        userData[field] !== ""
    ) {
        completed++;
    }
});

const completion = Math.round((completed / fields.length) * 100);

// ---------------------------
// AI Assistant Message
// ---------------------------

const assistantCard = document.querySelector(".card-body");

if (assistantCard) {

    const msg = document.createElement("div");

    msg.className = "alert alert-info mt-3";

    msg.innerHTML = `
        <h5>🤖 AI Insights</h5>

        <p>

        Your profile is <strong>${completion}% complete</strong>.

        </p>

        <p>

        You have performed <strong>${history.length}</strong> eligibility checks.

        </p>

        <p>

        Complete your profile to receive even more accurate
        government scheme recommendations.

        </p>
    `;

}

// ---------------------------
// Logout
// ---------------------------

document.getElementById("logout").addEventListener("click", () => {

    signOut(auth)
        .then(() => {

            window.location.href = "login.html";

        })
        .catch(error => {

            console.error(error);

            alert("Logout failed!");

        });

});