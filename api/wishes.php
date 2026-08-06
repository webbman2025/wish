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
$limit = min(max((int) ($_GET['limit'] ?? 10), 1), 50);
$offset = max((int) ($_GET['offset'] ?? 0), 0);

$wishes = readWishes();
$visible = array_values(array_filter(
    $wishes,
    fn($w) => $w['status'] === 'approved'
));

usort($visible, fn($a, $b) => strcmp($b['timestamp'], $a['timestamp']));

$total = count($visible);
$paged = array_slice($visible, $offset, $limit);

$public = array_map(fn($w) => [
    'id' => $w['id'],
    'message' => $w['message'],
    'timestamp' => $w['timestamp'],
    'winner' => $w['winner'] === '1',
    'is_mine' => $mobile !== '' && isValidMobile($mobile) && ($w['mobile'] ?? '') === $mobile,
], $paged);

jsonResponse([
    'success' => true,
    'wishes' => $public,
    'count' => count($public),
    'total' => $total,
    'offset' => $offset,
    'limit' => $limit,
    'has_more' => ($offset + count($public)) < $total,
]);
