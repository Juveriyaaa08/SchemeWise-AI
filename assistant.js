// ============================================================================
// SchemeWise AI Assistant - Consolidated Production Engine
// ============================================================================

// --- UI & Lifecycle Elements ---
const assistant = document.getElementById("assistantContainer");
const floatingBtn = document.getElementById("assistantFloatingBtn");
const closeBtn = document.getElementById("closeAssistant");
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const userName = document.getElementById("userName");
const voiceAnimation = document.getElementById("voiceAnimation");

let isOpen = true;
let conversationHistory = [];

// --- User Extraction & State ---
const user = JSON.parse(localStorage.getItem("userEligibility")) || {};
const isLoggedIn = localStorage.getItem("userLoggedIn");
userName.innerText = user.name || "User";

// --- Inject Controls Panel Safely ---
const controlPanel = document.createElement("div");
controlPanel.className = "assistant-controls px-3 py-2 d-flex justify-content-between align-items-center border-bottom bg-light";
controlPanel.style.gap = "8px";
controlPanel.innerHTML = `
    <button id="clearChatBtn" class="btn btn-sm btn-outline-secondary" title="Clear Chat Memory">
        <i class="fa-solid fa-trash-can"></i> Reset Conversation
    </button>
    <button id="stopVoiceBtn" class="btn btn-sm btn-outline-danger" title="Stop AI Voice Output" style="display: none;">
        <i class="fa-solid fa-volume-xmark"></i> Stop Voice
    </button>
`;

if (assistant && chatBox) {
    assistant.insertBefore(controlPanel, chatBox);
}

const clearChatBtn = document.getElementById("clearChatBtn");
const stopVoiceBtn = document.getElementById("stopVoiceBtn");

// ==========================================
// CORE UI FUNCTIONS
// ==========================================

function scrollBottom() {
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}

function addUserMessage(message) {
    const div = document.createElement("div");
    div.className = "user-message";
    div.innerHTML = message;
    chatBox.appendChild(div);
    scrollBottom();
}

function showTyping() {
    const typing = document.createElement("div");
    typing.className = "assistant-message";
    typing.id = "typing";
    typing.innerHTML = `<span>.</span><span>.</span><span>.</span>`;
    chatBox.appendChild(typing);
    scrollBottom();
}

function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

// ==========================================
// ADVANCED SPEECH SYNTHESIS ENGINE
// ==========================================

function speak(text) {
    // 1. Filter layout elements out of string sequence
    let cleanText = text
        .replace(/<[^>]+>/g, "") 
        .replace(/[\*\#\_]/g, "") 
        .replace(/•/g, "") 
        .trim();

    if (!cleanText) return;

    window.speechSynthesis.cancel();

    // 2. Fragment speech arrays cleanly around sentence boundaries to avoid buffer timeouts
    const executionChunks = cleanText.match(/[^.!?]+[.!?]*|.{1,200}/g) || [cleanText];
    let chunkIndex = 0;

    function processSpeechQueue() {
        if (chunkIndex >= executionChunks.length) {
            if (voiceAnimation) voiceAnimation.style.display = "none";
            if (stopVoiceBtn) stopVoiceBtn.style.display = "none";
            return;
        }

        const processingChunk = executionChunks[chunkIndex].trim();
        if (!processingChunk) {
            chunkIndex++;
            processSpeechQueue();
            return;
        }

        const utterInstance = new SpeechSynthesisUtterance(processingChunk);
        utterInstance.lang = "en-IN";
        utterInstance.rate = 1;
        utterInstance.pitch = 1;

        utterInstance.onstart = () => {
            if (voiceAnimation) voiceAnimation.style.display = "flex";
            if (stopVoiceBtn) stopVoiceBtn.style.display = "inline-block";
        };

        utterInstance.onend = () => {
            chunkIndex++;
            processSpeechQueue();
        };

        utterInstance.onerror = (err) => {
            console.error("Buffer Audio Execution Failure:", err);
            chunkIndex++;
            processSpeechQueue();
        };

        const standardVoices = window.speechSynthesis.getVoices();
        const preferredVoiceProfile = standardVoices.find(v => v.lang.includes("en"));
        if (preferredVoiceProfile) {
            utterInstance.voice = preferredVoiceProfile;
        }

        window.speechSynthesis.speak(utterInstance);
    }

    processSpeechQueue();
}

// Native voice cache prep
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// Unified application UI print output + vocalized execution hook
function addAssistantMessage(message) {
    const div = document.createElement("div");
    div.className = "assistant-message";
    div.innerHTML = message;
    chatBox.appendChild(div);
    scrollBottom();

    // Trigger Speech synthesis pipeline smoothly
    speak(message);
}

// ==========================================
// VOICE RECOGNITION (STT) ENGINE
// ==========================================

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        if (voiceAnimation) voiceAnimation.style.display = "flex";
        micBtn.style.background = "#dc3545";
        micBtn.innerHTML = `<i class="fa-solid fa-stop"></i>`;
        addAssistantMessage("🎤 Listening...");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        sendMessage();
    };

    recognition.onend = () => {
        if (voiceAnimation) voiceAnimation.style.display = "none";
        micBtn.style.background = "#2563eb";
        micBtn.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
    };

    recognition.onerror = (event) => {
        if (voiceAnimation) voiceAnimation.style.display = "none";
        micBtn.style.background = "#2563eb";
        micBtn.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
        addAssistantMessage("❌ I couldn't hear you clearly. Please try again.");
    };
}

