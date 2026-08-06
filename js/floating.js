/**
 * Floating wish message board
 * Board mode: wide horizontal track — bubbles float per section, swipe to explore
 */
const FloatingBoard = {
    containers: [],
    wishes: [],
    allWishes: [],
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
        '#FFFFFF',
        '#FFF8F0',
        '#F5F0FF',
        '#FFF9E6',
        '#EEF9FF',
        '#F0FFF4',
    ],
    pollInterval: null,
    pollMs: 30000,
    boardMode: false,
    scrollContainer: null,
    pageSize: 15,
    wishesPerSection: 5,
    hasMore: true,
    loadingMore: false,
    autoPanId: null,
    autoPanPaused: false,
    resumePanTimer: null,

    init(containerIds = ['floating-board'], options = {}) {
        this.containers = containerIds
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        this.boardMode = options.boardMode || false;
        this.pollMs = 30000;

        if (this.boardMode) {
            this.setupBoardScroll();
        }

        this.fetchWishes(true);

        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(() => this.fetchWishes(false), this.pollMs);
    },

    destroy() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        if (this.autoPanId) {
            cancelAnimationFrame(this.autoPanId);
            this.autoPanId = null;
        }
        if (this.resumePanTimer) {
            clearTimeout(this.resumePanTimer);
            this.resumePanTimer = null;
        }
        this.containers.forEach((c) => (c.innerHTML = ''));
        this.wishHash = '';
        this.allWishes = [];
        this.boardMode = false;
        this.scrollContainer = null;
    },

    setupBoardScroll() {
        const container = this.containers[0];
        if (!container) return;

        container.classList.add('board-scroll-viewport');
        this.scrollContainer = container;

        const area = container.closest('.board-floating-area');
        if (area && !area.querySelector('.floating-swipe-hint')) {
            const hint = document.createElement('p');
            hint.className = 'floating-swipe-hint';
            hint.setAttribute('data-i18n', 'board.swipeHint');
            hint.textContent = typeof I18n !== 'undefined' ? I18n.t('board.swipeHint') : '← 滑動查看更多 →';
            area.appendChild(hint);
        }

        const onInteract = () => {
            this.pauseAutoPan();
            this.hideSwipeHint();
            clearTimeout(this.resumePanTimer);
            this.resumePanTimer = setTimeout(() => this.resumeAutoPan(), 4000);
        };

        const onScroll = () => {
            onInteract();
            this.checkLoadMore();
        };

        container.addEventListener('touchstart', onInteract, { passive: true });
        container.addEventListener('mousedown', onInteract);
        container.addEventListener('wheel', onInteract, { passive: true });
        container.addEventListener('scroll', onScroll, { passive: true });

        this.startAutoPan();
    },

    startAutoPan() {
        if (!this.boardMode || !this.scrollContainer) return;

        const tick = () => {
            const el = this.scrollContainer;
            if (!this.autoPanPaused && el) {
                const max = el.scrollWidth - el.clientWidth;
                if (max > 1) {
                    if (el.scrollLeft >= max - 2) {
                        if (this.hasMore && !this.loadingMore) {
                            this.loadMore();
                        } else {
                            el.scrollLeft = 0;
                        }
                    } else {
                        el.scrollLeft += 0.35;
                    }
                }
            }
            this.autoPanId = requestAnimationFrame(tick);
        };

        if (this.autoPanId) cancelAnimationFrame(this.autoPanId);
        this.autoPanId = requestAnimationFrame(tick);
    },

    pauseAutoPan() {
        this.autoPanPaused = true;
    },

    resumeAutoPan() {
        this.autoPanPaused = false;
    },

    hideSwipeHint() {
        document.querySelector('.floating-swipe-hint')?.classList.add('is-hidden');
    },

    buildUrl(offset, limit) {
        const params = new URLSearchParams({
            limit: String(limit ?? this.pageSize),
            offset: String(offset ?? 0),
        });
        const mobile = MobileSession.get();
        if (mobile) params.set('mobile', mobile);
        return `api/wishes.php?${params}`;
    },

    async fetchWishes(initial = false) {
        try {
            const res = await fetch(this.buildUrl(0, this.pageSize));
            const data = await res.json();
            if (!data.success || !data.wishes) return;

            if (this.boardMode) {
                const hash = data.wishes.map((w) => w.id).join(',');
                if (!initial && hash === this.wishHash) return;

                if (initial || this.allWishes.length === 0) {
                    this.allWishes = data.wishes;
                    this.hasMore = data.has_more ?? false;
                    this.wishHash = hash;
                    this.renderBoardTrack();
                } else {
                    const existing = new Set(this.allWishes.map((w) => w.id));
                    const fresh = data.wishes.filter((w) => !existing.has(w.id));
                    if (fresh.length && this.scrollContainer && this.scrollContainer.scrollLeft < 20) {
                        this.allWishes = [...fresh, ...this.allWishes];
                        this.prependSections(fresh);
                    }
                    this.wishHash = hash;
                }
                return;
            }

            this.wishes = data.wishes;
            const hash = this.wishes.map((w) => w.id).join(',');
            if (hash !== this.wishHash) {
                this.wishHash = hash;
                this.renderLegacy();
            }
        } catch (e) {
            console.warn('Failed to fetch wishes:', e);
        }
    },

    async loadMore() {
        if (!this.boardMode || !this.hasMore || this.loadingMore) return;

        this.loadingMore = true;
        try {
            const res = await fetch(this.buildUrl(this.allWishes.length, this.pageSize));
            const data = await res.json();
            if (!data.success) return;

            const batch = data.wishes || [];
            if (batch.length) {
                const existing = new Set(this.allWishes.map((w) => w.id));
                const unique = batch.filter((w) => !existing.has(w.id));
                if (unique.length) {
                    this.allWishes.push(...unique);
                    this.appendSections(unique);
                }
            }
            this.hasMore = data.has_more ?? false;
        } catch (e) {
            console.warn('Failed to load more wishes:', e);
        } finally {
            this.loadingMore = false;
        }
    },

    checkLoadMore() {
        const el = this.scrollContainer;
        if (!el || !this.hasMore || this.loadingMore) return;

        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - el.clientWidth * 0.6) {
            this.loadMore();
        }
    },

    chunkWishes(wishes, size = this.wishesPerSection) {
        const chunks = [];
        for (let i = 0; i < wishes.length; i += size) {
            chunks.push(wishes.slice(i, i + size));
        }
        return chunks;
    },

    renderBoardTrack() {
        const container = this.containers[0];
        if (!container) return;

        container.innerHTML = '';
        if (this.allWishes.length === 0) return;

        const track = document.createElement('div');
        track.className = 'floating-track';

        this.chunkWishes(this.allWishes).forEach((chunk, index) => {
            track.appendChild(this.createSection(chunk, index));
        });

        container.appendChild(track);
    },

    appendSections(wishes) {
        const track = this.scrollContainer?.querySelector('.floating-track');
        if (!track || wishes.length === 0) return;

        const baseIndex = track.querySelectorAll('.floating-section').length;
        this.chunkWishes(wishes).forEach((chunk, i) => {
            track.appendChild(this.createSection(chunk, baseIndex + i));
        });
    },

    prependSections(wishes) {
        const track = this.scrollContainer?.querySelector('.floating-track');
        if (!track || wishes.length === 0) return;

        const el = this.scrollContainer;
        const prevWidth = track.scrollWidth;

        this.chunkWishes(wishes).reverse().forEach((chunk, i, arr) => {
            const section = this.createSection(chunk, 0);
            track.insertBefore(section, track.firstChild);
        });

        if (el) {
            const added = track.scrollWidth - prevWidth;
            el.scrollLeft += added;
        }
    },

    createSection(wishes, sectionIndex) {
        const section = document.createElement('div');
        section.className = 'floating-section';
        section.setAttribute('role', 'group');
        section.setAttribute('aria-label', `Wishes ${sectionIndex + 1}`);

        const slots = Math.max(wishes.length, 6);
        const pool = [...wishes].sort(() => Math.random() - 0.5);

        for (let i = 0; i < slots; i++) {
            section.appendChild(this.createBubble(pool[i % pool.length], i, slots));
        }

        return section;
    },

    renderLegacy() {
        this.containers.forEach((container) => {
            if (!container) return;
            container.innerHTML = '';

            if (this.wishes.length === 0) return;

            const pool = [...this.wishes].sort(() => Math.random() - 0.5);
            const slots = Math.max(pool.length, 12);

            for (let i = 0; i < slots; i++) {
                container.appendChild(this.createBubble(pool[i % pool.length], i, slots));
            }
        });
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

        const top = this.boardMode
            ? 8 + (index / Math.max(total - 1, 1)) * 62
            : 5 + (index / Math.max(total - 1, 1)) * 82;
        const duration = 22 + Math.random() * 18;
        const stagger = duration / total;
        const delay = -(index * stagger) - Math.random() * duration;
        const drift = (Math.random() - 0.5) * 40;
        const palette = this.boardMode ? this.boardColors : this.colors;
        let color;
        if (this.boardMode && wish.winner) {
            color = '#FFFBEB';
        } else if (this.boardMode && isMine) {
            color = '#ECFDF5';
        } else {
            color = palette[Math.floor(Math.random() * palette.length)];
        }
        const textColor = this.boardMode ? '#1A1033' : 'var(--text)';
        const opacity = this.boardMode
            ? 1
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
