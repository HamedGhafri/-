/* ====================================
   Global Variables & Configuration
   ==================================== */
let poems = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';

/* ====================================
   DOM Content Loaded
   ==================================== */
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize theme
    initializeTheme();
    
    // Initialize navigation
    initializeNavigation();
    
    // Load poems data (wait for it to complete)
    await loadPoems();
    
    // Initialize event listeners (after poems are loaded)
    initializeEventListeners();
    
    // Load verse of the day
    loadVerseOfTheDay();
    
    // Update statistics
    updateStatistics();
    
    // Load recent poems
    loadRecentPoems();
});

/* ====================================
   Theme Management
   ==================================== */
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = currentTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}

/* ====================================
   Navigation
   ==================================== */
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

/* ====================================
   Load Poems Data
   ==================================== */
async function loadPoems() {
    try {
        const response = await fetch('poems.txt');
        const text = await response.text();
        poems = parsePoems(text);
    } catch (error) {
        console.error('Error loading poems:', error);
        showToast('خطأ في تحميل القصائد');
    }
}

function parsePoems(text) {
    // Split poems by === separator
    const poemBlocks = text.split('===').filter(block => block.trim());
    const poemsArray = [];
    
    for (let block of poemBlocks) {
        const lines = block.trim().split('\n').filter(line => line.trim());
        
        if (lines.length === 0) continue;
        
        // First line is the title
        const title = lines[0].trim();
        
        // Remaining lines are verses (combine pairs of lines into verses)
        const verses = [];
        let currentVerse = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                currentVerse.push(line);
                
                // Every 2 lines form one verse (shatr1 + shatr2)
                if (currentVerse.length === 2) {
                    verses.push(currentVerse.join('\n'));
                    currentVerse = [];
                }
            }
        }
        
        // If there's an odd line left, add it as a single-line verse
        if (currentVerse.length > 0) {
            verses.push(currentVerse.join('\n'));
        }
        
        poemsArray.push({
            title: title,
            verses: verses,
            category: 'غير مصنف'
        });
    }
    
    return poemsArray;
}

/* ====================================
   Event Listeners
   ==================================== */
function initializeEventListeners() {
    // Refresh verse button
    const refreshBtn = document.getElementById('refreshVerse');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadVerseOfTheDay);
    }
    
    // Random poem button
    const randomPoemBtn = document.getElementById('randomPoemBtn');
    if (randomPoemBtn) {
        randomPoemBtn.addEventListener('click', showRandomPoem);
    }
}

/* ====================================
   Verse of the Day
   ==================================== */
function loadVerseOfTheDay() {
    const verseCard = document.getElementById('verseCard');
    if (!verseCard) return;
    
    // Show loading
    verseCard.innerHTML = `
        <div class="verse-content loading">
            <div class="loader"></div>
            <p>جارٍ التحميل...</p>
        </div>
    `;
    
    // Simulate loading delay
    setTimeout(() => {
        if (poems.length === 0) {
            verseCard.innerHTML = `
                <div class="verse-content">
                    <p class="verse-text">لا توجد أبيات متاحة حالياً</p>
                </div>
            `;
            return;
        }
        
        const randomPoem = poems[Math.floor(Math.random() * poems.length)];
        const randomVerse = randomPoem.verses[Math.floor(Math.random() * randomPoem.verses.length)];
        
        verseCard.innerHTML = `
            <div class="verse-content">
                <p class="verse-text">${randomVerse}</p>
                <div class="verse-meta">
                    <span class="verse-source">من قصيدة: ${randomPoem.title}</span>
                </div>
                <div class="verse-actions">
                    <button onclick="copyVerse('${randomVerse.replace(/'/g, "\\'")}')">
                        <i class="fas fa-copy"></i> نسخ
                    </button>
                    <button onclick="shareVerse('${randomVerse.replace(/'/g, "\\'")}', '${randomPoem.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-share-alt"></i> مشاركة
                    </button>
                    <button onclick="toggleFavoriteVerse('${randomVerse.replace(/'/g, "\\'")}', '${randomPoem.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-heart"></i> حفظ
                    </button>
                </div>
            </div>
        `;
    }, 500);
}

