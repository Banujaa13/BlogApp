// frontend/js/post.js
// Handles fetching single blog post, markdown rendering, ownership check, and delete flow

let currentPost = null;
let deleteListenersBound = false;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        renderError('No article ID was provided. Please select a post from the home page.');
        return;
    }

    document.addEventListener('sessionReady', () => {
        loadPost(postId);
    });
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
            renderError(result.message || 'This article could not be found.');
        }
    } catch (err) {
        console.error('Error loading post:', err);
        renderError('Failed to load the article. Please check your connection and try again.');
    }
}

function renderPostDetail(post) {
    const container = document.getElementById('post-container');
    const breadcrumb = document.getElementById('breadcrumb-current');

    document.title = `${post.title} — BlogApp`;
    if (breadcrumb) breadcrumb.textContent = post.title.length > 40 ? post.title.slice(0, 40) + '…' : post.title;

    const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isUpdated = post.updated_at && post.updated_at !== post.created_at;
    const initial = post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A';

    let parsedContent = '';
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
        parsedContent = marked.parse(post.content);
    } else {
        parsedContent = `<p>${escapeHTML(post.content).replace(/\n/g, '<br>')}</p>`;
    }

    const isOwner = currentUser && (currentUser.id === parseInt(post.user_id) || currentUser.role === 'admin');

    const ownerControls = isOwner ? `
        <div class="post-actions">
            <a href="editor.html?id=${post.id}" class="btn btn-secondary btn-sm">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
            </a>
            <button id="delete-post-btn" class="btn btn-danger btn-sm" type="button">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
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
                <span aria-hidden="true">&bull;</span>
                <time datetime="${post.created_at}">Published ${formattedDate}</time>
                ${isUpdated ? `<span class="edited-badge">Edited</span>` : ''}
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
            <div class="empty-icon" aria-hidden="true">
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>
            <h3>Article Unavailable</h3>
            <p>${escapeHTML(message)}</p>
            <a href="index.html" class="btn btn-primary btn-sm">&larr; Back to Home</a>
        </div>
    `;
}

function openDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.add('active');

    if (!deleteListenersBound) {
        document.getElementById('cancel-delete-btn')?.addEventListener('click', closeDeleteModal);
        document.getElementById('confirm-delete-btn')?.addEventListener('click', executeDelete);
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) closeDeleteModal();
        });
        deleteListenersBound = true;
    }

    document.getElementById('confirm-delete-btn').disabled = false;
    document.getElementById('confirm-delete-btn').textContent = 'Yes, Delete';
}

function closeDeleteModal() {
    document.getElementById('delete-modal')?.classList.remove('active');
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
            alertBox.innerHTML = `<div class="alert alert-success">Article deleted. Redirecting to home...</div>`;
            setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } else {
            closeDeleteModal();
            alertBox.innerHTML = `<div class="alert alert-danger">${escapeHTML(result.message)}</div>`;
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Yes, Delete';
        }
    } catch (err) {
        console.error('Delete error:', err);
        closeDeleteModal();
        alertBox.innerHTML = `<div class="alert alert-danger">Something went wrong while deleting. Please try again.</div>`;
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Yes, Delete';
    }
}
