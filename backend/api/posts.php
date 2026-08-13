<?php
// backend/api/posts.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_check.php';

$method = $_SERVER['REQUEST_METHOD'];

// Handle method overrides for HTML forms/clients that do not support PUT/DELETE directly
$input = json_decode(file_get_contents('php://input'), true) ?? [];
if ($method === 'POST' && isset($input['_method'])) {
    $method = strtoupper($input['_method']);
} elseif ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
}

switch ($method) {
    case 'GET':
        handleGetPosts($pdo);
        break;

    case 'POST':
        handleCreatePost($pdo, $input);
        break;

    case 'PUT':
        handleUpdatePost($pdo, $input);
        break;

    case 'DELETE':
        handleDeletePost($pdo, $input);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
        break;
}

/**
 * Handle GET requests (list all posts or fetch single post by id)
 */
function handleGetPosts($pdo) {
    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
        $postId = (int)$_GET['id'];
        $stmt = $pdo->prepare("
            SELECT b.*, u.username as author_name, u.email as author_email 
            FROM blogPost b 
            JOIN user u ON b.user_id = u.id 
            WHERE b.id = ?
        ");
        $stmt->execute([$postId]);
        $post = $stmt->fetch();

        if ($post) {
            echo json_encode(['success' => true, 'data' => $post]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Blog post not found.']);
        }
    } else {
        // List all posts
        $stmt = $pdo->query("
            SELECT b.id, b.user_id, b.title, b.content, b.created_at, b.updated_at, u.username as author_name 
            FROM blogPost b 
            JOIN user u ON b.user_id = u.id 
            ORDER BY b.created_at DESC
        ");
        $posts = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $posts]);
    }
}

/**
 * Handle POST requests (create post)
 */
function handleCreatePost($pdo, $input) {
    $user = require_auth();

    $title = trim($input['title'] ?? $_POST['title'] ?? '');
    $content = trim($input['content'] ?? $_POST['content'] ?? '');

    if (empty($title) || empty($content)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Title and content are required.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO blogPost (user_id, title, content) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], $title, $content]);
        $postId = $pdo->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Blog post published successfully!',
            'post_id' => (int)$postId
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error saving post: ' . $e->getMessage()]);
    }
}

/**
 * Handle PUT requests (update post)
 */
function handleUpdatePost($pdo, $input) {
    $postId = $_GET['id'] ?? $input['id'] ?? null;

    if (!$postId || !is_numeric($postId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Valid post ID is required for update.']);
        exit();
    }

    $postId = (int)$postId;
    // Check ownership & existence
    $existingPost = verify_post_owner($pdo, $postId);

    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');

    if (empty($title) || empty($content)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Title and content cannot be empty.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("UPDATE blogPost SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$title, $content, $postId]);

        echo json_encode([
            'success' => true,
            'message' => 'Blog post updated successfully!'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating post: ' . $e->getMessage()]);
    }
}

/**
 * Handle DELETE requests (delete post)
 */
function handleDeletePost($pdo, $input) {
    $postId = $_GET['id'] ?? $input['id'] ?? null;

    if (!$postId || !is_numeric($postId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Valid post ID is required for deletion.']);
        exit();
    }

    $postId = (int)$postId;
    // Check ownership & existence
    verify_post_owner($pdo, $postId);

    try {
        $stmt = $pdo->prepare("DELETE FROM blogPost WHERE id = ?");
        $stmt->execute([$postId]);

        echo json_encode([
            'success' => true,
            'message' => 'Blog post deleted successfully!'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error deleting post: ' . $e->getMessage()]);
    }
}
