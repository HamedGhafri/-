// تفعيل الوضع الليلي من التخزين المحلي
(function() {
  if (localStorage.getItem("darkMode") === "on") {
    document.documentElement.classList.add("dark");
  }
})();

// تفعيل زر الوضع الليلي عند وجوده
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

// تحميل القصيدة بناءً على التنسيق الذي وضحته
async function loadPoem() {
  try {
    const res = await fetch("poems.txt?update=" + Date.now());
    const text = await res.text();
    // تقسيم النص إلى قصائد بناءً على "===\n"
    const poems = text.split("===\n").map(p => p.trim()).filter(p => p);

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id === null || isNaN(id) || id < 0 || id >= poems.length) {
      document.getElementById("title").textContent = "قصيدة غير متوفّرة";
      return;
    }

    const poemData = poems[id].split("\n");
    const title = poemData[0].trim();
    let category = "";
    if (poemData[1] && poemData[1].startsWith("@")) {
      category = poemData[1].substring(1).trim();
    }

    // عرض العنوان والتصنيف
    document.getElementById("title").textContent = title;
    const categoryEl = document.getElementById("category");
    categoryEl.textContent = category ? `📌 ${category}` : "";

    // الأبيات: تبدأ من السطر 2 بعد التصنيف
    // تنسيقات: بعد السطرين بيت، قد يكون سطر فارغ، ثم بيت آخر...
    const lines = [];
    for (let i = 2; i < poemData.length; i++) {
      const line = poemData[i].trim();
      if (line === "") continue;
      lines.push(line);
    }

    // عرض الأبيات ضمن عناصر div
    const poemEl = document.getElementById("poem");
    let html = "";
    for (let i = 0; i < lines.length; i += 2) {
      const l1 = lines[i] || "";
      const l2 = lines[i + 1] || "";
      html += `
        <div class="bayt fade-up" style="animation-delay:${(i/2) * 0.2}s">
          <div>${l1}</div>
          <div>${l2}</div>
        </div>`;
    }

    poemEl.innerHTML = html;
  } catch (error) {
    console.error("خطأ في تحميل القصيدة:", error);
  }
}
