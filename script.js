const DEFAULT_WORDS = [
  { jp: "食べる", hira: "たべる", zh: "吃", pos: "Verb" },
  { jp: "飲む", hira: "のむ", zh: "喝", pos: "Verb" },
  { jp: "行く", hira: "いく", zh: "去", pos: "Verb" },
  { jp: "見る", hira: "みる", zh: "看", pos: "Verb" },
  { jp: "聞く", hira: "きく", zh: "听", pos: "Verb" },
];

const STORAGE_KEY = "jp-memorizer-words-v1";
let words = loadStoredWords();
let index = 0;
let revealed = false;

const jpText = document.getElementById("jpText");
const hiraganaText = document.getElementById("hiraganaText");
const meaningText = document.getElementById("meaningText");
const posText = document.getElementById("posText");
const details = document.getElementById("details");
const counterText = document.getElementById("counterText");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const learnBtn = document.getElementById("learnBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const showAllBtn = document.getElementById("showAllBtn");
const sidePanel = document.getElementById("sidePanel");
const closePanelBtn = document.getElementById("closePanelBtn");
const allWordsList = document.getElementById("allWordsList");

function loadStoredWords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORDS.slice();
    const parsed = JSON.parse(raw);
    return normalizeWordArray(parsed);
  } catch {
    return DEFAULT_WORDS.slice();
  }
}

function saveWords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function normalizeWordArray(input) {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("JSON must be a non-empty array.");
  }

  return input.map((item, i) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Item ${i + 1} must be an object.`);
    }

    const jp = String(item.jp ?? "").trim();
    const hira = String(item.hira ?? "").trim();
    const zh = String(item.zh ?? "").trim();
    const pos = String(item.pos ?? "").trim();

    if (!jp || !hira || !zh || !pos) {
      throw new Error(
        `Item ${i + 1} must include jp, hira, zh, and pos fields.`
      );
    }

    return { jp, hira, zh, pos };
  });
}

function clampIndex(i) {
  return ((i % words.length) + words.length) % words.length;
}

function setRevealed(nextRevealed) {
  revealed = nextRevealed;
  details.hidden = !revealed;
}

function renderAllWordsPanel() {
  allWordsList.innerHTML = "";

  words.forEach((w, i) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "wordLine";
    row.textContent = `${i + 1}. ${w.jp} (${w.hira}) / ${w.zh} / ${w.pos}`;
    row.addEventListener("click", () => {
      index = i;
      sidePanel.hidden = true;
      render();
    });
    allWordsList.appendChild(row);
  });
}

function render() {
  const w = words[index];
  jpText.textContent = w.jp;
  hiraganaText.textContent = w.hira;
  meaningText.textContent = w.zh;
  posText.textContent = w.pos;
  counterText.textContent = `${index + 1} / ${words.length}`;

  // Always hide details when moving to a new word.
  setRevealed(false);
  renderAllWordsPanel();
}

previousBtn.addEventListener("click", () => {
  index = clampIndex(index - 1);
  render();
});

nextBtn.addEventListener("click", () => {
  index = clampIndex(index + 1);
  render();
});

learnBtn.addEventListener("click", () => {
  setRevealed(true);
});

uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    words = normalizeWordArray(parsed);
    index = 0;
    saveWords();
    render();
    alert(`Loaded ${words.length} words successfully.`);
  } catch (error) {
    alert(`Invalid JSON file: ${error.message}`);
  } finally {
    fileInput.value = "";
  }
});

showAllBtn.addEventListener("click", () => {
  sidePanel.hidden = false;
});

closePanelBtn.addEventListener("click", () => {
  sidePanel.hidden = true;
});

render();

