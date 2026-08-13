// frontend/js/editor.js
// Handles blog post creation, editing pre-fill, markdown live preview, and form submission

let editPostId = null;

document.addEventListener('DOMContentLoaded', () => {
    setupTabSwitcher();

    const urlParams = new URLSearchParams(window.location.search);
    editPostId = urlParams.get('id');

    // Auth gate check
    document.addEventListener('sessionReady', (e) => {
        const user = e.detail;
        if (!user) {
            alert('Authentication required. Please log in to create or edit posts.');
            window.location.href = 'login.html';
            return;
        }

        if (editPostId) {
            setupEditMode(editPostId, user);
        }
    });
});

/**
 * Tab switcher: Write vs Preview
 */
function setupTabSwitcher() {
    const tabWrite = document.getElementById('tab-write');
    const tabPreview = document.getElementById('tab-preview');
    const panelWrite = document.getElementById('panel-write');
    const panelPreview = document.getElementById('panel-preview');
    const contentInput = document.getElementById('content');

    if (!tabWrite || !tabPreview) return;

    tabWrite.addEventListener('click', () => {
        tabWrite.classList.add('active');
        tabPreview.classList.remove('active');
        panelWrite.style.display = 'block';
        panelPreview.style.display = 'none';
    });

    tabPreview.addEventListener('click', () => {
        tabPreview.classList.add('active');
        tabWrite.classList.remove('active');
        panelWrite.style.display = 'none';
        panelPreview.style.display = 'block';

        const rawMarkdown = contentInput.value.trim();
        if (rawMarkdown) {
            if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
                panelPreview.innerHTML = marked.parse(rawMarkdown);
            } else {
                panelPreview.innerHTML = `<p>${escapeHTML(rawMarkdown).replace(/\n/g, '<br>')}</p>`;
            }
        } else {
            panelPreview.innerHTML = '<p style="color: var(--text-muted);">Nothing to preview yet. Type markdown in the Write tab.</p>';
        }
    });
}

/**
 * Load existing post for Edit mode
 */
async function setupEditMode(id, user) {
    document.getElementById('editor-heading').textContent = 'Edit Blog Post';
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = 'Update Post';
    document.title = 'Edit Post — BlogApp';

    try {
        const response = await fetch(`../backend/api/posts.php?id=${id}`);
        const result = await response.json();

        if (result.success && result.data) {
            const post = result.data;

            // Authorization check
            if (parseInt(post.user_id) !== user.id && user.role !== 'admin') {
                document.getElementById('alert-box').innerHTML = `
                    <div class="alert alert-danger">
                        Forbidden: You are not the author of this post. You cannot edit it.
                    </div>
                `;
                document.getElementById('editor-form').style.display = 'none';
                return;
            }

            document.getElementById('title').value = post.title;
            document.getElementById('content').value = post.content;
        } else {
            document.getElementById('alert-box').innerHTML = `
                <div class="alert alert-danger">${escapeHTML(result.message || 'Post not found.')}</div>
            `;
        }
    } catch (err) {
        console.error('Error fetching post for edit:', err);
    }
}

/**
 * Handle form submit (Create or Update)
 */
document.getElementById('editor-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('alert-box');
    const submitBtn = document.getElementById('submit-btn');
    alertBox.innerHTML = '';

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();

    if (!title || !content) {
        alertBox.innerHTML = `<div class="alert alert-danger">Please fill in both title and content.</div>`;
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = editPostId ? 'Updating...' : 'Publishing...';

    try {
        let response;
        if (editPostId) {
            // Update existing post (PUT request or method override)
            response = await fetch(`../backend/api/posts.php?id=${editPostId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _method: 'PUT',
                    id: editPostId,
                    title: title,
                    content: content
                })
            });
        } else {
            // Create new post
            response = await fetch('../backend/api/posts.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
        }

        const result = await response.json();

        if (result.success) {
            alertBox.innerHTML = `<div class="alert alert-success">${escapeHTML(result.message)} Redirecting...</div>`;
            const redirectUrl = result.post_id ? `post.html?id=${result.post_id}` : (editPostId ? `post.html?id=${editPostId}` : 'index.html');
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
        } else {
            alertBox.innerHTML = `<div class="alert alert-danger">${escapeHTML(result.message)}</div>`;
            submitBtn.disabled = false;
            submitBtn.textContent = editPostId ? 'Update Post' : 'Publish Post';
        }
    } catch (err) {
        console.error('Editor submit error:', err);
        alertBox.innerHTML = `<div class="alert alert-danger">An unexpected error occurred while saving.</div>`;
        submitBtn.disabled = false;
        submitBtn.textContent = editPostId ? 'Update Post' : 'Publish Post';
    }
});
