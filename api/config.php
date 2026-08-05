<?php
/**
 * Campaign configuration
 */

ini_set('display_errors', '0');

define('DATA_DIR', dirname(__DIR__) . '/data');
define('WISHES_FILE', DATA_DIR . '/wishes.csv');
define('RATE_LIMIT_FILE', DATA_DIR . '/rate_limits.json');
define('ANALYTICS_FILE', DATA_DIR . '/analytics.json');

define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '$2y$05$RqslwLbwzHoghqdASxd0mOVTGvnKzchkLn33QWh.es3hJLoebmU8C'); // changeme123

define('RATE_LIMIT_MAX', 5);
define('RATE_LIMIT_WINDOW', 3600);
define('RATE_LIMIT_ENABLED', false); // set true for production

define('MESSAGE_MIN_LENGTH', 2);
define('MESSAGE_MAX_LENGTH', 200);

define('CSV_HEADERS', ['id', 'mobile', 'message', 'timestamp', 'ip_address', 'status', 'winner', 'approved_at']);

function ensureDataDir(): void
{
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0750, true);
    }
}

function initWishesFile(): void
{
    ensureDataDir();
    if (!file_exists(WISHES_FILE)) {
        $fp = fopen(WISHES_FILE, 'w');
        fputcsv($fp, CSV_HEADERS, ',', '"', '\\');
        fclose($fp);
        return;
    }

    migrateWishesFileIfNeeded();
}

function migrateWishesFileIfNeeded(): void
{
    $fp = fopen(WISHES_FILE, 'r');
    if ($fp === false) {
        return;
    }

    $headers = fgetcsv($fp, 0, ',', '"', '\\') ?: [];
    fclose($fp);

    if ($headers === CSV_HEADERS) {
        return;
    }

    $wishes = [];
    $fp = fopen(WISHES_FILE, 'r');
    fgetcsv($fp, 0, ',', '"', '\\');
    while (($row = fgetcsv($fp, 0, ',', '"', '\\')) !== false) {
        $assoc = [];
        foreach ($headers as $i => $header) {
            $assoc[$header] = $row[$i] ?? '';
        }
        $wishes[] = normalizeWishRow($assoc);
    }
    fclose($fp);

    writeWishes($wishes);
}

function jsonResponse(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getClientIp(): string
{
    $headers = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_REAL_IP',
        'REMOTE_ADDR',
    ];

    foreach ($headers as $header) {
        if (empty($_SERVER[$header])) {
            continue;
        }

        foreach (explode(',', $_SERVER[$header]) as $ip) {
            $ip = trim($ip);
            if ($ip === '' || $ip === 'unknown') {
                continue;
            }
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }

    return '0.0.0.0';
}

function sanitizeMessage(string $text): string
{
    $text = strip_tags($text);
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);
    $text = preg_replace('/\s+/u', ' ', $text);
    return trim($text);
}

function sanitizeMobile(string $mobile): string
{
    $digits = preg_replace('/\D/', '', $mobile);
    if (str_starts_with($digits, '852') && strlen($digits) === 11) {
        $digits = substr($digits, 3);
    }
    return $digits;
}

function isValidMobile(string $mobile): bool
{
    return (bool) preg_match('/^[569]\d{7}$/', $mobile);
}

function maskMobile(string $mobile): string
{
    if (strlen($mobile) !== 8) {
        return '****';
    }
    return substr($mobile, 0, 4) . '****';
}

function checkRateLimit(string $ip): bool
{
    if (!RATE_LIMIT_ENABLED) {
        return true;
    }

    ensureDataDir();
    $limits = [];
    if (file_exists(RATE_LIMIT_FILE)) {
        $limits = json_decode(file_get_contents(RATE_LIMIT_FILE), true) ?: [];
    }

    $now = time();
    $windowStart = $now - RATE_LIMIT_WINDOW;

    foreach ($limits as $key => $timestamps) {
        $limits[$key] = array_values(array_filter($timestamps, fn($t) => $t > $windowStart));
        if (empty($limits[$key])) {
            unset($limits[$key]);
        }
    }

    $ipTimestamps = $limits[$ip] ?? [];
    if (count($ipTimestamps) >= RATE_LIMIT_MAX) {
        return false;
    }

    $ipTimestamps[] = $now;
    $limits[$ip] = $ipTimestamps;
    file_put_contents(RATE_LIMIT_FILE, json_encode($limits), LOCK_EX);

    return true;
}

function normalizeWishRow(array $row): array
{
    if (isset($row['message'])) {
        return array_merge(array_fill_keys(CSV_HEADERS, ''), $row);
    }

    // Legacy rows used wish_text instead of message
    return [
        'id' => $row['id'] ?? '',
        'mobile' => $row['mobile'] ?? '',
        'message' => $row['wish_text'] ?? $row['message'] ?? '',
        'timestamp' => $row['timestamp'] ?? '',
        'ip_address' => $row['ip_address'] ?? '',
        'status' => $row['status'] ?? 'approved',
        'winner' => $row['winner'] ?? '0',
        'approved_at' => $row['approved_at'] ?? '',
    ];
}

function readWishes(): array
{
    initWishesFile();
    $wishes = [];
    if (($fp = fopen(WISHES_FILE, 'r')) === false) {
        return [];
    }

    $headers = fgetcsv($fp, 0, ',', '"', '\\') ?: [];
    while (($row = fgetcsv($fp, 0, ',', '"', '\\')) !== false) {
        if (count($row) < 2) {
            continue;
        }

        $assoc = [];
        foreach ($headers as $i => $header) {
            $assoc[$header] = $row[$i] ?? '';
        }
        $wishes[] = normalizeWishRow($assoc);
    }
    fclose($fp);
    return $wishes;
}

function appendSubmission(string $mobile, string $message, string $ip): string
{
    initWishesFile();
    $id = bin2hex(random_bytes(8));
    $timestamp = date('c');

    $fp = fopen(WISHES_FILE, 'a');
    fputcsv($fp, [$id, $mobile, $message, $timestamp, $ip, 'approved', '0', $timestamp], ',', '"', '\\');
    fclose($fp);

    trackAnalytics('submission');

    return $id;
}

function trackAnalytics(string $event): void
{
    ensureDataDir();
    $analytics = ['submissions' => 0, 'page_views' => 0, 'board_views' => 0, 'daily' => []];
    if (file_exists(ANALYTICS_FILE)) {
        $analytics = json_decode(file_get_contents(ANALYTICS_FILE), true) ?: $analytics;
    }

    $today = date('Y-m-d');
    if (!isset($analytics['daily'][$today])) {
        $analytics['daily'][$today] = ['submissions' => 0, 'page_views' => 0, 'board_views' => 0];
    }

    if (isset($analytics[$event])) {
        $analytics[$event]++;
    }
    if (isset($analytics['daily'][$today][$event])) {
        $analytics['daily'][$today][$event]++;
    }

    file_put_contents(ANALYTICS_FILE, json_encode($analytics), LOCK_EX);
}

function writeWishes(array $wishes): void
{
    ensureDataDir();
    $fp = fopen(WISHES_FILE, 'w');
    fputcsv($fp, CSV_HEADERS, ',', '"', '\\');
    foreach ($wishes as $wish) {
        $wish = normalizeWishRow($wish);
        fputcsv($fp, [
            $wish['id'],
            $wish['mobile'],
            $wish['message'],
            $wish['timestamp'],
            $wish['ip_address'],
            $wish['status'],
            $wish['winner'],
            $wish['approved_at'] ?? '',
        ], ',', '"', '\\');
    }
    fclose($fp);
}

require_once __DIR__ . '/moderation.php';
