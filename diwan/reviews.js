// Reviews Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize rating functionality
    initRatingSystem();
    
    // Load existing reviews
    loadReviews();
    
    // Handle form submission
    handleFormSubmission();
    
    // Sort and filter functionality
    initSortFilter();
});

// Rating System
function initRatingSystem() {
    const stars = document.querySelectorAll('.rating-star');
    const ratingValue = document.getElementById('ratingValue');
    const ratingFeedback = document.getElementById('ratingFeedback');
    
    const feedbackText = {
        1: { text: 'ضعيف 😕', color: '#e74c3c' },
        2: { text: 'مقبول 😐', color: '#e67e22' },
        3: { text: 'جيد 🙂', color: '#f39c12' },
        4: { text: 'ممتاز 😊', color: '#2ecc71' },
        5: { text: 'رائع 😍', color: '#27ae60' }
    };
    
    stars.forEach((star, index) => {
        // Hover effect
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
            const feedback = feedbackText[index + 1];
            ratingFeedback.textContent = feedback.text;
            ratingFeedback.style.color = feedback.color;
            ratingFeedback.style.opacity = '1';
        });
        
        // Click to select
        star.addEventListener('click', () => {
            const rating = index + 1;
            ratingValue.value = rating;
            stars.forEach(s => s.classList.remove('selected'));
            for (let i = 0; i <= index; i++) {
                stars[i].classList.add('selected');
            }
            const feedback = feedbackText[rating];
            ratingFeedback.textContent = feedback.text;
            ratingFeedback.style.color = feedback.color;
        });
    });
    
    // Reset on mouse leave
    const ratingStars = document.querySelector('.rating-stars');
    ratingStars.addEventListener('mouseleave', () => {
        const currentRating = parseInt(ratingValue.value) || 0;
        highlightStars(currentRating);
        if (currentRating > 0) {
            const feedback = feedbackText[currentRating];
            ratingFeedback.textContent = feedback.text;
            ratingFeedback.style.color = feedback.color;
        } else {
            ratingFeedback.style.opacity = '0';
        }
    });
}

function highlightStars(count) {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        if (index < count) {
            star.style.color = '#ffc107';
            star.style.transform = 'scale(1.1)';
        } else {
            star.style.color = '#ddd';
            star.style.transform = 'scale(1)';
        }
    });
}

// Load Reviews from Local Storage
function loadReviews() {
    const reviews = getStoredReviews();
    displayReviews(reviews);
    updateStatistics(reviews);
}

function getStoredReviews() {
    const stored = localStorage.getItem('poetryReviews');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Default reviews (sample data)
    return [
        {
            id: 1,
            name: 'محمد الشامسي',
            rating: 5,
            comment: 'قصائد رائعة ومعبرة، تلامس القلب وتحمل معاني عميقة. أسلوب الشاعر مميز وفريد.',
            date: new Date(Date.now() - 86400000).toISOString(),
            helpful: 12
        },
        {
            id: 2,
            name: 'فاطمة العامرية',
            rating: 4.5,
            comment: 'الموقع جميل والتنظيم ممتاز، يسهل الوصول للقصائد والبحث عنها.',
            date: new Date(Date.now() - 259200000).toISOString(),
            helpful: 8
        },
        {
            id: 3,
            name: 'أحمد الهنائي',
            rating: 5,
            comment: 'شعر جميل يعكس الثقافة العمانية الأصيلة. شكراً لكم على هذا المحتوى الراقي.',
            date: new Date(Date.now() - 604800000).toISOString(),
            helpful: 15
        },
        {
            id: 4,
            name: 'سارة المقبالية',
            rating: 4,
            comment: 'أعجبتني القصائد كثيراً، خاصة قصيدة "الوطن". لغة جميلة ومشاعر صادقة.',
            date: new Date(Date.now() - 1209600000).toISOString(),
            helpful: 6
        },
        {
            id: 5,
            name: 'يوسف البلوشي',
            rating: 5,
            comment: 'موقع متميز وقصائد رائعة. ننتظر المزيد من الإبداع.',
            date: new Date(Date.now() - 1814400000).toISOString(),
            helpful: 10
        }
    ];
}

function saveReviews(reviews) {
    localStorage.setItem('poetryReviews', JSON.stringify(reviews));
}

