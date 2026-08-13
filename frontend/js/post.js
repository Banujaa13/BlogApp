// frontend/js/post.js
// Handles fetching single blog post, markdown rendering, ownership check, and delete flow

let currentPost = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        renderError('No blog post ID specified in URL.');
        return;
    }

    // Wait for session check to complete before rendering post buttons
    document.addEventListener('sessionReady', () => {
        loadPost(postId);
    });

    // In case session ready fired earlier
    if (typeof currentUser !== 'undefined') {
        loadPost(postId);
    }
});

async function loadPost(id) {
    const container = document.getElementById('post-container');
    if (!container) return;

    try {
        const response = await fetch(`../backend/api/posts.php?id=${id}`);
        const result = await response.json();

        if (result.success && result.data) {
            currentPost = result.data;
            renderPostDetail(currentPost);
        } else {
            renderError(result.message || 'Blog post not found.');
        }
    } catch (err) {
        console.error('Error loading post:', err);
        renderError('Failed to load post. Server connection error.');
    }
}

function renderPostDetail(post) {
    const container = document.getElementById('post-container');
    document.title = `${post.title} — BlogApp`;

    const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isUpdated = post.updated_at && post.updated_at !== post.created_at;
    const initial = post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A';

    // Parse Markdown safely
    let parsedContent = '';
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
        parsedContent = marked.parse(post.content);
    } else {
        parsedContent = `<p>${escapeHTML(post.content).replace(/\n/g, '<br>')}</p>`;
    }

    // Check if logged-in user is the author
    const isOwner = currentUser && (currentUser.id === parseInt(post.user_id) || currentUser.role === 'admin');

    const ownerControls = isOwner ? `
        <div class="post-actions">
            <a href="editor.html?id=${post.id}" class="btn btn-secondary btn-sm">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit Post
            </a>
            <button id="delete-post-btn" class="btn btn-danger btn-sm">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete Post
            </button>
        </div>
    ` : '';

    container.innerHTML = `
        <header class="post-header">
            <h1 class="post-title">${escapeHTML(post.title)}</h1>
            <div class="card-meta">
                <div class="card-author">
                    <div class="avatar">${initial}</div>
                    <span>By ${escapeHTML(post.author_name)}</span>
                </div>
                <span>&bull;</span>
                <time>Published on ${formattedDate}</time>
                ${isUpdated ? `<span style="background: rgba(255,255,255,0.08); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">(Edited)</span>` : ''}
            </div>
            ${ownerControls}
        </header>
        <div class="markdown-body">
            ${parsedContent}
        </div>
    `;

    if (isOwner) {
        document.getElementById('delete-post-btn')?.addEventListener('click', openDeleteModal);
    }
}

function renderError(message) {
    const container = document.getElementById('post-container');
    container.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Post</h3>
            <p>${escapeHTML(message)}</p>
            <a href="index.html" class="btn btn-primary btn-sm">&larr; Return to Home</a>
        </div>
    `;
}

/* Delete Confirmation Modal Logic */
function openDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.add('active');

    document.getElementById('cancel-delete-btn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn')?.addEventListener('click', executeDelete);
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.remove('active');
}

async function executeDelete() {
    if (!currentPost) return;

    const alertBox = document.getElementById('alert-box');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';

    try {
        const response = await fetch(`../backend/api/posts.php?id=${currentPost.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            closeDeleteModal();
            alertBox.innerHTML = `<div class="alert alert-success">Post deleted successfully! Redirecting to home...</div>`;
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            closeDeleteModal();
            alertBox.innerHTML = `<div class="alert alert-danger">${escapeHTML(result.message)}</div>`;
        }
    } catch (err) {
        console.error('Delete error:', err);
        closeDeleteModal();
        alertBox.innerHTML = `<div class="alert alert-danger">Error deleting post. Please try again.</div>`;
    }
}
