// frontend/js/home.js
// Fetches and displays all blog posts on the home page

document.addEventListener('DOMContentLoaded', () => {
    showSkeletonLoader();
    fetchPosts();

    document.addEventListener('sessionReady', (e) => {
        updateHeroActions(e.detail);
    });
});

function showSkeletonLoader() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.className = 'skeleton-grid';
    container.innerHTML = Array.from({ length: 3 }, () => `
        <div class="skeleton-card" aria-hidden="true">
            <div class="skeleton-line sm"></div>
            <div class="skeleton-line md"></div>
            <div class="skeleton-line full"></div>
            <div class="skeleton-line full"></div>
            <div class="skeleton-line lg"></div>
        </div>
    `).join('');
}

async function fetchPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    try {
        const response = await fetch('../backend/api/posts.php');
        const result = await response.json();

        container.className = 'posts-grid';

        if (result.success && Array.isArray(result.data)) {
            updateHomeStats(result.data.length);
            renderPosts(result.data);
        } else {
            renderEmptyState('We could not load articles right now. Please try again shortly.');
        }
    } catch (err) {
        console.error('Error fetching posts:', err);
        container.className = 'posts-grid';
        renderEmptyState('Could not connect to the server. Make sure Apache is running in XAMPP.');
    }
}

function updateHomeStats(count) {
    const statsEl = document.getElementById('home-stats');
    if (!statsEl) return;

    statsEl.innerHTML = `
        <span class="stat-pill">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"/>
            </svg>
            <strong>${count}</strong> published ${count === 1 ? 'article' : 'articles'}
        </span>
        <span class="stat-pill">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Secure author-only editing
        </span>
    `;
}

function updateHeroActions(user) {
    const heroActions = document.getElementById('hero-actions');
    if (!heroActions) return;

    if (user) {
        heroActions.innerHTML = `
            <a href="#posts-section" class="btn btn-secondary">Browse Articles</a>
            <a href="editor.html" class="btn btn-primary">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Write New Article
            </a>
        `;
    } else {
        heroActions.innerHTML = `
            <a href="#posts-section" class="btn btn-secondary">Browse Articles</a>
            <a href="register.html" class="btn btn-primary">Get Started Free</a>
        `;
    }
}

function renderPosts(posts) {
    const container = document.getElementById('posts-container');

    if (posts.length === 0) {
        renderEmptyState('No articles have been published yet. Be the first to share your ideas!');
        return;
    }

    container.innerHTML = posts.map(post => {
        const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const initial = post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A';
        const wordCount = post.content ? post.content.trim().split(/\s+/).filter(Boolean).length : 0;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        const plainText = post.content.replace(/[#*`_~>\[\]\(\)!-]/g, '').trim();
        const excerpt = plainText.length > 180 ? plainText.slice(0, 180).trim() + '…' : plainText;

        return `
            <article class="card">
                <div>
                    <div class="card-meta">
                        <div class="card-author">
                            <div class="avatar" style="width: 22px; height: 22px; font-size: 0.7rem;">${initial}</div>
                            <span>${escapeHTML(post.author_name)}</span>
                        </div>
                        <span aria-hidden="true">&bull;</span>
                        <time datetime="${post.created_at}">${formattedDate}</time>
                    </div>
                    <h2 class="card-title">
                        <a href="post.html?id=${post.id}">${escapeHTML(post.title)}</a>
                    </h2>
                    <p class="card-excerpt">${escapeHTML(excerpt || 'No preview available.')}</p>
                </div>
                <div class="card-footer">
                    <span>${readTime} min read</span>
                    <a href="post.html?id=${post.id}" class="read-link">Read article &rarr;</a>
                </div>
            </article>
        `;
    }).join('');
}

function renderEmptyState(message) {
    const container = document.getElementById('posts-container');
    container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon" aria-hidden="true">
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
            </div>
            <h3>No Articles Yet</h3>
            <p>${escapeHTML(message)}</p>
            <a href="editor.html" class="btn btn-primary">Write the First Article</a>
        </div>
    `;
}
