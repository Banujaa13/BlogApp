// frontend/js/auth.js
// Handles active session detection, navbar UI updates, and logout logic

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

/**
 * Check current logged in session status from backend API
 */
async function checkSession() {
    try {
        const response = await fetch('../backend/api/session_check.php');
        const data = await response.json();

        if (data.isLoggedIn && data.user) {
            currentUser = data.user;
            renderNavbarLoggedIn(currentUser);
        } else {
            currentUser = null;
            renderNavbarLoggedOut();
        }

        // Trigger custom event for other page scripts
        document.dispatchEvent(new CustomEvent('sessionReady', { detail: currentUser }));
    } catch (err) {
        console.error('Error checking session:', err);
        renderNavbarLoggedOut();
    }
}

/**
 * Render Navbar links for Logged-In User
 */
function renderNavbarLoggedIn(user) {
    const navRight = document.getElementById('nav-right');
    if (!navRight) return;

    const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';

    navRight.innerHTML = `
        <a href="editor.html" class="btn btn-primary btn-sm">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Post
        </a>
        <div class="user-pill">
            <div class="avatar">${initial}</div>
            <span style="font-weight: 600;">${escapeHTML(user.username)}</span>
        </div>
        <button id="logout-btn" class="btn btn-secondary btn-sm">Logout</button>
    `;

    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
}

/**
 * Render Navbar links for Logged-Out Guest
 */
function renderNavbarLoggedOut() {
    const navRight = document.getElementById('nav-right');
    if (!navRight) return;

    navRight.innerHTML = `
        <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
        <a href="register.html" class="btn btn-primary btn-sm">Register</a>
    `;
}

/**
 * Handle Logout
 */
async function handleLogout() {
    try {
        const response = await fetch('../backend/api/logout.php', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            currentUser = null;
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error('Error logging out:', err);
    }
}

/**
 * Utility: HTML Escape helper
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
