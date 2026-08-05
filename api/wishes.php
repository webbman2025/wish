<?php
require_once __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $event = $_GET['track'] ?? '';
    if ($event === 'page_view') {
        trackAnalytics('page_views');
    } elseif ($event === 'board_view') {
        trackAnalytics('board_views');
    }
}

$mobile = sanitizeMobile($_GET['mobile'] ?? '');

$wishes = readWishes();
$visible = array_values(array_filter(
    $wishes,
    fn($w) => in_array($w['status'], ['approved', 'pending'], true)
));

usort($visible, fn($a, $b) => strcmp($b['timestamp'], $a['timestamp']));

$public = array_map(fn($w) => [
    'id' => $w['id'],
    'message' => $w['message'],
    'timestamp' => $w['timestamp'],
    'winner' => $w['winner'] === '1',
    'is_mine' => $mobile !== '' && isValidMobile($mobile) && ($w['mobile'] ?? '') === $mobile,
], $visible);

jsonResponse([
    'success' => true,
    'wishes' => $public,
    'count' => count($public),
]);
