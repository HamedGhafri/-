function toggleMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

let poemList = [];
let allLines = [];

async function loadPoems() {
    const res = await fetch("poems.txt");
    const text = await res.text();

    const poems = text.split("===\n").map(p => p.trim()).filter(p => p);

    poemList = poems.map((poem, index) => ({
        id: index,
        title: poem.split("\n")[0].trim(),
        category: poem.split("\n")[1].replace("@","").trim()
    }));

    display(poemList);

    poems.forEach(poem => {
        const lines = poem.split("\n").slice(2).filter(l => l.trim());
        allLines.push(...lines);
    });

    showBaytOfDay();
}

function display(arr) {
    const list = document.getElementById("list");
    list.innerHTML = "";

    arr.forEach(poem => {
        list.innerHTML += `
            <a class="poem-card fade" href="viewer.html?id=${poem.id}">
                <div class="title">${poem.title}</div>
                <div class="cat">📌 ${poem.category}</div>
            </a>
        `;
    });
}

function filterPoems() {
    const q = document.getElementById("search").value.trim();
    display(poemList.filter(p => p.title.includes(q) || p.category.includes(q)));
}

function randomPoem() {
    const id = Math.floor(Math.random() * poemList.length);
    window.location.href = `viewer.html?id=${id}`;
}

function showBaytOfDay() {
    const today = new Date().getDate();
    const index = today % allLines.length;
    document.getElementById("todayContent").innerHTML =
        `${allLines[index]}<br>${allLines[index+1] || ""}`;
}

loadPoems();
