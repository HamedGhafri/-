// تفعيل وضع الليل/النهار استنادًا إلى الحالة السابقة في التخزين المحلي
(function() {
    if (localStorage.getItem("darkMode") === "on") {
        document.body.classList.add("dark");
    }
})();

/* وظيفة لتبديل الوضع الليلي */
function toggleMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "on" : "off");
}

/* مصفوفة لقصائد وقوالب أبياتها */
let poemList = [];
let allLines = [];

/* تحميل القصائد من ملف النص */
async function loadPoems() {
    try {
        const res = await fetch("poems.txt?update=" + Date.now());
        const text = await res.text();

        const poems = text.split("===\n").map(p => p.trim()).filter(p => p);

        poemList = poems.map((poem, index) => {
            const lines = poem.split("\n");
            return {
                id: index,
                title: lines[0].trim(),
                category: lines[1] ? lines[1].replace("@", "").trim() : "",
                lines: lines.slice(2)
            };
        });

        displayPoemList(poemList);
        extractBayt(poems);
    } catch (error) {
        console.error("خطأ في تحميل القصائد:", error);
    }
}

/* عرض قائمة القصائد */
function displayPoemList(poems) {
    const list = document.getElementById("list");
    if (!list) return;

    list.innerHTML = "";
    poems.forEach(p => {
        list.innerHTML += `
            <a class="poem-card fade" href="viewer.html?id=${p.id}">
                ${p.title}
            </a>
        `;
    });
}

/* بحث تلقائي في العنوان، التصنيف، والأبيات */
function runSearch() {
    const searchTerm = document.getElementById("search").value.trim().toLowerCase();
    if (!searchTerm) return displayPoemList(poemList);

    const filtered = poemList.filter(p =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm) ||
        p.lines.some(line => line.toLowerCase().includes(searchTerm))
    );

    displayPoemList(filtered);
}

/* اختيار قصيدة عشوائية */
function randomPoem() {
    if (poemList.length === 0) return;
    const id = Math.floor(Math.random() * poemList.length);
    window.location.href = `viewer.html?id=${id}`;
}

/* استخراج أبيات اليوم */
function extractBayt(poems) {
    allLines = [];
    // جمع جميع أبيات القصائد
    poems.forEach(poem => {
        const lines = poem.split("\n").slice(2).filter(l => l.trim());
        allLines.push(...lines);
    });

    if (allLines.length === 0) return;

    const today = new Date().getDate();
    const index = today % allLines.length;

    const line1 = allLines[index] || "";
    const line2 = allLines[(index + 1) % allLines.length] || "";

    document.getElementById("todayContent").innerHTML = `${line1}<br>${line2}`;
}

// تحميل البيانات عند بدء التشغيل
loadPoems();
