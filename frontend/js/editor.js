// frontend/js/editor.js
// Handles blog post creation, editing pre-fill, markdown live preview, and form submission

let editPostId = null;

document.addEventListener('DOMContentLoaded', () => {
    setupTabSwitcher();
    setupWordCount();

    const urlParams = new URLSearchParams(window.location.search);
    editPostId = urlParams.get('id');

    document.addEventListener('sessionReady', (e) => {
        const user = e.detail;
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        if (editPostId) {
            setupEditMode(editPostId, user);
        }
    });
});

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
        tabWrite.setAttribute('aria-selected', 'true');
        tabPreview.setAttribute('aria-selected', 'false');
        panelWrite.style.display = 'block';
        panelPreview.style.display = 'none';
    });

    tabPreview.addEventListener('click', () => {
        tabPreview.classList.add('active');
        tabWrite.classList.remove('active');
        tabPreview.setAttribute('aria-selected', 'true');
        tabWrite.setAttribute('aria-selected', 'false');
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
            panelPreview.innerHTML = '<p style="color: var(--text-muted);">Nothing to preview yet. Start writing in the Write tab.</p>';
        }
    });
}

function setupWordCount() {
    const contentInput = document.getElementById('content');
    const wordCountEl = document.getElementById('word-count');
    const charCountEl = document.getElementById('char-count');
    if (!contentInput || !wordCountEl || !charCountEl) return;

    const updateCounts = () => {
        const text = contentInput.value.trim();
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        wordCountEl.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
        charCountEl.textContent = `${contentInput.value.length} characters`;
    };

    contentInput.addEventListener('input', updateCounts);
    updateCounts();
}

async function setupEditMode(id, user) {
    document.getElementById('editor-heading').textContent = 'Edit Article';
    document.getElementById('editor-breadcrumb').textContent = 'Edit Article';
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = 'Save Changes';
    document.title = 'Edit Article — BlogApp';

    try {
        const response = await fetch(`../backend/api/posts.php?id=${id}`);
        const result = await response.json();

        if (result.success && result.data) {
            const post = result.data;

            if (parseInt(post.user_id) !== user.id && user.role !== 'admin') {
                document.getElementById('alert-box').innerHTML = `
                    <div class="alert alert-danger">
                        You don't have permission to edit this article. Only the author can make changes.
                    </div>
                `;
                document.getElementById('editor-form').style.display = 'none';
                return;
            }

            document.getElementById('title').value = post.title;
            document.getElementById('content').value = post.content;
            document.getElementById('content').dispatchEvent(new Event('input'));
        } else {
            document.getElementById('alert-box').innerHTML = `
                <div class="alert alert-danger">${escapeHTML(result.message || 'Article not found.')}</div>
            `;
        }
    } catch (err) {
        console.error('Error fetching post for edit:', err);
        document.getElementById('alert-box').innerHTML = `
            <div class="alert alert-danger">Could not load the article for editing. Please try again.</div>
        `;
    }
}

document.getElementById('editor-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('alert-box');
    const submitBtn = document.getElementById('submit-btn');
    alertBox.innerHTML = '';

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();

    if (!title || !content) {
        alertBox.innerHTML = `<div class="alert alert-danger">Please add both a title and content before publishing.</div>`;
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = editPostId ? 'Saving...' : 'Publishing...';

    try {
        let response;
        if (editPostId) {
            response = await fetch(`../backend/api/posts.php?id=${editPostId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _method: 'PUT',
                    id: editPostId,
                    title,
                    content
                })
            });
        } else {
            response = await fetch('../backend/api/posts.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
        }

        const result = await response.json();

        if (result.success) {
            alertBox.innerHTML = `<div class="alert alert-success">${escapeHTML(result.message)} Redirecting...</div>`;
            const redirectUrl = result.post_id
                ? `post.html?id=${result.post_id}`
                : (editPostId ? `post.html?id=${editPostId}` : 'index.html');
            setTimeout(() => { window.location.href = redirectUrl; }, 1000);
        } else {
            alertBox.innerHTML = `<div class="alert alert-danger">${escapeHTML(result.message)}</div>`;
            submitBtn.disabled = false;
            submitBtn.textContent = editPostId ? 'Save Changes' : 'Publish Article';
        }
    } catch (err) {
        console.error('Editor submit error:', err);
        alertBox.innerHTML = `<div class="alert alert-danger">Something went wrong while saving. Please try again.</div>`;
        submitBtn.disabled = false;
        submitBtn.textContent = editPostId ? 'Save Changes' : 'Publish Article';
    }
});
