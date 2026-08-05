<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/i18n.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => apiMessage('method_not_allowed', 'en')], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$lang = ($input['lang'] ?? 'zh') === 'en' ? 'en' : 'zh';
$message = sanitizeMessage($input['message'] ?? '');

$result = isMessageAllowed($message);

jsonResponse([
    'allowed' => $result['allowed'],
    'error' => $result['allowed'] ? null : apiMessage('blocked', $lang),
]);
