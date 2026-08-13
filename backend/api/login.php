<?php
// backend/api/login.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$loginIdentifier = trim($input['login_id'] ?? $input['username'] ?? $input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($loginIdentifier) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide username/email and password.']);
    exit();
}

try {
    // Find user by username OR email
    $stmt = $pdo->prepare("SELECT * FROM user WHERE username = ? OR email = ?");
    $stmt->execute([$loginIdentifier, $loginIdentifier]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid username/email or password.']);
        exit();
    }

    // Start session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];

    echo json_encode([
        'success' => true,
        'message' => 'Login successful!',
        'user' => [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error during login: ' . $e->getMessage()]);
}
