<?php
/**
 * Optional REST API for my3 / 3SUPREME app integration
 * Requires API key authentication
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// API key — set via environment or change before deployment
define('APP_API_KEY', getenv('WISH_API_KEY') ?: 'your-secret-api-key-here');

$providedKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
if ($providedKey !== APP_API_KEY) {
    jsonResponse(['success' => false, 'error' => 'Invalid API key'], 401);
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'stats':
        $wishes = readWishes();
        $analytics = file_exists(ANALYTICS_FILE)
            ? json_decode(file_get_contents(ANALYTICS_FILE), true)
            : [];

        jsonResponse([
            'success' => true,
            'data' => [
                'total_wishes' => count($wishes),
                'approved' => count(array_filter($wishes, fn($w) => $w['status'] === 'approved')),
                'pending' => count(array_filter($wishes, fn($w) => $w['status'] === 'pending')),
                'winners' => count(array_filter($wishes, fn($w) => $w['winner'] === '1')),
                'page_views' => $analytics['page_views'] ?? 0,
                'board_views' => $analytics['board_views'] ?? 0,
            ],
        ]);
        break;

    case 'recent':
        $limit = min((int)($_GET['limit'] ?? 10), 50);
        $wishes = readWishes();
        $approved = array_values(array_filter($wishes, fn($w) => $w['status'] === 'approved'));
        usort($approved, fn($a, $b) => strcmp($b['timestamp'], $a['timestamp']));
        $recent = array_slice($approved, 0, $limit);

        jsonResponse([
            'success' => true,
            'data' => array_map(fn($w) => [
                'id' => $w['id'],
                'message' => $w['message'],
                'timestamp' => $w['timestamp'],
                'winner' => $w['winner'] === '1',
            ], $recent),
        ]);
        break;

    case 'winners':
        $wishes = readWishes();
        $winners = array_values(array_filter($wishes, fn($w) => $w['winner'] === '1'));

        jsonResponse([
            'success' => true,
            'data' => array_map(fn($w) => [
                'id' => $w['id'],
                'mobile' => $w['mobile'],
                'message' => $w['message'],
                'timestamp' => $w['timestamp'],
                'approved_at' => $w['approved_at'] ?? '',
            ], $winners),
        ]);
        break;

    default:
        jsonResponse(['success' => false, 'error' => 'Unknown action. Available: stats, recent, winners'], 400);
}
