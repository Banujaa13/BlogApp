<?php
// backend/api/register.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

// Support both JSON input payload and standard form body
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$username = trim($input['username'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Validation
if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields (username, email, password) are required.']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit();
}

if (strlen($username) < 3 || strlen($username) > 50) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username must be between 3 and 50 characters.']);
    exit();
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long.']);
    exit();
}

try {
    // Check duplicate email or username
    $checkStmt = $pdo->prepare("SELECT id, username, email FROM user WHERE username = ? OR email = ?");
    $checkStmt->execute([$username, $email]);
    $existing = $checkStmt->fetch();

    if ($existing) {
        http_response_code(409);
        if (strcasecmp($existing['username'], $username) === 0) {
            echo json_encode(['success' => false, 'message' => 'Username is already taken.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email address is already registered.']);
        }
        exit();
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert user
    $insertStmt = $pdo->prepare("INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, 'user')");
    $insertStmt->execute([$username, $email, $hashedPassword]);

    echo json_encode([
        'success' => true,
        'message' => 'Registration successful! You can now log in.'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error during registration: ' . $e->getMessage()]);
}
