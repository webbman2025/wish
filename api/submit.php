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
$mobile = sanitizeMobile($input['mobile'] ?? '');
$message = sanitizeMessage($input['message'] ?? $input['wish'] ?? '');

if (!isValidMobile($mobile)) {
    jsonResponse(['success' => false, 'error' => apiMessage('invalid_mobile', $lang)], 400);
}

if (mb_strlen($message) < MESSAGE_MIN_LENGTH) {
    jsonResponse(['success' => false, 'error' => apiMessage('too_short', $lang)], 400);
}

if (mb_strlen($message) > MESSAGE_MAX_LENGTH) {
    jsonResponse(['success' => false, 'error' => apiMessage('too_long', $lang)], 400);
}

if (containsBlockedContent($message)) {
    jsonResponse(['success' => false, 'error' => apiMessage('blocked', $lang)], 400);
}

$ip = getClientIp();

if (!checkRateLimit($ip)) {
    jsonResponse(['success' => false, 'error' => apiMessage('rate_limit', $lang)], 429);
}

$id = appendSubmission($mobile, $message, $ip);

jsonResponse([
    'success' => true,
    'id' => $id,
    'message' => apiMessage('success', $lang),
]);
