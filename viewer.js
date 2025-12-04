// تفعيل الوضع الليلي من التخزين المحلي عند التحميل
(function() {
  if (localStorage.getItem("darkMode") === "on") {
    document.documentElement.classList.add("dark");
  }
})();

// إضافة مستمع للنقر على زر التبديل، إذا كان موجودًا
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

// تحميل القصيدة وعرضها
async function loadPoem() {
  try {
    const res = await fetch("poems.txt?update=" + Date.now());
    const text = await res.text();
    const poems = text.split("===\n").map(p => p.trim()).filter(p => p);

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id === null || id >= poems.length || isNaN(id)) {
      document.getElementById("title").textContent = "قصيدة غير متوفّرة";
      // إخفاء المحتوى أو عرض رسالة
      const contentEl = document.getElementById("content");
      if (contentEl) {
        contentEl.innerHTML = "";
      }
      return;
    }

    const poem = poems[id].split("\n");
    const title = poem[0] || "";
    const category = poem[1] ? poem[1].replace("@", "").trim() : "";

    document.getElementById("title").textContent = title;

    const categoryEl = document.getElementById("category");
    if (categoryEl) {
      categoryEl.textContent = category ? ("📌 " + category) : "";
    }

    const lines = poem.slice(2).filter(l => l.trim() !== "");
    const contentEl = document.getElementById("content");
    if (contentEl) {
      // عرض كل سطر مع الفاصل br
      contentEl.innerHTML = lines.map(line => `<div>${line}</div>`).join("");
    }
  } catch (error) {
    console.error("خطأ في تحميل القصيدة:", error);
  }
}

loadPoem();