// ==========================================
// CLIENT-SERVER DISPATCH PIPELINE
// ==========================================

function sendMessage() {
    const message = input.value.trim();
    if (message === "") return;

    addUserMessage(message);
    input.value = "";
    showTyping();

    const payload = {
        message: message,
        history: conversationHistory,
        userProfile: {
            name: user.name || "User",
            age: user.age || "",
            gender: user.gender || "",
            state: user.state || "",
            occupation: user.occupation || "",
            income: user.income || "",
            education: user.education || "",
            category: user.category || "",
            disability: user.disability || ""
        }
    };

    fetch("http://localhost:5678/webhook/schemewise-ai", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            return response.text();
        }
    })
    .then((data) => {
        removeTyping();
        
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
            aiResponse = "I connected successfully but couldn't parse a response layout. Please check your workflow nodes.";
        }

        conversationHistory.push({ role: "user", text: message });
        conversationHistory.push({ role: "assistant", text: aiResponse });

        if (conversationHistory.length > 20) {
            conversationHistory.splice(0, 2);
        }

        addAssistantMessage(aiResponse);
    })
    .catch((error) => {
        removeTyping();
        console.error("Chat Execution Error:", error);
        addAssistantMessage(
            `❌ Something went wrong while processing your request.<br><br><small class="text-danger">${error.message}</small>`
        );
    });
}

// ==========================================
// INTERACTIVE COMPONENT LISTENERS
// ==========================================

// Global Welcome Template
const greeting = `
Hello ${user.name || "User"} 👋<br><br>
Welcome to SchemeWise AI.<br>
I am your Government Scheme Assistant.<br><br>
I can help you with:<br>
• Scholarships<br>
• Government Schemes<br>
• Loans<br>
• Agriculture Schemes<br>
• Women Schemes<br>
• Startup Support<br>
• Required Documents<br>
• Application Process<br><br>
What would you like to know today?
`;

// Open Container Actions
floatingBtn.addEventListener("click", () => {
    assistant.style.display = "flex";
    floatingBtn.style.display = "none";
    isOpen = true;
    setTimeout(() => { if (input) input.focus(); }, 300);
});

// Close Container Actions
closeBtn.addEventListener("click", () => {
    assistant.style.display = "none";
    floatingBtn.style.display = "block";
    isOpen = false;
});

// Primary Input Controls
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

sendBtn.addEventListener("click", sendMessage);

micBtn.addEventListener("click", () => {
    if (!recognition) {
        alert("Speech Recognition is not supported in this browser.");
        return;
    }
    recognition.start();
});

// Chat quick recommendation buttons hook
document.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", () => {
        input.value = button.innerText;
        sendMessage();
    });
});

// Stop Voice Explicit Controller
if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener("click", () => {
        window.speechSynthesis.cancel();
        if (voiceAnimation) voiceAnimation.style.display = "none";
        stopVoiceBtn.style.display = "none";
    });
}

// Explicit Session Remake Handler
if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset the conversation context?")) {
            window.speechSynthesis.cancel();
            conversationHistory = [];
            chatBox.innerHTML = "";
            if (voiceAnimation) voiceAnimation.style.display = "none";
            if (stopVoiceBtn) stopVoiceBtn.style.display = "none";
            
            showTyping();
            setTimeout(() => {
                removeTyping();
                addAssistantMessage(greeting);
            }, 800);
        }
    });
}

// Page Context State Defuse Lifecycle Guard
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        window.speechSynthesis.cancel();
        if (voiceAnimation) voiceAnimation.style.display = "none";
        if (stopVoiceBtn) stopVoiceBtn.style.display = "none";
    }
});

// Init Trigger Sequence
if (isLoggedIn === "true") {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            addAssistantMessage(greeting);
        }, 800);
    });
}

console.log("🚀 SchemeWise AI Assistant Workflow Engine initialized successfully.");