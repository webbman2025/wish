<?php

function apiMessage(string $key, string $lang = 'zh'): string
{
    $messages = [
        'zh' => [
            'too_short' => '訊息太短，請至少輸入 2 個字。',
            'too_long' => '訊息太長，請控制在 200 字以內。',
            'blocked' => '訊息包含不允許的內容，請修改後再試。',
            'rate_limit' => '提交次數過多，請稍後再試。',
            'success' => '許願成功！你的訊息已顯示於許願板。',
            'method_not_allowed' => '不允許的請求方式',
            'invalid_mobile' => '請輸入有效的香港手機號碼（8 位數字）。',
        ],
        'en' => [
            'too_short' => 'Your message is too short. Please enter at least 2 characters.',
            'too_long' => 'Your message is too long. Please keep it within 200 characters.',
            'blocked' => 'Your message contains disallowed content. Please edit and try again.',
            'rate_limit' => 'Too many submissions. Please try again later.',
            'success' => 'Wish submitted! Your message is now on the board.',
            'method_not_allowed' => 'Method not allowed',
            'invalid_mobile' => 'Please enter a valid Hong Kong mobile number (8 digits).',
        ],
    ];

    return $messages[$lang][$key] ?? $messages['zh'][$key] ?? $key;
}
