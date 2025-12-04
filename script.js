document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-dark-mode");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      const isDark = document.documentElement.classList.contains("dark");
      localStorage.setItem("darkMode", isDark ? "on" : "off");
    });
  }

  loadPoems();
});

let poemList = [];
let allLines = [];

async function loadPoems() {
  try {
    const txt = await fetch("poems.txt?update=" + Date.now()).then(r => r.text());
    const poems = txt.split("===\n").map(p => p.trim()).filter(p => p);
    poemList = poems.map((p, idx) => {
      const lines = p.split("\n").filter(l => l.trim() !== "");
      const title = lines[0] || "";
      const category = lines[1] && lines[1].startsWith("@") ? lines[1].substring(1).trim() : "";
      const contentLines = lines.slice(2);
      return { id: idx, title, category, lines: contentLines };
    });
    displayPoemList(poemList);
    extractBayt(poems);
  } catch (e) {
    console.error("خطأ في تحميل القصائد:", e);
  }
}

function displayPoemList(arr) {
  const listEl = document.getElementById("list");
  listEl.innerHTML = "";
  arr.forEach(p => {
    const a = document.createElement("a");
    a.className = "poem-card fade";
    a.href = `viewer.html?id=${p.id}`;
    a.textContent = p.title || "بدون عنوان";
    listEl.appendChild(a);
  });
}

function runSearch() {
  const term = document.getElementById("search").value.trim().toLowerCase();
  if (!term) {
    displayPoemList(poemList);
    return;
  }
  const filtered = poemList.filter(p => {
    if (p.title.toLowerCase().includes(term)) return true;
    if (p.category.toLowerCase().includes(term)) return true;
    return p.lines.some(l => l.toLowerCase().includes(term));
  });
  displayPoemList(filtered);
}

function randomPoem() {
  if (poemList.length === 0) return;
  const id = Math.floor(Math.random() * poemList.length);
  window.location.href = `viewer.html?id=${id}`;
}

function extractBayt(poems) {
  allLines = [];
  poems.forEach(poem => {
    const lines = poem.split("\n").slice(2).filter(l => l.trim() !== "");
    allLines.push(...lines);
  });
  if (allLines.length === 0) return;
  const today = new Date().getDate();
  const idx = today % allLines.length;
  const l1 = allLines[idx] || "";
  const l2 = allLines[(idx + 1) % allLines.length] || "";
  document.getElementById("todayContent").innerHTML = `${l1}<br>${l2}`;
}
