<?php

define('BLOCKED_WORDS_FILE', DATA_DIR . '/blocked_words.json');

function loadBlockedWords(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $defaults = [
        'profanity_en' => [],
        'profanity_zh' => [],
        'sensitive' => [],
    ];

    if (!file_exists(BLOCKED_WORDS_FILE)) {
        $cache = $defaults;
        return $cache;
    }

    $data = json_decode(file_get_contents(BLOCKED_WORDS_FILE), true) ?: [];
    $cache = array_merge($defaults, $data);

    return $cache;
}

function normalizeForModeration(string $text): string
{
    $text = mb_strtolower($text, 'UTF-8');
    $text = preg_replace('/\s+/u', '', $text);
    $text = preg_replace('/[^\p{L}\p{N}]/u', '', $text);

    $leet = ['0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a', '5' => 's', '7' => 't', '@' => 'a', '$' => 's'];
    $text = strtr($text, $leet);

    return $text;
}

function containsBlockedContent(string $text): bool
{
    return !isMessageAllowed($text)['allowed'];
}

function isMessageAllowed(string $text): array
{
    $original = $text;
    $normalized = normalizeForModeration($text);
    $lower = mb_strtolower($text, 'UTF-8');

    if (preg_match('/(http[s]?:\/\/|www\.)/i', $original)) {
        return ['allowed' => false, 'reason' => 'url'];
    }

    if (preg_match('/(\d{8}|\d{4}[\s-]?\d{4})/', $original)) {
        return ['allowed' => false, 'reason' => 'phone'];
    }

    $lists = loadBlockedWords();
    $allWords = array_merge(
        $lists['profanity_en'] ?? [],
        $lists['profanity_zh'] ?? [],
        $lists['sensitive'] ?? []
    );

    foreach ($allWords as $word) {
        $word = mb_strtolower(trim($word), 'UTF-8');
        if ($word === '') {
            continue;
        }

        $wordNorm = normalizeForModeration($word);

        if ($wordNorm !== '' && mb_strpos($normalized, $wordNorm) !== false) {
            return ['allowed' => false, 'reason' => 'blocked_word'];
        }

        if (mb_strlen($word) >= 3 && mb_strpos($lower, $word) !== false) {
            return ['allowed' => false, 'reason' => 'blocked_word'];
        }

        if (mb_strlen($word) < 3 && preg_match('/' . preg_quote($word, '/') . '/u', $lower)) {
            return ['allowed' => false, 'reason' => 'blocked_word'];
        }
    }

    return ['allowed' => true];
}
