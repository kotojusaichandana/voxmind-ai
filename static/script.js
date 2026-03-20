let chatBox = document.getElementById("chat-box");

// Load previous chat
window.onload = () => {
    chatBox.innerHTML = localStorage.getItem("chat") || "";
};

speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
};

function addMessage(sender, text) {
    let msg = document.createElement("div");

    msg.className = sender === "You" ? "user" : "bot";
    msg.innerText = text;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    localStorage.setItem("chat", chatBox.innerHTML);
}

function showTyping() {
    let typing = document.createElement("div");
    typing.id = "typing";
    typing.className = "bot";
    typing.innerText = "Typing...";
    chatBox.appendChild(typing);
}

function removeTyping() {
    document.getElementById("typing")?.remove();
}

function sendMessage() {
    let input = document.getElementById("user-input").value;
    let mode = document.getElementById("mode").value;
    let language = document.getElementById("language").value;

    if (!input) return;

    addMessage("You", input);
    document.getElementById("user-input").value = "";

    showTyping();

    fetch("/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            message: input,
            mode: mode,
            language: language
        })
    })
    .then(res => res.json())
    .then(data => {
        removeTyping();
        addMessage("Bot", data.reply);
        speak(data.reply);
    });
}

function speak(text) {
    let avatar = document.getElementById("avatar");
    let lang = document.getElementById("language").value;

    let msg = new SpeechSynthesisUtterance(text);
    let voices = speechSynthesis.getVoices();

    // Try to find matching voice
    let selectedVoice = voices.find(voice => voice.lang === lang);

    // Fallback to similar language
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith(lang.split("-")[0]));
    }

    // Final fallback
    if (!selectedVoice) {
        selectedVoice = voices[0];
    }

    msg.voice = selectedVoice;
    msg.lang = selectedVoice.lang;

    avatar.style.transform = "scale(1.2)";

    msg.onend = () => {
        avatar.style.transform = "scale(1)";
    };

    speechSynthesis.speak(msg);
}

function startVoice() {
    let recognition = new webkitSpeechRecognition();
    recognition.lang = document.getElementById("language").value;

    recognition.onresult = function(event) {
        let text = event.results[0][0].transcript;
        document.getElementById("user-input").value = text;
        sendMessage();
    };

    recognition.start();
}

function toggleMode() {
    document.body.classList.toggle("light");
}

function clearChat() {
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    localStorage.removeItem("chat");
}