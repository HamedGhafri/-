document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-dark-mode");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      const isDark = document.documentElement.classList.contains("dark");
      localStorage.setItem("darkMode", isDark ? "on" : "off");
    });
  }
  loadPoem();
});

async function loadPoem() {
  try {
    const res = await fetch("poems.txt?update=" + Date.now());
    const text = await res.text();
    const poems = text.split("===\n").map(p => p.trim()).filter(p => p);

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id === null || isNaN(id) || id < 0 || id >= poems.length) {
      document.getElementById("title").textContent = "قصيدة غير متوفّرة";
      return;
    }

    const poemData = poems[id].split("\n");
    const title = poemData[0].trim();
    const category = poemData[1] && poemData[1].startsWith("@") ? poemData[1].substring(1).trim() : "";

    document.getElementById("title").textContent = title;
    const catEl = document.getElementById("category");
    if (catEl) catEl.textContent = category ? `📌 ${category}` : "";

    const lines = poemData.slice(2).filter(l => l.trim() !== "");
    const poemEl = document.getElementById("poem");
    let html = "";
    for (let i = 0; i < lines.length; i += 2) {
      const l1 = lines[i] || "";
      const l2 = lines[i + 1] || "";
      html += `
        <div class="bayt fade-up" style="animation-delay:${(i/2)*0.2}s">
          <div>${l1}</div>
          <div>${l2}</div>
        </div>`;
    }
    poemEl.innerHTML = html;

  } catch (error) {
    console.error("خطأ في تحميل القصيدة:", error);
  }
}
