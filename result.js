// ============================================================================
// SchemeWise AI - Eligibility Result Processor (js/result.js)
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. LocalStorage se user eligibility details nikalna
    const user = JSON.parse(localStorage.getItem("userEligibility")) || null;
    const userDetailsContainer = document.getElementById("userDetails");
    const schemeResultContainer = document.getElementById("schemeResult");

    if (!user) {
        if (userDetailsContainer) {
            userDetailsContainer.innerHTML = `<div class="alert alert-warning">No user details found. Please fill the form again.</div>`;
        }
        if (schemeResultContainer) {
            schemeResultContainer.innerHTML = `<div class="alert alert-danger">Cannot fetch schemes without profile metrics.</div>`;
        }
        return;
    }

    // 2. Left Side Table me User Profile Details render karna
    if (userDetailsContainer) {
        userDetailsContainer.innerHTML = `
            <table class="table table-sm table-bordered mb-0">
                <tbody>
                    <tr><td class="fw-bold bg-light" style="width: 35%;">Name</td><td>${user.name || "N/A"}</td></tr>
                    <tr><td class="fw-bold bg-light">Age</td><td>${user.age || "N/A"}</td></tr>
                    <tr><td class="fw-bold bg-light">Gender</td><td>${user.gender || "N/A"}</td></tr>
                    <tr><td class="fw-bold bg-light">State</td><td>${user.state || "N/A"}</td></tr>
                    <tr><td class="fw-bold bg-light">Occupation</td><td>${user.occupation || "N/A"}</td></tr>
                    <tr><td class="fw-bold bg-light">Income</td><td>₹${user.income || "N/A"}</td></tr>
                    <tr><td class="fw-bold bg-light">Education</td><td>${user.education || "N/A"}</td></tr>
                    <tr><td class="fw-bold bg-light">Category</td><td>${user.category || "N/A"}</td></tr>
                    <tr><td class="fw-bold bg-light">Disability</td><td>${user.disability || "No"}</td></tr>
                </tbody>
            </table>
        `;
    }

    // 3. Payload ready karna n8n webhook dispatch ke liye
    const payload = {
        message: "Fetch eligible government schemes based on my profile.",
        history: [],
        userProfile: {
            name: user.name || "",
            age: user.age || "",
            gender: user.gender || "",
            state: user.state || "",
            occupation: user.occupation || "",
            income: user.income || "",
            education: user.education || "",
            category: user.category || "",
            disability: user.disability || "No"
        }
    };

    // 4. n8n Webhook API hit karna
    fetch("http://localhost:5678/webhook/schemewise-ai", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            return response.text();
        }
    })
    .then(data => {
        // 5. Response object se response text nikalna
        let aiResponse = "";
        if (typeof data === "string") {
            aiResponse = data;
        } else if (data.output) {
            aiResponse = data.output;
        } else if (data.response) {
            aiResponse = data.response;
        } else {
            aiResponse = JSON.stringify(data, null, 2);
        }

        if (!aiResponse.trim()) {
            aiResponse = "Successfully connected, but no schemes data returned from AI workflow.";
        }

        // 6. Spinner hata kar content render karna (Markdown compatibility ke liye breaks add kiye hain)
        if (schemeResultContainer) {
            // Formatting clean karne ke liye transitions lagana
            const formattedResponse = aiResponse
                .replace(/\n/g, "<br>")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Bold support

            schemeResultContainer.innerHTML = `
                <div class="p-2 raw-scheme-md">
                    ${formattedResponse}
                </div>
            `;
        }
    })
    .catch(error => {
        console.error("Fetch Error:", error);
        if (schemeResultContainer) {
            schemeResultContainer.innerHTML = `
                <div class="alert alert-danger role="alert"">
                    <i class="fa-solid fa-triangle-exclamation me-2"></i>
                    <strong>Error:</strong> Failed to load data from server.<br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    });
});