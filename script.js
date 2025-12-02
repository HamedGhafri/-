/* الوضع الليلي */
function toggleMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

let poemList = [];
let allLines = [];

/* تحميل القصائد */
async function loadPoems() {
    const res = await fetch("poems.txt?update=" + Date.now());
    const text = await res.text();

    const poems = text.split("===\n").map(p => p.trim()).filter(p => p);

    poemList = poems.map((poem, index) => {
        const lines = poem.split("\n");
        return {
            id: index,
            title: lines[0].trim(),
            category: lines[1].replace("@", "").trim(),
            lines: lines.slice(2)
        };
    });

    display(poemList);
    extractBayt(poems);
}

/* عرض الفهرس */
function display(arr) {
    const list = document.getElementById("list");
    list.innerHTML = "";

    arr.forEach(p => {
        list.innerHTML += `
            <a class="poem-card fade" href="viewer.html?id=${p.id}">
                ${p.title}
            </a>
        `;
    });
}

/* البحث المتقدم */
function runSearch() {
    const text = document.getElementById("search").value.trim();
    if (!text) return display(poemList);

    const filtered = poemList.filter(p =>
        p.title.includes(text) ||
        p.category.includes(text) ||
        p.lines.some(line => line.includes(text))
    );

    display(filtered);
}

/* قصيدة عشوائية */
function randomPoem() {
    const id = Math.floor(Math.random() * poemList.length);
    window.location.href = `viewer.html?id=${id}`;
}

/* بيت اليوم */
function extractBayt(poems) {
    poems.forEach(poem => {
        const lines = poem.split("\n").slice(2).filter(l => l.trim());
        allLines.push(...lines);
    });

    const today = new Date().getDate();
    const index = today % allLines.length;

    let l1 = allLines[index];
    let l2 = allLines[index + 1] || "";

    document.getElementById("todayContent").innerHTML = `${l1}<br>${l2}`;
}

loadPoems();
