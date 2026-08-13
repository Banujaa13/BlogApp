// frontend/js/home.js
// Fetches and displays all blog posts on the home page

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
});

async function fetchPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    try {
        const response = await fetch('../backend/api/posts.php');
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            renderPosts(result.data);
        } else {
            renderEmptyState('Failed to load posts from server.');
        }
    } catch (err) {
        console.error('Error fetching posts:', err);
        renderEmptyState('Could not connect to backend server. Make sure XAMPP Apache is running.');
    }
}

function renderPosts(posts) {
    const container = document.getElementById('posts-container');

    if (posts.length === 0) {
        renderEmptyState('No blog posts published yet. Be the first to write one!');
        return;
    }

    container.innerHTML = posts.map(post => {
        const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const initial = post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A';
        const wordCount = post.content ? post.content.trim().split(/\s+/).length : 0;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        // Strip HTML/Markdown tags for snippet
        const plainText = post.content.replace(/[#*`_~>\[\]\(\)]/g, '');

        return `
            <article class="card">
                <div>
                    <div class="card-meta">
                        <div class="card-author">
                            <div class="avatar" style="width: 22px; height: 22px; font-size: 0.7rem;">${initial}</div>
                            <span>${escapeHTML(post.author_name)}</span>
                        </div>
                        <span>&bull;</span>
                        <time>${formattedDate}</time>
                    </div>
                    <h2 class="card-title">
                        <a href="post.html?id=${post.id}">${escapeHTML(post.title)}</a>
                    </h2>
                    <p class="card-excerpt">${escapeHTML(plainText)}</p>
                </div>
                <div class="card-footer">
                    <span>${readTime} min read</span>
                    <a href="post.html?id=${post.id}" class="btn btn-secondary btn-sm">Read Article &rarr;</a>
                </div>
            </article>
        `;
    }).join('');
}

function renderEmptyState(message) {
    const container = document.getElementById('posts-container');
    container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <h3>No Posts Found</h3>
            <p>${escapeHTML(message)}</p>
            <a href="editor.html" class="btn btn-primary">Write New Post</a>
        </div>
    `;
}
