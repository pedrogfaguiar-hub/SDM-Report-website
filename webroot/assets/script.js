/**
 * Reports Repository - Dynamic Card Loading
 * Loads registry.json and dynamically generates report cards
 */

// Global state
let allEntries = [];
let filteredEntries = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRegistry();
    setupEventListeners();
});

/**
 * Load registry.json from server
 */
async function loadRegistry() {
    try {
        // Add cache-busting query parameter to ensure fresh data
        const cacheBuster = `?_=${Date.now()}`;
        const response = await fetch(`data/registry.json${cacheBuster}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allEntries = data.entries || [];
        filteredEntries = [...allEntries];

        // Sort by timestamp descending by default
        sortEntries('date-desc');

        // Render cards
        renderCards();

        // Update total count
        updateTotalCount();

        // Hide loading, show content or empty state
        hideLoading();

    } catch (error) {
        console.error('Error loading registry:', error);
        showError('Error loading repository. Please check if the server is running.');
        hideLoading();
    }
}

/**
 * Setup event listeners for search and sort
 */
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterEntries(e.target.value);
        });
    }

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortEntries(e.target.value);
            renderCards();
        });
    }
}

/**
 * Filter entries based on search query
 */
function filterEntries(query) {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
        filteredEntries = [...allEntries];
    } else {
        filteredEntries = allEntries.filter(entry => {
            const titleMatch = entry.title.toLowerCase().includes(lowerQuery);
            const summaryMatch = entry.summary.toLowerCase().includes(lowerQuery);
            return titleMatch || summaryMatch;
        });
    }

    // Re-apply current sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortEntries(sortSelect.value);
    }

    renderCards();
}

/**
 * Sort entries based on selected option
 */
function sortEntries(sortType) {
    switch(sortType) {
        case 'date-desc':
            filteredEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'date-asc':
            filteredEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        case 'title-asc':
            filteredEntries.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            filteredEntries.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
}

/**
 * Render cards to the DOM
 */
function renderCards() {
    const container = document.getElementById('cards-container');
    const emptyState = document.getElementById('empty-state');

    if (!container) return;

    // Clear existing cards
    container.innerHTML = '';

    // Show empty state if no entries
    if (filteredEntries.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    // Hide empty state
    if (emptyState) emptyState.classList.add('hidden');

    // Create cards
    filteredEntries.forEach((entry, index) => {
        const card = createCard(entry, index);
        container.appendChild(card);
    });
}

/**
 * Create a single card element
 */
function createCard(entry, index) {
    const card = document.createElement('div');
    card.className = 'report-card';

    // Format timestamp
    const date = new Date(entry.timestamp);
    const formattedDate = formatDate(date);
    const isRecent = isRecentEntry(date);

    // Sanitize data
    const title = escapeHtml(entry.title);
    const summary = escapeHtml(entry.summary);
    const pptPath = escapeHtml(entry.ppt_path);
    const mapPath = escapeHtml(entry.map_path);

    card.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">${title}</h3>
            <div class="card-timestamp">
                <i class="fas fa-calendar-alt"></i>
                <span>${formattedDate}</span>
            </div>
            ${isRecent ? '<span class="badge badge-new">New</span>' : ''}
        </div>
        <div class="card-body">
            <p class="card-summary">${summary}</p>
            <div class="card-actions">
                <a href="${pptPath}"
                   class="btn btn-primary"
                   download
                   data-tooltip="Download PowerPoint">
                    <i class="fas fa-file-powerpoint"></i>
                    Download PPT
                </a>
                <a href="${mapPath}"
                   class="btn btn-secondary"
                   target="_blank"
                   rel="noopener noreferrer"
                   data-tooltip="Open in new window">
                    <i class="fas fa-map-marked-alt"></i>
                    Open Map
                </a>
            </div>
        </div>
    `;

    return card;
}

/**
 * Format date to English locale
 */
function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return date.toLocaleDateString('en-US', options);
}

/**
 * Check if entry is recent (last 24 hours)
 */
function isRecentEntry(date) {
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    return hours < 24;
}

/**
 * Update total count display (removed from UI)
 */
function updateTotalCount() {
    // Total count removed from UI - function kept for compatibility
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    const container = document.getElementById('cards-container');
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-20">
                <div class="text-red-500 mb-6">
                    <i class="fas fa-exclamation-triangle text-6xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-700 mb-2">Error</h3>
                <p class="text-gray-600">${escapeHtml(message)}</p>
                <button
                    onclick="location.reload()"
                    class="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <i class="fas fa-redo mr-2"></i>Try Again
                </button>
            </div>
        `;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Auto-refresh registry every 30 seconds
 */
setInterval(() => {
    loadRegistry();
}, 30000);

/**
 * Setup Server-Sent Events (SSE) for real-time updates
 */
function setupSSE() {
    const sseUrl = 'http://localhost:6000/api/stream';

    try {
        const eventSource = new EventSource(sseUrl);

        eventSource.addEventListener('connected', (e) => {
            console.log('✅ SSE connected to backend');
        });

        eventSource.addEventListener('new_report', (e) => {
            try {
                const newEntry = JSON.parse(e.data);
                console.log('📢 New report received via SSE:', newEntry.title);

                // Add to beginning of arrays
                allEntries.unshift(newEntry);

                // Re-apply current filter and sort
                const searchInput = document.getElementById('search-input');
                if (searchInput && searchInput.value) {
                    filterEntries(searchInput.value);
                } else {
                    filteredEntries = [...allEntries];
                    const sortSelect = document.getElementById('sort-select');
                    if (sortSelect) {
                        sortEntries(sortSelect.value);
                    }
                }

                // Re-render cards with animation
                renderCards();

                // Show notification badge or visual feedback
                showNewReportNotification(newEntry);

            } catch (error) {
                console.error('Error processing SSE new_report event:', error);
            }
        });

        eventSource.onerror = (error) => {
            console.warn('⚠️ SSE connection error. Will retry automatically...');
            // EventSource will automatically attempt to reconnect
        };

        return eventSource;

    } catch (error) {
        console.error('Failed to setup SSE:', error);
        return null;
    }
}

/**
 * Show visual notification when new report arrives
 */
function showNewReportNotification(entry) {
    // Create temporary notification badge
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
        z-index: 9999;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        New report: ${escapeHtml(entry.title)}
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize SSE connection after page load
let sseConnection = null;
document.addEventListener('DOMContentLoaded', () => {
    // Setup SSE after a short delay to ensure everything is loaded
    setTimeout(() => {
        sseConnection = setupSSE();
    }, 1000);
});

// Export functions for debugging
window.RepositoryDebug = {
    loadRegistry,
    allEntries: () => allEntries,
    filteredEntries: () => filteredEntries,
    renderCards,
    sseConnection: () => sseConnection
};
