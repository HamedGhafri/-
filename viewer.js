function toggleMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

async function loadPoem() {
    const res = await fetch("poems.txt");
    const text = await res.text();

    const poems = text.split("===\n").map(p => p.trim()).filter(p => p);
    const id = new URLSearchParams(window.location.search).get("id");

    const poem = poems[id].split("\n");

    document.getElementById("title").textContent = poem[0].trim();
    document.getElementById("category").textContent = "📌 " + poem[1].replace("@", "");
    document.getElementById("content").textContent = poem.slice(2).join("\n");
}

loadPoem();
