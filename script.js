const themeToogle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "hf_mkPdnVKegUUqefPPPkEizSpLsUTxwNQgWThf_FualenffSQSkQuHvlXcMENhARHgJMlKMua";

const examplePrompts = [
    "a magic forest",
    "an old steamounk",
    "a dragon",
];

(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToogle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToogle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split(":").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

    return { width: calculatedWidth, height: calculatedHeight };
};

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
    const { width, height } = getImageDimensions(aspectRatio);

    const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
        const card = document.getElementById(`img-card-${i}`);
        try {
            const response = await fetch(MODEL_URL, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: { width, height },
                    options: { wait_for_model: true, use_cache: false },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error || "Generation failed.");
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            card.classList.remove("loading");
            card.innerHTML = `
                <img src="${imageUrl}" class="result-img">
                <div class="img-overlay">
                    <button class="img-download-btn" onclick="downloadImage('${imageUrl}')">
                        <i class="fa-solid fa-download"></i>
                    </button>
                </div>
            `;
        } catch (error) {
            console.error(error);
            card.classList.remove("loading");
            card.classList.add("error");
            card.querySelector(".status-text").textContent = error.message || "Failed to generate.";
        }
    });

    await Promise.allSettled(imagePromises);
};

const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = "";

    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML += `
            <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                <div class="status-container">
                    <div class="spinner"></div>
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p class="status-text">Generating....</p>
                </div>
                <img src="test.png" class="result-img">
            </div>`;
    }

    generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

const handleFormSubmit = (e) => {
    e.preventDefault();

    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "16:9";
    const promptText = promptInput.value.trim();

    createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);

// Fix typo in event listener
themeToogle.addEventListener("click", toggleTheme);

// Add download function globally
function downloadImage(url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
