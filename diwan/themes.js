// ===========================
// Theme Management System
// ===========================

const themes = [
    { id: 'classic', name: 'كلاسيكي', colors: ['#8b7355', '#c9a875'] },
    { id: 'modern', name: 'عصري', colors: ['#667eea', '#764ba2'] },
    { id: 'minimal', name: 'بسيط', colors: ['#2d3748', '#4a5568'] },
    { id: 'sunset', name: 'غروب', colors: ['#f6993f', '#e67e22'] },
    { id: 'ocean', name: 'محيط', colors: ['#0e9aa7', '#3da4ab'] },
    { id: 'rose', name: 'وردي', colors: ['#d946a8', '#f472b6'] },
    { id: 'forest', name: 'غابة', colors: ['#047857', '#10b981'] },
    { id: 'royal', name: 'ملكي', colors: ['#5b21b6', '#7c3aed'] },
    { id: 'amber', name: 'عنبر', colors: ['#d97706', '#f59e0b'] },
    { id: 'night', name: 'ليلي', colors: ['#6366f1', '#818cf8'] }
];

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('selectedTheme') || 'classic';
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);

        // Create theme selector UI
        this.createThemeSelector();

        // Create toggle button
        this.createToggleButton();
    }

    applyTheme(themeId) {
        document.body.setAttribute('data-theme', themeId);
        this.currentTheme = themeId;
        localStorage.setItem('selectedTheme', themeId);

        // Update active state in theme selector
        document.querySelectorAll('.theme-option').forEach(option => {
            if (option.dataset.theme === themeId) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    createThemeSelector() {
        const selector = document.createElement('div');
        selector.className = 'theme-selector';
        selector.id = 'themeSelector';

        selector.innerHTML = `
            <div class="theme-selector-header">
                <h3 class="theme-selector-title">
                    <i class="fas fa-palette"></i> اختر الثيم
                </h3>
                <button class="theme-close-btn" id="themeCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="theme-grid">
                ${themes.map(theme => `
                    <div class="theme-option ${theme.id === this.currentTheme ? 'active' : ''}" 
                         data-theme="${theme.id}">
                        <div class="theme-option-color" 
                             style="background: linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})">
                        </div>
                        <div class="theme-option-name">${theme.name}</div>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(selector);

        // Add event listeners
        selector.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                this.applyTheme(option.dataset.theme);
            });
        });

        document.getElementById('themeCloseBtn').addEventListener('click', () => {
            this.closeThemeSelector();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!selector.contains(e.target) && !document.getElementById('themeToggleBtn').contains(e.target)) {
                this.closeThemeSelector();
            }
        });
    }

    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle-btn';
        button.id = 'themeToggleBtn';
        button.innerHTML = '<i class="fas fa-palette"></i>';
        button.title = 'تغيير الثيم';

        document.body.appendChild(button);

        button.addEventListener('click', () => {
            this.toggleThemeSelector();
        });
    }

    toggleThemeSelector() {
        const selector = document.getElementById('themeSelector');
        selector.classList.toggle('open');
    }

    closeThemeSelector() {
        const selector = document.getElementById('themeSelector');
        selector.classList.remove('open');
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeManager();
    });
} else {
    new ThemeManager();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
