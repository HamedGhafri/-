// script.js (Rewritten and Improved)

// ==========================
// Global Variables
// ==========================
let poems = [];
let theme = localStorage.getItem('theme') || 'light';

// ==========================
// Theme Initialization
// ==========================
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// ==========================
// Navigation Controls
// ==========================
function initializeNavigation() {
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');

    menuBtn?.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });
}

// ==========================
// Toast Messages
// ==========================
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('visible'), 100);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ==========================
// Poems Parsing
// ==========================
function parsePoems(text) {
    const blocks = text.split('---').map(b => b.trim()).filter(Boolean);

    return blocks.map(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        const title = lines[0] || "قصيدة";
        const content = lines.slice(1).join('\n');

        return {
            title,
            content,
            verses: content.split('\n')
        };
    });
}

// ==========================
// Load Poems (Main Fix Added)
// ==========================
async function loadPoems() {
    try {
        const response = await fetch('poems.txt');
        const text = await response.text();

        poems = parsePoems(text);

        // FIX: Update after loading
        updateStatistics();
        loadRecentPoems();

    } catch (error) {
        console.error('Error loading poems:', error);
        showToast('خطأ في تحميل القصائد');
    }
}

// ==========================
// Statistics
// ==========================
function updateStatistics() {
    const countEl = document.getElementById('poemsCount');
    if (countEl) countEl.textContent = poems.length;
}

// ==========================
// Recent Poems
// ==========================
function loadRecentPoems() {
    const recentContainer = document.getElementById('recentPoems');
    if (!recentContainer) return;

    recentContainer.innerHTML = '';

    poems.slice(-6).reverse().forEach(p => {
        const card = document.createElement('div');
        card.className = 'poem-card';
        card.innerHTML = `
            <h3>${p.title}</h3>
            <p>${p.verses[0] || ''}</p>
        `;
        card.addEventListener('click', () => openPoem(p.title));
        recentContainer.appendChild(card);
    });
}

// ==========================
// Verse of the Day
// ==========================
function loadVerseOfTheDay() {
    if (poems.length === 0) return;

    const poem = poems[Math.floor(Math.random() * poems.length)];
    const verse = poem.verses[Math.floor(Math.random() * poem.verses.length)];

    const verseBox = document.getElementById('verseOfTheDay');
    if (verseBox) verseBox.textContent = verse;
}

// ==========================
// Open Poem Page
// ==========================
function openPoem(title) {
    localStorage.setItem('selectedPoem', title);
    window.location.href = 'poem.html';
}

// ==========================
// Search Function
// ==========================
function searchPoems(query) {
    query = query.trim();
    const results = poems.filter(p => p.title.includes(query) || p.content.includes(query));
    return results;
}

// ==========================
// Event Listeners Setup
// ==========================
function initializeEventListeners() {
    const themeBtn = document.getElementById('themeBtn');
    themeBtn?.addEventListener('click', toggleTheme);

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value;
            const results = searchPoems(query);

            searchResults.innerHTML = '';
            results.forEach(p => {
                const item = document.createElement('div');
                item.className = 'search-item';
                item.textContent = p.title;
                item.addEventListener('click', () => openPoem(p.title));
                searchResults.appendChild(item);
            });
        });
    }
}

// ==========================
// DOM Ready
// ==========================

document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeNavigation();
    initializeEventListeners();

    loadPoems();
    loadVerseOfTheDay();
});
