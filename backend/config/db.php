<?php
// backend/config/db.php
// Dual environment database connection (Local XAMPP & InfinityFree Hosting)

$serverName = $_SERVER['HTTP_HOST'] ?? 'localhost';
$isLocal = ($serverName === 'localhost' || strpos($serverName, '127.0.0.1') !== false);

if ($isLocal) {
    // Local XAMPP Environment Settings
    $host = '127.0.0.1';
    $dbname = 'blog_app';
    $username = 'root';
    $password = '';
} else {
    // Live InfinityFree Hosting Environment Settings
    // NOTE: Update $host with your MySQL Hostname from InfinityFree "MySQL Databases" page
    $host = 'sql123.infinityfree.com'; // e.g. sql100.infinityfree.com or sql201.infinityfree.com
    $dbname = 'if0_42647426_blogapp';  // Your live database name
    $username = 'if0_42647426';        // Your live account username
    $password = 'qEGC9hbTvOdXf2';      // Your live hosting password
}

$charset = 'utf8mb4';
$dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}