/* ====================================
   Verse Actions
   ==================================== */
function copyVerse(verse) {
    navigator.clipboard.writeText(verse).then(() => {
        showToast('تم نسخ البيت بنجاح ✓');
    }).catch(() => {
        showToast('فشل نسخ البيت');
    });
}

function shareVerse(verse, poemTitle) {
    if (navigator.share) {
        navigator.share({
            title: 'بيت من ديوان حمد الغافري',
            text: `${verse}\n\nمن قصيدة: ${poemTitle}`,
            url: window.location.href
        }).then(() => {
            showToast('تمت المشاركة بنجاح ✓');
        }).catch(() => {
            // User cancelled sharing
        });
    } else {
        // Fallback: copy to clipboard
        copyVerse(`${verse}\n\nمن قصيدة: ${poemTitle}\n${window.location.href}`);
        showToast('تم نسخ البيت للمشاركة ✓');
    }
}

function toggleFavoriteVerse(verse, poemTitle) {
    const favorite = {
        verse: verse,
        poemTitle: poemTitle,
        timestamp: Date.now()
    };
    
    const index = favorites.findIndex(f => f.verse === verse);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('تم إزالة البيت من المفضلة');
    } else {
        favorites.push(favorite);
        showToast('تم إضافة البيت للمفضلة ✓');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateStatistics();
}

/* ====================================
   Random Poem
   ==================================== */
function showRandomPoem() {
    if (poems.length === 0) {
        showToast('لا توجد قصائد متاحة');
        return;
    }
    
    const randomPoem = poems[Math.floor(Math.random() * poems.length)];
    const poemIndex = poems.indexOf(randomPoem);
    
    // Redirect to viewer with poem index
    window.location.href = `viewer.html?poem=${poemIndex}`;
}

/* ====================================
   Statistics
   ==================================== */
function updateStatistics() {
    const totalPoemsEl = document.getElementById('totalPoems');
    const totalVersesEl = document.getElementById('totalVerses');
    const totalCategoriesEl = document.getElementById('totalCategories');
    const totalFavoritesEl = document.getElementById('totalFavorites');
    
    if (totalPoemsEl) {
        animateCounter(totalPoemsEl, poems.length);
    }
    
    if (totalVersesEl) {
        const totalVerses = poems.reduce((sum, poem) => sum + poem.verses.length, 0);
        animateCounter(totalVersesEl, totalVerses);
    }
    
    if (totalCategoriesEl) {
        const categories = new Set(poems.map(p => p.category));
        animateCounter(totalCategoriesEl, categories.size);
    }
    
    if (totalFavoritesEl) {
        animateCounter(totalFavoritesEl, favorites.length);
    }
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 1000; // 1 second
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

/* ====================================
   Recent Poems
   ==================================== */
function loadRecentPoems() {
    const recentPoemsGrid = document.getElementById('recentPoemsGrid');
    if (!recentPoemsGrid) return;
    
    if (poems.length === 0) {
        recentPoemsGrid.innerHTML = '<p>لا توجد قصائد متاحة</p>';
        return;
    }
    
    // Get last 6 poems
    const recentPoems = poems.slice(-6).reverse();
    
    recentPoemsGrid.innerHTML = recentPoems.map((poem, index) => {
        const preview = poem.verses.slice(0, 2).join('\n');
        const poemIndex = poems.indexOf(poem);
        
        return `
            <div class="poem-card" onclick="window.location.href='viewer.html?poem=${poemIndex}'">
                <h3 class="poem-title">
                    <i class="fas fa-feather-alt"></i>
                    ${poem.title}
                </h3>
                <p class="poem-preview">${preview}</p>
                <div class="poem-meta">
                    <span class="poem-category">${poem.category}</span>
                    <span><i class="fas fa-align-left"></i> ${poem.verses.length} بيت</span>
                </div>
            </div>
        `;
    }).join('');
}

/* ====================================
   Search Functionality
   ==================================== */
function searchPoems(query) {
    query = query.trim().toLowerCase();
    
    if (!query) return poems;
    
    return poems.filter(poem => {
        return poem.title.toLowerCase().includes(query) ||
               poem.verses.some(verse => verse.toLowerCase().includes(query)) ||
               poem.category.toLowerCase().includes(query);
    });
}

/* ====================================
   Categories
   ==================================== */
function getCategories() {
    const categoriesMap = new Map();
    
    poems.forEach(poem => {
        const category = poem.category;
        if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
        }
        categoriesMap.get(category).push(poem);
    });
    
    return categoriesMap;
}

