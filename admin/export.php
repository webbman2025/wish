<?php
session_start();
require_once __DIR__ . '/../api/config.php';

if (empty($_SESSION['admin_logged_in'])) {
    http_response_code(403);
    exit('Forbidden');
}

initWishesFile();

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="wishes_export_' . date('Y-m-d') . '.csv"');

readfile(WISHES_FILE);
