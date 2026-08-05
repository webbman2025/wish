<?php
session_start();
require_once __DIR__ . '/../api/config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD_HASH)) {
        $_SESSION['admin_logged_in'] = true;
        header('Location: index.php');
        exit;
    }
    $error = 'Invalid credentials';
}

if (!empty($_SESSION['admin_logged_in'])) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login — Make a Wish</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .login-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 2rem; width: 100%; max-width: 360px; }
        .login-card h1 { font-size: 1.25rem; margin-bottom: 1.5rem; text-align: center; }
        .login-error { color: #ff6b6b; font-size: 0.875rem; margin-bottom: 1rem; text-align: center; }
    </style>
</head>
<body>
    <div class="login-page">
        <form class="login-card" method="POST">
            <h1>Admin Login</h1>
            <?php if ($error): ?><p class="login-error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required autocomplete="username">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Login</button>
        </form>
    </div>
</body>
</html>
