document
.getElementById("eligibilityForm")
.addEventListener("submit", function (e) {

    e.preventDefault();

    const userData = {

        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        state: document.getElementById("state").value,
        occupation: document.getElementById("occupation").value,
        income: document.getElementById("income").value,
        education: document.getElementById("education").value,
        category: document.getElementById("category").value,
        disability: document.getElementById("disability").value

    };

    // Save data locally
    localStorage.setItem(
        "userEligibility",
        JSON.stringify(userData)
    );

    // Go to Result Page
    window.location.href = "result.html";

});