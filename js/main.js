/* =====================================================
   MAVEN Internal Tools Directory
   JavaScript functionality
   ===================================================== */

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.login-page')) {
        initLoginPage();
    }

    if (document.querySelector('.directory-page')) {
        initDirectoryPage();
    }

    if (document.querySelector('.tool-page')) {
        initToolPage();
    }
});

/* =====================================================
   DATA FETCHING
   ===================================================== */

function fetchToolsData() {
    return fetch('data/tools.json')
        .then(function(response) { return response.json(); });
}

/* =====================================================
   RENDERING HELPERS
   ===================================================== */

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function renderToolCardHTML(tool, activeToolId) {
    var activeClass = (tool.id === activeToolId) ? ' tool-card--active' : '';
    return '<a href="tool.html?id=' + encodeURIComponent(tool.id) + '" class="tool-card' + activeClass + '">' +
        '<div class="tool-icon"></div>' +
        '<h4>' + escapeHtml(tool.name) + '</h4>' +
        '<p>' + escapeHtml(tool.description) + '</p>' +
        '<span class="tool-arrow">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<line x1="5" y1="12" x2="19" y2="12"></line>' +
                '<polyline points="12 5 19 12 12 19"></polyline>' +
            '</svg>' +
        '</span>' +
    '</a>';
}

function renderCategoriesHTML(data, activeToolId) {
    var html = '';
    data.categories.forEach(function(category) {
        html += '<div class="category" data-category="' + escapeHtml(category.id) + '">';
        html += '<div class="category-header">';
        html += '<h3>' + escapeHtml(category.name) + '</h3>';
        html += '<svg class="chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
        html += '<polyline points="6 9 12 15 18 9"></polyline>';
        html += '</svg>';
        html += '</div>';
        html += '<div class="category-content"><div class="category-content-inner"><div class="tools-grid">';
        category.tools.forEach(function(tool) {
            html += renderToolCardHTML(tool, activeToolId);
        });
        html += '</div></div></div>';
        html += '</div>';
    });
    return html;
}

/* =====================================================
   LOGIN PAGE
   ===================================================== */

function initLoginPage() {
    var loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var email = loginForm.querySelector('input[type="email"]').value;
            var password = loginForm.querySelector('input[type="password"]').value;

            if (email && password) {
                sessionStorage.setItem('maven_logged_in', 'true');
                sessionStorage.setItem('maven_user', email);
                window.location.href = 'directory.html';
            }
        });
    }
}

/* =====================================================
   DIRECTORY PAGE
   ===================================================== */

function initDirectoryPage() {
    fetchToolsData().then(function(data) {
        var container = document.querySelector('.categories-container');
        container.innerHTML = renderCategoriesHTML(data);

        initCategoryToggles();
        initSearch();
        initScrollIndicator();
        initScrollToTop();
    });
}

/* =====================================================
   TOOL PAGE
   ===================================================== */

function initToolPage() {
    var params = new URLSearchParams(window.location.search);
    var toolId = params.get('id');

    if (!toolId) {
        window.location.href = 'directory.html';
        return;
    }

    fetchToolsData().then(function(data) {
        // Find tool and its category
        var foundTool = null;
        var foundCategory = null;
        data.categories.forEach(function(category) {
            category.tools.forEach(function(tool) {
                if (tool.id === toolId) {
                    foundTool = tool;
                    foundCategory = category;
                }
            });
        });

        if (!foundTool) {
            window.location.href = 'directory.html';
            return;
        }

        // Set page title
        document.title = 'MAVEN - ' + foundTool.name;

        // Populate breadcrumb
        var breadcrumbLink = document.getElementById('breadcrumbLink');
        breadcrumbLink.textContent = foundCategory.name;

        // Populate title
        document.getElementById('toolTitle').textContent = foundTool.name;

        // Populate access button
        document.getElementById('toolAccessBtn').href = foundTool.accessUrl;

        // Populate content sections
        var detail = foundTool.detail;
        var contentHTML = '';

        contentHTML += '<div class="tool-section">';
        contentHTML += '<span class="tool-section-label">What it is:</span>';
        contentHTML += '<p>' + escapeHtml(detail.whatItIs) + '</p>';
        contentHTML += '</div>';

        contentHTML += '<div class="tool-section">';
        contentHTML += '<span class="tool-section-label">What it does:</span>';
        contentHTML += '<ul>';
        detail.whatItDoes.forEach(function(item) {
            contentHTML += '<li>' + escapeHtml(item) + '</li>';
        });
        contentHTML += '</ul>';
        contentHTML += '</div>';

        contentHTML += '<div class="tool-section">';
        contentHTML += '<span class="tool-section-label">Why it matters:</span>';
        contentHTML += '<p>' + escapeHtml(detail.whyItMatters) + '</p>';
        contentHTML += '</div>';

        document.getElementById('toolContent').innerHTML = contentHTML;

        // Render browse-more categories with current tool highlighted
        var browseContainer = document.querySelector('.browse-section .categories-container');
        browseContainer.innerHTML = renderCategoriesHTML(data, toolId);

        initCategoryToggles();
        initSearch();
    });
}

/* =====================================================
   CATEGORY TOGGLES
   ===================================================== */

function initCategoryToggles() {
    var categoryHeaders = document.querySelectorAll('.category-header');

    categoryHeaders.forEach(function(header) {
        header.addEventListener('click', function() {
            var category = this.closest('.category');
            category.classList.toggle('open');
        });
    });
}

/* =====================================================
   SEARCH FUNCTIONALITY
   ===================================================== */

function initSearch() {
    var searchInput = document.getElementById('searchInput');

    if (!searchInput) return;

    var container = document.querySelector('.categories-container');

    // Create no results message
    var noResultsMsg = document.createElement('div');
    noResultsMsg.className = 'no-results';
    noResultsMsg.textContent = 'No tools found matching your search.';
    container.appendChild(noResultsMsg);

    searchInput.addEventListener('input', function() {
        var searchTerm = this.value.toLowerCase().trim();
        var allToolCards = document.querySelectorAll('.tool-card');
        var allCategories = document.querySelectorAll('.category');

        if (searchTerm === '') {
            allToolCards.forEach(function(card) {
                card.classList.remove('hidden', 'highlight');
            });
            allCategories.forEach(function(category) {
                category.classList.remove('open');
                category.style.display = '';
            });
            noResultsMsg.classList.remove('visible');
            return;
        }

        var totalMatches = 0;

        allCategories.forEach(function(category) {
            var toolCards = category.querySelectorAll('.tool-card');
            var categoryMatches = 0;

            toolCards.forEach(function(card) {
                var toolName = card.querySelector('h4').textContent.toLowerCase();
                var toolDesc = card.querySelector('p').textContent.toLowerCase();

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

            if (categoryMatches > 0) {
                category.style.display = '';
                category.classList.add('open');
            } else {
                category.style.display = 'none';
            }
        });

        if (totalMatches === 0) {
            noResultsMsg.classList.add('visible');
        } else {
            noResultsMsg.classList.remove('visible');
        }
    });

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
    var scrollIndicator = document.querySelector('.scroll-indicator');

    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            var directorySection = document.querySelector('.directory-section');
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
    var scrollTopBtn = document.getElementById('scrollTopBtn');

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
