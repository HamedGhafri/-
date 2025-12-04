// تفعيل الوضع الليلي من التخزين المحلي فورًا
(function() {
  if (localStorage.getItem("darkMode") === "on") {
    document.documentElement.classList.add("dark");
  }
})();

// مستمع لزر الوضع الليلي في صفحة العرض
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-dark-mode");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      const isDark = document.documentElement.classList.contains("dark");
      localStorage.setItem("darkMode", isDark ? "on" : "off");
    });
  }
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
    const title = poemData[0] || "";
    const category = poemData[1] ? poemData[1].replace("@", "").trim() : "";

    // عرض العنوان والتصنيف
    document.getElementById("title").textContent = title;
    const categoryEl = document.getElementById("category");
    if (categoryEl) {
      categoryEl.textContent = category ? `📌 ${category}` : "";
    }

    // جمع الأبيات
    const lines = poemData.slice(2).filter(line => line.trim() !== "");
    const poemEl = document.getElementById("poem");
    if (poemEl) {
      let html = "";
      lines.forEach((line, idx) => {
        html += `<div class="bayt fade-up" style="animation-delay:${idx * 0.1}s">${line}</div>`;
      });
      poemEl.innerHTML = html;
    }
  } catch (error) {
    console.error("حدث خطأ أثناء تحميل القصيدة:", error);
  }
}

loadPoem();
