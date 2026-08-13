<?php
// backend/includes/auth_check.php
// Reusable authentication and authorization helper functions

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Returns current authenticated user metadata or null
 */
function get_auth_user() {
    if (isset($_SESSION['user_id'])) {
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? '',
            'email' => $_SESSION['email'] ?? '',
            'role' => $_SESSION['role'] ?? 'user'
        ];
    }
    return null;
}

/**
 * Ensures user is authenticated; exits with 401 JSON if not.
 */
function require_auth() {
    $user = get_auth_user();
    if (!$user) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access. Please log in first.'
        ]);
        exit();
    }
    return $user;
}

/**
 * Verifies that the post exists and belongs to the currently logged in user.
 * Exits with 404 or 403 if unauthorized.
 * Returns the post array if authorized.
 */
function verify_post_owner($pdo, $postId) {
    $user = require_auth();

    $stmt = $pdo->prepare("SELECT * FROM blogPost WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch();

    if (!$post) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Blog post not found.'
        ]);
        exit();
    }

    // Admins may be allowed, or strict user check
    if ((int)$post['user_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden. You do not have permission to modify or delete this blog post.'
        ]);
        exit();
    }

    return $post;
}
