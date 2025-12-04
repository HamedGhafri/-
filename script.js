function updateDarkModeIcon() {
  const iconEl = document.getElementById("dark-mode-icon");
  if (!iconEl) return;
  iconEl.textContent = document.documentElement.classList.contains("dark") ? '☀️' : '🌙';
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-dark-mode");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem('darkMode', document.documentElement.classList.contains('dark') ? 'on' : 'off');
      updateDarkModeIcon();
    });
  }
  updateDarkModeIcon();
  loadPoems();
});

let poemList = [];
let allLines = [];

async function loadPoems() {
  try {
    const txt = await fetch("poems.txt?update=" + Date.now()).then(r => r.text());
    const poems = txt.split("===\n").map(p => p.trim()).filter(p => p);

    poemList = poems.map((p, idx) => {
      const linesAll = p.split("\n");
      const title = linesAll[0].trim();
      const category = linesAll[1] && linesAll[1].startsWith("@")
        ? linesAll[1].substring(1).trim()
        : "";
      const contentLines = linesAll.slice(2).filter(l => l.trim() !== "");
      return { id: idx, title, category, lines: contentLines };
    });

    displayPoemList(poemList);
    extractBayt(allLinesFromPoems(poemList));
  } catch (e) {
    console.error("خطأ في تحميل القصائد:", e);
  }
}

function allLinesFromPoems(plist) {
  const arr = [];
  plist.forEach(p => {
    arr.push(...p.lines);
  });
  return arr;
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

function extractBayt(linesArr) {
  allLines = linesArr;
  if (allLines.length === 0) return;
  const today = new Date().getDate();
  const idx = today % allLines.length;
  const l1 = allLines[idx] || "";
  const l2 = allLines[(idx + 1) % allLines.length] || "";
  document.getElementById("todayContent").innerHTML = `${l1}<br>${l2}`;
}
