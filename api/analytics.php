<?php
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['admin_logged_in'])) {
    jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
}

$wishes = readWishes();
$analytics = file_exists(ANALYTICS_FILE)
    ? json_decode(file_get_contents(ANALYTICS_FILE), true)
    : ['submissions' => 0, 'page_views' => 0, 'board_views' => 0, 'daily' => []];

$stats = [
    'total_submissions' => count($wishes),
    'pending' => count(array_filter($wishes, fn($w) => $w['status'] === 'pending')),
    'approved' => count(array_filter($wishes, fn($w) => $w['status'] === 'approved')),
    'rejected' => count(array_filter($wishes, fn($w) => $w['status'] === 'rejected')),
    'winners' => count(array_filter($wishes, fn($w) => $w['winner'] === '1')),
    'analytics' => $analytics,
];

jsonResponse(['success' => true, 'stats' => $stats]);
