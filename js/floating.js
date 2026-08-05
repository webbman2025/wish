/**
 * Floating wish message board
 */
const FloatingBoard = {
    containers: [],
    wishes: [],
    wishHash: '',
    colors: [
        'rgba(224, 64, 251, 0.25)',
        'rgba(255, 107, 53, 0.25)',
        'rgba(255, 209, 102, 0.25)',
        'rgba(6, 214, 160, 0.25)',
        'rgba(100, 149, 237, 0.25)',
        'rgba(255, 105, 180, 0.25)',
    ],
    boardColors: [
        '#ead9f7',
        '#ffd9c8',
        '#ffe9a8',
        '#b8ede0',
        '#c8d9f7',
        '#f5c8e0',
    ],
    pollInterval: null,
    pollMs: 30000,
    boardMode: false,

    init(containerIds = ['floating-board'], options = {}) {
        this.containers = containerIds
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        this.boardMode = options.boardMode || false;
        this.pollMs = this.boardMode ? 30000 : 30000;

        this.fetchWishes();
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(() => this.fetchWishes(), this.pollMs);
    },

    destroy() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        this.containers.forEach((c) => (c.innerHTML = ''));
        this.wishHash = '';
        this.boardMode = false;
    },

    async fetchWishes() {
        try {
            const mobile = MobileSession.get();
            const url = mobile
                ? `api/wishes.php?mobile=${encodeURIComponent(mobile)}`
                : 'api/wishes.php';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success && data.wishes) {
                this.wishes = data.wishes;
                const hash = this.wishes.map((w) => w.id).join(',');
                if (hash !== this.wishHash) {
                    this.wishHash = hash;
                    this.render();
                }
                WishFeed.update(this.wishes);
            }
        } catch (e) {
            console.warn('Failed to fetch wishes:', e);
        }
    },

    render() {
        this.containers.forEach((container) => {
            if (!container) return;
            container.innerHTML = '';

            if (this.wishes.length === 0) return;

            const pool = [...this.wishes].sort(() => Math.random() - 0.5);
            const slots = Math.max(pool.length, 12);

            for (let i = 0; i < slots; i++) {
                const wish = pool[i % pool.length];
                container.appendChild(this.createBubble(wish, i, slots));
            }
        });

        if (this.boardMode) {
            const emptyEl = document.getElementById('board-empty');
            if (emptyEl) {
                emptyEl.classList.toggle('hidden', this.wishes.length > 0);
            }
        }
    },

    createBubble(wish, index, total) {
        const bubble = document.createElement('div');
        const isMine = wish.is_mine;
        bubble.className = 'wish-bubble'
            + (wish.winner ? ' winner' : '')
            + (isMine ? ' mine' : '');
        bubble.textContent = wish.message;
        bubble.setAttribute('role', 'note');
        bubble.setAttribute('aria-label', wish.message);

        const top = 5 + (index / Math.max(total - 1, 1)) * 82;
        const duration = 22 + Math.random() * 18;
        const stagger = duration / total;
        const delay = -(index * stagger) - Math.random() * duration;
        const drift = (Math.random() - 0.5) * 40;
        const palette = this.boardMode ? this.boardColors : this.colors;
        const color = palette[Math.floor(Math.random() * palette.length)];
        const textColor = this.boardMode ? '#1a0f2e' : 'var(--text)';
        const opacity = this.boardMode
            ? 0.95 + Math.random() * 0.05
            : 0.65 + Math.random() * 0.3;

        bubble.style.cssText = `
            top: ${top}%;
            background: ${color};
            color: ${textColor};
            --duration: ${duration}s;
            --delay: ${delay}s;
            --drift: ${drift}px;
            --opacity: ${opacity};
        `;

        return bubble;
    },
};
