/* =====================================================
   MAVEN Internal Tools Directory
   JavaScript functionality
   ===================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    if (document.querySelector('.login-page')) {
        initLoginPage();
    }

    if (document.querySelector('.directory-page')) {
        initDirectoryPage();
    }
});

/* =====================================================
   LOGIN PAGE
   ===================================================== */

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Demo login - accepts any credentials
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            if (email && password) {
                // Store simple session flag (demo purposes only)
                sessionStorage.setItem('maven_logged_in', 'true');
                sessionStorage.setItem('maven_user', email);

                // Redirect to directory
                window.location.href = 'directory.html';
            }
        });
    }
}

/* =====================================================
   DIRECTORY PAGE
   ===================================================== */

function initDirectoryPage() {
    // Check if user is logged in (demo purposes)
    // Uncomment the following to enforce login:
    // if (!sessionStorage.getItem('maven_logged_in')) {
    //     window.location.href = 'index.html';
    //     return;
    // }

    initCategoryToggles();
    initSearch();
    initScrollIndicator();
    initScrollToTop();
}

/* =====================================================
   CATEGORY TOGGLES
   ===================================================== */

function initCategoryToggles() {
    const categoryHeaders = document.querySelectorAll('.category-header');

    categoryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const category = this.closest('.category');

            // Toggle current category
            category.classList.toggle('open');
        });
    });
}

/* =====================================================
   SEARCH FUNCTIONALITY
   ===================================================== */

function initSearch() {
    const searchInput = document.getElementById('searchInput');

    if (!searchInput) return;

    // Create no results message
    const noResultsMsg = document.createElement('div');
    noResultsMsg.className = 'no-results';
    noResultsMsg.textContent = 'No tools found matching your search.';
    document.querySelector('.categories-container').appendChild(noResultsMsg);

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const allToolCards = document.querySelectorAll('.tool-card');
        const allCategories = document.querySelectorAll('.category');

        if (searchTerm === '') {
            // Reset everything when search is empty
            allToolCards.forEach(card => {
                card.classList.remove('hidden', 'highlight');
            });
            allCategories.forEach(category => {
                category.classList.remove('open');
                category.style.display = '';
            });
            noResultsMsg.classList.remove('visible');
            return;
        }

        let totalMatches = 0;

        allCategories.forEach(category => {
            const toolCards = category.querySelectorAll('.tool-card');
            let categoryMatches = 0;

            toolCards.forEach(card => {
                const toolName = card.querySelector('h4').textContent.toLowerCase();
                const toolDesc = card.querySelector('p').textContent.toLowerCase();

                if (toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
                    card.classList.remove('hidden');
                    card.classList.add('highlight');
                    categoryMatches++;
                    totalMatches++;
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('highlight');
                }
            });

            // Show/hide and expand categories based on matches
            if (categoryMatches > 0) {
                category.style.display = '';
                category.classList.add('open');
            } else {
                category.style.display = 'none';
            }
        });

        // Show no results message if needed
        if (totalMatches === 0) {
            noResultsMsg.classList.add('visible');
        } else {
            noResultsMsg.classList.remove('visible');
        }
    });

    // Handle Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
}

/* =====================================================
   SCROLL INDICATOR
   ===================================================== */

function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const directorySection = document.querySelector('.directory-section');
            if (directorySection) {
                directorySection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

/* =====================================================
   SCROLL TO TOP BUTTON
   ===================================================== */

function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* =====================================================
   UTILITY: Logout (can be called from anywhere)
   ===================================================== */

function logout() {
    sessionStorage.removeItem('maven_logged_in');
    sessionStorage.removeItem('maven_user');
    window.location.href = 'index.html';
}