function getPoemsByCategory(category) {
    return poems.filter(poem => poem.category === category);
}

/* ====================================
   Toast Notification
   ==================================== */
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/* ====================================
   Utility Functions
   ==================================== */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-SA', options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ====================================
   NEW ENHANCEMENTS - Reading Progress Bar
   ==================================== */
function initReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        
        progressBar.style.width = progress + '%';
    });
}

// Initialize reading progress on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReadingProgress);
} else {
    initReadingProgress();
}

/* ====================================
   NEW ENHANCEMENTS - Hero Particles
   ==================================== */
function createHeroParticles() {
    const particlesContainer = document.getElementById('heroParticles');
    if (!particlesContainer) return;
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation duration (5-15 seconds)
        const duration = 5 + Math.random() * 10;
        particle.style.animationDuration = duration + 's';
        
        // Random delay
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        // Random size
        const size = 2 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        particlesContainer.appendChild(particle);
    }
}

// Create particles after DOM loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createHeroParticles);
} else {
    createHeroParticles();
}

/* ====================================
   NEW ENHANCEMENTS - Copy Verse Function
   ==================================== */
function initCopyVerseButton() {
    const copyBtn = document.getElementById('copyVerse');
    if (!copyBtn) return;
    
    copyBtn.addEventListener('click', () => {
        const verseText = document.querySelector('.verse-text');
        if (!verseText) return;
        
        const text = verseText.textContent;
        
        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            showToast('تم نسخ البيت بنجاح');
        }).catch(err => {
            console.error('Error copying text:', err);
            showToast('فشل نسخ البيت');
        });
    });
}

// Initialize copy button
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyVerseButton);
} else {
    initCopyVerseButton();
}

/* ====================================
   NEW ENHANCEMENTS - Share Verse Function
   ==================================== */
function initShareVerseButton() {
    const shareBtn = document.getElementById('shareVerse');
    if (!shareBtn) return;
    
    shareBtn.addEventListener('click', () => {
        const verseText = document.querySelector('.verse-text');
        if (!verseText) return;
        
        const text = verseText.textContent;
        const shareData = {
            title: 'بيت من ديوان حمد الغافري',
            text: text,
            url: window.location.href
        };
        
        // Check if Web Share API is supported
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => showToast('تمت المشاركة بنجاح'))
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error('Error sharing:', err);
                    }
                });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                showToast('تم نسخ البيت - يمكنك مشاركته الآن');
            });
        }
    });
}

// Initialize share button
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareVerseButton);
} else {
    initShareVerseButton();
}

/* ====================================
   NEW ENHANCEMENTS - Enhanced Statistics with Animation
   ==================================== */
// Note: animateCounter is already defined above, we'll use it

/* ====================================
   NEW ENHANCEMENTS - Smooth Scroll
   ==================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ====================================
   NEW ENHANCEMENTS - Enhanced Statistics Display
   ==================================== */
// Statistics are already handled by the existing updateStatistics function above

/* ====================================
   Export for use in other pages
   ==================================== */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        poems,
        favorites,
        searchPoems,
        getCategories,
        getPoemsByCategory,
        showToast
    };
}
