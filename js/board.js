/**
 * Dedicated board page — floating messages only shown here after submit
 */
document.addEventListener('DOMContentLoaded', () => {
    MobileSession.init();
    I18n.init();
    WishFeed.init();
    FloatingBoard.init(['board-fullscreen'], { boardMode: true });

    fetch('api/wishes.php?track=board_view').catch(() => {});
});
