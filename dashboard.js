import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const username = document.getElementById("username");

// Check Login
onAuthStateChanged(auth, (user) => {

    if (user) {

        username.innerHTML = user.email;

    } else {

        window.location.href = "login.html";

    }

});

// Logout
document.getElementById("logout").addEventListener("click", () => {

    signOut(auth).then(() => {

        window.location.href = "login.html";

    });

});

// =========================
// Previous Search History
// =========================

const history = JSON.parse(localStorage.getItem("schemeHistory")) || [];

const historyList = document.getElementById("historyList");

if (historyList) {

    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="alert alert-info text-center">
                No previous searches found.
            </div>
        `;

    } else {

        historyList.innerHTML = history.map((item, index) => `

            <div class="card mb-3 shadow-sm">

                <div class="card-body">

                    <h6 class="text-primary">
                        Search ${index + 1}
                    </h6>

                    <small class="text-muted">
                        ${item.date}
                    </small>

                    <hr>

                    <button
                        class="btn btn-primary btn-sm w-100 mb-2"
                        onclick="toggleHistory(${index})">

                        View Result

                    </button>

                    <div
                        id="history-${index}"
                        style="display:none;white-space:pre-wrap;max-height:250px;overflow:auto;">

                        ${item.data || item.schemes}

                    </div>

                </div>

            </div>

        `).join("");

    }

}

// Toggle History
window.toggleHistory = function (index) {

    const box = document.getElementById(`history-${index}`);

    if (box.style.display === "none") {

        box.style.display = "block";

    } else {

        box.style.display = "none";

    }

};

// Clear History
const clearBtn = document.getElementById("clearHistory");

if (clearBtn) {

    clearBtn.addEventListener("click", () => {

        if (confirm("Are you sure you want to clear all history?")) {

            localStorage.removeItem("schemeHistory");

            location.reload();

        }

    });
   
}