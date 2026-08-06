<?php
session_start();
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $id = $_POST['id'] ?? '';
    $wishes = readWishes();

    if ($action === 'delete') {
        $wishes = array_values(array_filter($wishes, fn($w) => $w['id'] !== $id));
        writeWishes($wishes);
        header('Location: index.php?deleted=1');
        exit;
    }

    foreach ($wishes as &$wish) {
        if ($wish['id'] !== $id) continue;

        switch ($action) {
            case 'winner':
                $wish['winner'] = '1';
                break;
            case 'unwinner':
                $wish['winner'] = '0';
                break;
        }
    }
    unset($wish);

    writeWishes($wishes);
    header('Location: index.php?updated=1');
    exit;
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit;
}

$wishes = readWishes();
usort($wishes, fn($a, $b) => strcmp($b['timestamp'], $a['timestamp']));

$filter = $_GET['filter'] ?? 'all';
if ($filter === 'winners') {
    $wishes = array_values(array_filter($wishes, fn($w) => $w['winner'] === '1'));
}

$analytics = file_exists(ANALYTICS_FILE)
    ? json_decode(file_get_contents(ANALYTICS_FILE), true)
    : ['submissions' => 0, 'page_views' => 0, 'board_views' => 0, 'daily' => []];
?>
<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel — Make a Wish</title>
    <link rel="stylesheet" href="../../css/style.css">
    <style>
        .admin-page { max-width: 960px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
        .admin-header h1 { font-size: 1.25rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
        .stat-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; text-align: center; }
        .stat-card .value { font-size: 1.75rem; font-weight: 700; color: var(--gold); }
        .stat-card .label { font-size: 0.75rem; opacity: 0.7; margin-top: 0.25rem; }
        .filter-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .filter-tabs a { padding: 0.4rem 0.75rem; border-radius: 999px; font-size: 0.8rem; text-decoration: none; color: var(--text); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); }
        .filter-tabs a.active { background: var(--gold); color: #1a0f2e; border-color: var(--gold); }
        .wish-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .wish-item { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; }
        .wish-item-body { flex: 1; min-width: 0; }
        .winner-trophy { flex-shrink: 0; font-size: 3.5rem; line-height: 1; margin-left: auto; filter: drop-shadow(0 2px 10px rgba(255, 209, 102, 0.45)); }
        .wish-item.approved { border-left: 3px solid #06d6a0; }
        .wish-item.winner { border-left: 3px solid var(--gold); background: rgba(255, 215, 100, 0.08); }
        .wish-text { font-size: 0.95rem; margin-bottom: 0.5rem; line-height: 1.5; }
        .wish-meta { font-size: 0.75rem; opacity: 0.6; margin-bottom: 0.75rem; }
        .wish-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .wish-actions button, .wish-actions .btn-sm { font-size: 0.75rem; padding: 0.35rem 0.75rem; }
        .btn-sm { border-radius: 6px; border: none; cursor: pointer; font-family: inherit; }
        .btn-winner { background: var(--gold); color: #1a0f2e; }
        .btn-delete { background: #7f1d1d; color: #fff; }
        .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: var(--text); }
        .badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; }
        .badge-winner { background: rgba(255,215,100,0.25); color: var(--gold); }
        .badge-ip { background: rgba(100,149,237,0.2); color: #6495ed; font-family: ui-monospace, monospace; text-transform: none; font-weight: 500; }
        .updated-toast { background: rgba(6,214,160,0.15); border: 1px solid #06d6a0; color: #06d6a0; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }
        .deleted-toast { background: rgba(239,71,111,0.15); border: 1px solid #ef476f; color: #ef476f; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }
        .export-link { font-size: 0.8rem; color: var(--gold); }
    </style>
</head>
<body>
    <div class="admin-page">
        <div class="admin-header">
            <h1>許願板 Admin</h1>
            <div>
                <a href="export.php" class="export-link">Export CSV</a>
                &nbsp;·&nbsp;
                <a href="?logout=1" class="export-link">Logout</a>
            </div>
        </div>

        <?php if (isset($_GET['updated'])): ?>
            <div class="updated-toast">Updated successfully.</div>
        <?php endif; ?>
        <?php if (isset($_GET['deleted'])): ?>
            <div class="deleted-toast">Wish deleted.</div>
        <?php endif; ?>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="value"><?= count(readWishes()) ?></div>
                <div class="label">Total Wishes</div>
            </div>
            <div class="stat-card">
                <div class="value"><?= $analytics['page_views'] ?? 0 ?></div>
                <div class="label">Page Views</div>
            </div>
            <div class="stat-card">
                <div class="value"><?= $analytics['board_views'] ?? 0 ?></div>
                <div class="label">Board Views</div>
            </div>
            <div class="stat-card">
                <div class="value"><?= count(array_filter(readWishes(), fn($w) => $w['winner'] === '1')) ?></div>
                <div class="label">Winners</div>
            </div>
        </div>

        <div class="filter-tabs">
            <a href="?filter=all" class="<?= $filter === 'all' ? 'active' : '' ?>">All</a>
            <a href="?filter=winners" class="<?= $filter === 'winners' ? 'active' : '' ?>">Winners</a>
        </div>

        <div class="wish-list">
            <?php if (empty($wishes)): ?>
                <p style="opacity:0.6;text-align:center;padding:2rem;">No wishes yet.</p>
            <?php endif; ?>
            <?php foreach ($wishes as $wish): ?>
                <?php
                    $classes = [];
                    if ($wish['winner'] === '1') $classes[] = 'winner';
                ?>
                <div class="wish-item <?= implode(' ', $classes) ?>">
                    <div class="wish-item-body">
                    <div class="wish-text"><?= htmlspecialchars($wish['message']) ?></div>
                    <div class="wish-meta">
                        <span><strong>Mobile:</strong> <?= htmlspecialchars($wish['mobile'] ?? '—') ?></span>
                        &nbsp;·&nbsp;
                        <span><strong>IP:</strong> <span class="badge badge-ip"><?= htmlspecialchars($wish['ip_address'] ?? '—') ?></span></span>
                        &nbsp;·&nbsp;
                        <span><strong>Time:</strong> <?= date('Y-m-d H:i', strtotime($wish['timestamp'])) ?></span>
                        <?php if ($wish['winner'] === '1'): ?>
                            &nbsp;·&nbsp;<span class="badge badge-winner">Winner</span>
                        <?php endif; ?>
                    </div>
                    <div class="wish-actions">
                        <?php if ($wish['winner'] !== '1'): ?>
                            <form method="POST" style="display:inline">
                                <input type="hidden" name="id" value="<?= htmlspecialchars($wish['id']) ?>">
                                <input type="hidden" name="action" value="winner">
                                <button type="submit" class="btn-sm btn-winner">Select Winner</button>
                            </form>
                        <?php endif; ?>
                        <?php if ($wish['winner'] === '1'): ?>
                            <form method="POST" style="display:inline">
                                <input type="hidden" name="id" value="<?= htmlspecialchars($wish['id']) ?>">
                                <input type="hidden" name="action" value="unwinner">
                                <button type="submit" class="btn-sm btn-outline">Remove Winner</button>
                            </form>
                        <?php endif; ?>
                        <form method="POST" style="display:inline" onsubmit="return confirm('Delete this wish permanently?');">
                            <input type="hidden" name="id" value="<?= htmlspecialchars($wish['id']) ?>">
                            <input type="hidden" name="action" value="delete">
                            <button type="submit" class="btn-sm btn-delete">Delete</button>
                        </form>
                    </div>
                    </div>
                    <?php if ($wish['winner'] === '1'): ?>
                        <div class="winner-trophy" aria-label="Winner" title="Winner">🏆</div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</body>
</html>
