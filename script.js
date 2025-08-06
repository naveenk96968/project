const container = document.querySelector(".container");
const chatscontainer = document.querySelector(".chats-container");
const promptFrom = document.querySelector(".prompt-form");
const promptInput = promptFrom.querySelector(".prompt-input");
const themeToggle = document.querySelector("#theme-toggle-btn");


const API_KEY = 'AIzaSyAclGu-wXs27TXE5AzNFsS2dss4LsTV_Sw';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAclGu-wXs27TXE5AzNFsS2dss4LsTV_Sw';

let typingInterval, controller;
const chatHistory = [];
const userData = {message: " "};

const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const scrollToBottom = () => {
    container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
    });
};

const typingEffert = (text, textElement, botMsgDiv) =>{
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;
    
    typingInterval = setInterval(() => {
        if(wordIndex < words.length){
            textElement.textContent += (wordIndex === 0 ? "": " ") + words[wordIndex++];
            botMsgDiv.classList.remove("loading");
            scrollToBottom();
        }else{
            clearInterval(typingInterval);

        }
    }, 40)
}

const generateResponse = async(botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");
    controller = new AbortController();
    chatHistory.push({
        role: "user",
        parts: [{text: userMessage}]
    });

    try{
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ contents:chatHistory }),
            signal: controller.signal
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

    const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
    typingEffert(responseText, textElement, botMsgDiv);


    } catch (error) {
        textElement.style.color = "#d62939";
        textElement.textContent = error.name === "AbortError" ? "Response generation stopped." : error.message;
        botMsgDiv.classList.remove("loading");
    }
}

const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage || document.body.classList.contains("bot-responding")) return;

    promptInput.value = "";
    document.body.classList.add("chats-active");

    const userMsgHTML = '<p class="message-text"></p>';
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatscontainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() =>{
      const botMsgHTML = '<img src="C:/Users/navee/OneDrive/Desktop/gemini-chatbot-logo.svg " class="avatar"><p class="message-text">just a sec...!</p>';
      const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
      chatscontainer.appendChild(botMsgDiv);
      generateResponse(botMsgDiv);
      scrollToBottom();
    },600);
}

document.querySelector("#stop-response-btn").addEventListener("click", () => {
    userMsgDiv = {};
    controller?.abort();
    clearInterval(typingInterval);
});

document.querySelector("#delete-chat-btn").addEventListener("click", ()=> {
    chatHistory.length= 0;
    chatscontainer.innerHTML = "";
    document.body.classList.remove("bot-responding", "chats-active");
});

document.querySelectorAll(".suggestions-item").forEach(item => {
    item.addEventListener("click", () => {
        promptInput.value = item.querySelector(".text").textContent;
        promptFrom.dispatchEvent(new Event("submit"));
    });
});

document.addEventListener("click", ({target}) => {
    const wrapper = document.querySelector(".prompt-wrapper");
    const shouldHide = target.classList.contains("prompt-input") || (wrapper.classList.contains("hide-controls") && (target.id === "stop-response-btn       "));
    wrapper.classList.toggle("hide-controls", shouldHide);
});

themeToggle.addEventListener("click", () => {
 const isLightTheme = document.body.classList.toggle("light-theme");
 localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
 themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
});

const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
 themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";

promptFrom.addEventListener("submit", handleFormSubmit);