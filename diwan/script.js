/* ====================================
   Global Variables & Configuration
   ==================================== */
let poems = [];
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
        
        // Check if second line is a category (starts with @)
        let category = 'غير مصنف';
        let startIndex = 1;
        
        if (lines.length > 1 && lines[1].trim().startsWith('@')) {
            category = lines[1].trim().substring(1); // Remove @ symbol
            startIndex = 2; // Start verses from line 3
        }
        
        // Remaining lines are verses (combine pairs of lines into verses)
        const verses = [];
        let currentVerse = [];
        
        for (let i = startIndex; i < lines.length; i++) {
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
            category: category
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
    
    // Share verse as image button
    const shareImageBtn = document.getElementById('shareImageVerse');
    if (shareImageBtn) {
        shareImageBtn.addEventListener('click', shareVerseAsImage);
    }
    
    // Download verse button
    const downloadBtn = document.getElementById('downloadVerse');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadVerseImage);
    }
    
    // Prevent copy on verse card
    const verseCard = document.getElementById('verseCard');
    if (verseCard) {
        verseCard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showToast('النسخ غير متاح - يمكنك المشاركة كصورة 📤');
        });
        
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
                const selection = window.getSelection().toString();
                if (selection && window.getSelection().anchorNode.closest('.verse-card')) {
                    e.preventDefault();
                    showToast('النسخ غير متاح - يمكنك المشاركة كصورة 📤');
                }
            }
        });
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
        <div class="verse-decoration">
            <div class="verse-ornament verse-ornament-left">✦</div>
            <div class="verse-ornament verse-ornament-right">✦</div>
        </div>
    `;
    
    // Simulate loading delay
    setTimeout(() => {
        if (poems.length === 0) {
            verseCard.innerHTML = `
                <div class="verse-content">
                    <p class="verse-text">لا توجد أبيات متاحة حالياً</p>
                </div>
                <div class="verse-decoration">
                    <div class="verse-ornament verse-ornament-left">✦</div>
                    <div class="verse-ornament verse-ornament-right">✦</div>
                </div>
            `;
            return;
        }
        
        // Get verse of the day based on date (changes every 24 hours)
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        
        // Calculate total number of verses
        let totalVerses = 0;
        const versesWithPoem = [];
        poems.forEach(poem => {
            poem.verses.forEach(verse => {
                versesWithPoem.push({ verse, poem });
                totalVerses++;
            });
        });
        
        // Select verse based on day of year (same verse for 24 hours)
        const verseIndex = dayOfYear % totalVerses;
        const { verse, poem } = versesWithPoem[verseIndex];
        
        // Store in localStorage to show it was loaded today
        const verseOfDay = {
            verse: verse,
            poemTitle: poem.title,
            date: today.toDateString()
        };
        localStorage.setItem('verseOfDay', JSON.stringify(verseOfDay));
        
        verseCard.innerHTML = `
            <div class="verse-content">
                <p class="verse-text">${verse.replace(/\n/g, '<br>')}</p>
                <div class="verse-meta">
                    <span class="verse-source">من قصيدة: ${poem.title}</span>
                </div>
            </div>
            <div class="verse-decoration">
                <div class="verse-ornament verse-ornament-left">✦</div>
                <div class="verse-ornament verse-ornament-right">✦</div>
            </div>
        `;
    }, 500);
}

/* ====================================
   Verse Actions - Share as Image
   ==================================== */
async function shareVerseAsImage() {
    try {
        const imageBlob = await generateVerseImage();
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([imageBlob], 'verse.png', { type: 'image/png' })] })) {
            const file = new File([imageBlob], 'بيت_اليوم.png', { type: 'image/png' });
            await navigator.share({
                title: 'بيت اليوم',
                text: 'بيت شعري من ديوان حمد الغافري',
                files: [file]
            });
            showToast('تمت المشاركة بنجاح ✓');
        } else {
            downloadImageFromBlob(imageBlob);
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
            showToast('حدث خطأ في المشاركة');
        }
    }
}

async function downloadVerseImage() {
    try {
        const imageBlob = await generateVerseImage();
        downloadImageFromBlob(imageBlob);
    } catch (err) {
        console.error('Download failed:', err);
        showToast('حدث خطأ في التحميل');
    }
}

function downloadImageFromBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'بيت_اليوم_' + new Date().getTime() + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تحميل الصورة ✓');
}

async function generateVerseImage() {
    const canvas = document.getElementById('verseCanvas');
    const ctx = canvas.getContext('2d');
    
    // Get verse data from localStorage
    const verseData = JSON.parse(localStorage.getItem('verseOfDay') || '{}');
    if (!verseData.verse) {
        throw new Error('No verse data');
    }
    
    // Set canvas size
    canvas.width = 1080;
    canvas.height = 1080;

    // Get current theme
    const isDark = document.body.classList.contains('dark-mode');
    const bgColor = isDark ? '#1a1a2e' : '#f8f9fa';
    const textColor = isDark ? '#eee' : '#2c3e50';
    const accentColor = '#8e44ad';

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, bgColor);
    gradient.addColorStop(1, isDark ? '#16213e' : '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw decorative border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Draw ornament
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✦ ❁ ✦', canvas.width / 2, 180);

    // Draw verse text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    const verseLines = verseData.verse.split('\n');
    let y = 400;
    verseLines.forEach(line => {
        const words = line.split(' ');
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > canvas.width - 200) {
                ctx.fillText(currentLine, canvas.width / 2, y);
                currentLine = word + ' ';
                y += 70;
            } else {
                currentLine = testLine;
            }
        }
        ctx.fillText(currentLine, canvas.width / 2, y);
        y += 90;
    });

    // Draw separator
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(200, y + 30);
    ctx.lineTo(canvas.width - 200, y + 30);
    ctx.stroke();

    // Draw author
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 40px Arial';
    ctx.fillText('✒ حمد الغافري', canvas.width / 2, y + 100);

    // Draw poem title
    ctx.fillStyle = textColor;
    ctx.font = '32px Arial';
    ctx.fillText('من قصيدة: ' + verseData.poemTitle, canvas.width / 2, y + 160);

    // Draw date
    const today = new Date().toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    ctx.fillText(today, canvas.width / 2, y + 210);

    // Draw watermark
    ctx.globalAlpha = 0.5;
    ctx.font = 'bold 28px Arial';
    ctx.fillText('ديوان حمد الغافري', canvas.width / 2, canvas.height - 80);

    // Convert to blob
    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob));
    });
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
   Progressive Web App (PWA) Support
   ==================================== */
// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
        }
    }
}

// Show install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button if needed
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
        });
    }
});

/* ====================================
   Verse Image Generation
   ==================================== */
let currentVerseData = null;

function setupVerseImageGeneration() {
    const shareBtn = document.getElementById('shareImageVerse');
    if (shareBtn) {
        shareBtn.addEventListener('click', generateAndDownloadVerseImage);
    }
    
    // Store verse data when loaded
    const verseText = document.querySelector('.verse-text');
    const verseSource = document.querySelector('.verse-source');
    if (verseText && verseSource) {
        currentVerseData = {
            text: verseText.textContent,
            source: verseSource.textContent
        };
    }
}

async function generateAndDownloadVerseImage() {
    if (!currentVerseData) {
        const verseText = document.querySelector('.verse-text');
        const verseSource = document.querySelector('.verse-source');
        if (!verseText) {
            showToast('لا يوجد بيت لحفظه');
            return;
        }
        currentVerseData = {
            text: verseText.textContent,
            source: verseSource ? verseSource.textContent : ''
        };
    }
    
    // Preload fonts
    try {
        await document.fonts.load('bold 60px "Amiri"');
        await document.fonts.load('42px "Amiri"');
        await document.fonts.load('36px "Cairo"');
    } catch (e) {
        console.log('Font loading warning:', e);
    }
    
    const canvas = document.getElementById('verseCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for high quality
    canvas.width = 1200;
    canvas.height = 1200;
    
    // Get current theme colors
    const isDark = document.body.classList.contains('dark-mode');
    
    // Define colors
    const bgColor = isDark ? '#1a1a2e' : '#f8f9fa';
    const cardColor = isDark ? '#16213e' : '#ffffff';
    const textColor = isDark ? '#eee' : '#2c3e50';
    const accentColor = '#d4a574';
    const accentDark = '#b8936a';
    
    // Draw background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, bgColor);
    bgGradient.addColorStop(1, isDark ? '#0f3460' : '#e8f4f8');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw card background
    ctx.fillStyle = cardColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    roundRect(ctx, 80, 150, canvas.width - 160, canvas.height - 300, 30);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw decorative border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    roundRect(ctx, 100, 170, canvas.width - 200, canvas.height - 340, 20);
    ctx.stroke();
    
    // Draw top ornament
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 55px "Amiri", "Arial"';
    ctx.textAlign = 'center';
    ctx.fillText('✦ ❁ ✦', canvas.width / 2, 260);
    
    // Draw decorative line
    const lineGradient = ctx.createLinearGradient(200, 300, canvas.width - 200, 300);
    lineGradient.addColorStop(0, 'transparent');
    lineGradient.addColorStop(0.5, accentColor);
    lineGradient.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 300);
    ctx.lineTo(canvas.width - 200, 300);
    ctx.stroke();
    
    // Draw verse text with better Arabic font
    ctx.fillStyle = textColor;
    ctx.font = 'bold 60px "Amiri", "Arial"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Split verse into lines
    const verseLines = currentVerseData.text.split('\n');
    let y = 450;
    const lineHeight = 95;
    
    verseLines.forEach(line => {
        const words = line.trim().split(' ');
        let currentLine = '';
        let lines = [];
        
        for (let word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > canvas.width - 300) {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }
        
        lines.forEach(textLine => {
            // Add text shadow for better readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillText(textLine, canvas.width / 2, y);
            ctx.shadowBlur = 0;
            y += lineHeight;
        });
        
        y += 20;
    });
    
    // Draw decorative line
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, y + 20);
    ctx.lineTo(canvas.width - 200, y + 20);
    ctx.stroke();
    
    // Draw source/author
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 42px "Amiri", "Arial"';
    const sourceText = currentVerseData.source || 'من قصائد حمد الغافري';
    ctx.fillText('✒ ' + sourceText, canvas.width / 2, y + 80);
    
    // Draw date
    const today = new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.7;
    ctx.font = '34px "Cairo", "Arial"';
    ctx.fillText(today, canvas.width / 2, y + 140);
    ctx.globalAlpha = 1;
    
    // Draw bottom ornament
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 55px "Amiri", "Arial"';
    ctx.fillText('✦ ❁ ✦', canvas.width / 2, canvas.height - 180);
    
    // Draw watermark
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.6;
    ctx.font = 'bold 36px "Cairo", "Arial"';
    ctx.fillText('ديوان حمد الغافري', canvas.width / 2, canvas.height - 100);
    ctx.globalAlpha = 1;
    
    // Convert to blob and download
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'بيت_اليوم_' + new Date().getTime() + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('تم حفظ الصورة بنجاح ✓');
    });
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Initialize when verse is loaded
if (document.getElementById('verseCard')) {
    const observer = new MutationObserver(() => {
        const verseText = document.querySelector('.verse-text');
        if (verseText && !verseText.closest('.loading')) {
            setupVerseImageGeneration();
        }
    });
    
    observer.observe(document.getElementById('verseCard'), {
        childList: true,
        subtree: true
    });
}

/* ====================================
   Export for use in other pages
   ==================================== */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        poems,
        searchPoems,
        getCategories,
        getPoemsByCategory,
        showToast,
        requestNotificationPermission
    };
}
