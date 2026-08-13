<?php
// backend/api/session_check.php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth_check.php';

$user = get_auth_user();

if ($user) {
    echo json_encode([
        'isLoggedIn' => true,
        'user' => $user
    ]);
} else {
    echo json_encode([
        'isLoggedIn' => false,
        'user' => null
    ]);
}