function displayReviews(reviews) {
    const container = document.getElementById('reviewsList');
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="no-reviews">
                <i class="fas fa-inbox"></i>
                <p>لا توجد تقييمات حتى الآن. كن أول من يشارك رأيه!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-item" data-review-id="${review.id}">
            <div class="review-item-header">
                <div class="reviewer-details">
                    <h4>${escapeHtml(review.name)}</h4>
                    <div class="review-stars">
                        ${generateStars(review.rating)}
                    </div>
                </div>
                <span class="review-date">${formatDate(review.date)}</span>
            </div>
            <p class="review-comment">${escapeHtml(review.comment)}</p>
            <div class="review-footer">
                <button class="helpful-btn" onclick="markHelpful(${review.id})">
                    <i class="fas fa-thumbs-up"></i> مفيد (${review.helpful || 0})
                </button>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'منذ يوم واحد';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهر`;
    return date.toLocaleDateString('ar-SA');
}

// Handle Form Submission
function handleFormSubmission() {
    const form = document.getElementById('reviewForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('reviewerName').value.trim();
        const rating = parseInt(document.getElementById('ratingValue').value);
        const comment = document.getElementById('reviewComment').value.trim();
        
        // Validation
        if (!name) {
            showToast('الرجاء إدخال اسمك', 'error');
            return;
        }
        
        if (!rating || rating < 1 || rating > 5) {
            showToast('الرجاء اختيار التقييم', 'error');
            return;
        }
        
        if (!comment) {
            showToast('الرجاء كتابة تعليقك', 'error');
            return;
        }
        
        if (comment.length < 10) {
            showToast('التعليق قصير جداً. الرجاء كتابة 10 أحرف على الأقل', 'error');
            return;
        }
        
        // Add review
        const reviews = getStoredReviews();
        const newReview = {
            id: Date.now(),
            name: name,
            rating: rating,
            comment: comment,
            date: new Date().toISOString(),
            helpful: 0
        };
        
        reviews.unshift(newReview); // Add to beginning
        saveReviews(reviews);
        
        // Reset form
        form.reset();
        document.getElementById('ratingValue').value = '';
        document.querySelectorAll('.rating-star').forEach(star => {
            star.classList.remove('selected');
            star.style.color = '#ddd';
        });
        document.getElementById('ratingFeedback').style.opacity = '0';
        
        // Reload reviews
        loadReviews();
        
        // Show success message
        showToast('شكراً لك! تم إضافة تقييمك بنجاح', 'success');
        
        // Scroll to reviews list
        document.getElementById('reviewsList').scrollIntoView({ behavior: 'smooth' });
    });
}

// Mark Review as Helpful
function markHelpful(reviewId) {
    const reviews = getStoredReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (review) {
        review.helpful = (review.helpful || 0) + 1;
        saveReviews(reviews);
        displayReviews(reviews);
        showToast('شكراً لتقييمك!', 'success');
    }
}

// Update Statistics
function updateStatistics(reviews) {
    if (reviews.length === 0) return;
    
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    
    // Count ratings by stars
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
        const starIndex = Math.ceil(review.rating) - 1;
        ratingCounts[starIndex]++;
    });
    
    // Update display - check if elements exist
    const ratingNumber = document.querySelector('.rating-number');
    const ratingCount = document.querySelector('.rating-count');
    
    if (ratingNumber) {
        ratingNumber.textContent = avgRating.toFixed(1);
    }
    
    if (ratingCount) {
        ratingCount.textContent = `بناءً على ${totalReviews} تقييم`;
    }
    
    // Update rating stars display
    const ratingStarsContainer = document.querySelector('.rating-summary .rating-stars');
    if (ratingStarsContainer) {
        ratingStarsContainer.innerHTML = generateStars(avgRating);
    }
    
    // Update rating bars (if exists)
    const ratingBars = document.querySelectorAll('.rating-bar-fill');
    if (ratingBars.length > 0) {
        ratingCounts.reverse().forEach((count, index) => {
            const percentage = (count / totalReviews) * 100;
            ratingBars[index].style.width = `${percentage}%`;
        });
    }
}

// Sort and Filter
function initSortFilter() {
    const sortSelect = document.getElementById('sortReviews');
    // Only add event listener if element exists
    if (sortSelect && sortSelect !== null) {
        sortSelect.addEventListener('change', function() {
            const reviews = getStoredReviews();
            const sortedReviews = sortReviews(reviews, this.value);
            displayReviews(sortedReviews);
        });
    }
}

function sortReviews(reviews, sortBy) {
    const sorted = [...reviews];
    
    switch(sortBy) {
        case 'recent':
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'highest':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            sorted.sort((a, b) => a.rating - b.rating);
            break;
        case 'helpful':
            sorted.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
            break;
    }
    
    return sorted;
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make markHelpful available globally
window.markHelpful = markHelpful;
