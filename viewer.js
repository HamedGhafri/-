function toggleMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "on" : "off");
}
if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark");
}

async function loadPoem() {
    const res = await fetch("poems.txt?update=" + Date.now());
    const text = await res.text();

    const poems = text.split("===\n").map(p => p.trim()).filter(p => p);

    const id = new URLSearchParams(window.location.search).get("id");
    const poem = poems[id].split("\n");

    document.getElementById("title").textContent = poem[0];
    document.getElementById("category").textContent = "📌 " + poem[1].replace("@", "");

    const lines = poem.slice(2).map(l => l.trim());
    document.getElementById("content").innerHTML = lines.join("<br>");
}

loadPoem();
