/**
 * Scrollable wish feed — loads 10 at a time, more on scroll
 */
const WishFeed = {
    wishes: [],
    pageSize: 10,
    offset: 0,
    total: 0,
    hasMore: false,
    loading: false,
    observer: null,

    init() {
        this.feedEl = document.getElementById('wish-feed');
        this.emptyEl = document.getElementById('board-empty');
        this.sentinelEl = document.getElementById('wish-feed-sentinel');
        this.loadingEl = document.getElementById('wish-feed-loading');

        if (!this.feedEl) return;

        if (!this.sentinelEl) {
            this.sentinelEl = document.createElement('div');
            this.sentinelEl.id = 'wish-feed-sentinel';
            this.sentinelEl.className = 'wish-feed-sentinel';
            this.sentinelEl.setAttribute('aria-hidden', 'true');
            this.feedEl.insertAdjacentElement('afterend', this.sentinelEl);
        }

        this.setupObserver();
        this.resetAndLoad();
    },

    setupObserver() {
        if (this.observer) this.observer.disconnect();

        this.observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting) && this.hasMore && !this.loading) {
                    this.loadMore();
                }
            },
            { root: null, rootMargin: '240px', threshold: 0 }
        );

        this.observer.observe(this.sentinelEl);
    },

    resetAndLoad() {
        this.wishes = [];
        this.offset = 0;
        this.total = 0;
        this.hasMore = true;
        this.feedEl.innerHTML = '';
        this.loadMore();
    },

    buildUrl() {
        const params = new URLSearchParams({
            limit: String(this.pageSize),
            offset: String(this.offset),
        });
        const mobile = MobileSession.get();
        if (mobile) params.set('mobile', mobile);
        return `api/wishes.php?${params}`;
    },

    async loadMore() {
        if (this.loading || !this.hasMore) return;

        this.loading = true;
        this.loadingEl?.classList.remove('hidden');

        try {
            const res = await fetch(this.buildUrl());
            const data = await res.json();

            if (!data.success) return;

            const batch = data.wishes || [];
            this.total = data.total ?? 0;
            this.hasMore = data.has_more ?? false;
            this.offset += batch.length;

            batch.forEach((wish) => {
                this.wishes.push(wish);
                this.feedEl.appendChild(this.createCard(wish));
            });

            this.updateEmptyState();
        } catch (e) {
            console.warn('Failed to load wishes:', e);
        } finally {
            this.loading = false;
            this.loadingEl?.classList.add('hidden');
        }
    },

    updateEmptyState() {
        const isEmpty = this.total === 0 && !this.loading;
        this.emptyEl?.classList.toggle('hidden', !isEmpty);
        this.feedEl.classList.toggle('hidden', isEmpty);
        this.sentinelEl?.classList.toggle('hidden', !this.hasMore || isEmpty);
    },

    render() {
        if (!this.feedEl) return;

        this.feedEl.innerHTML = '';
        this.wishes.forEach((wish) => {
            this.feedEl.appendChild(this.createCard(wish));
        });
        this.updateEmptyState();
    },

    createCard(wish) {
        const card = document.createElement('article');
        const isMine = wish.is_mine;
        card.className = 'wish-card'
            + (isMine ? ' wish-card-mine' : '')
            + (wish.winner ? ' wish-card-winner' : '');
        card.dataset.wishId = wish.id;

        const text = document.createElement('p');
        text.className = 'wish-card-text';
        text.textContent = wish.message;

        const meta = document.createElement('div');
        meta.className = 'wish-card-meta';

        const time = document.createElement('time');
        time.dateTime = wish.timestamp;
        time.textContent = this.formatTime(wish.timestamp);
        meta.appendChild(time);

        if (isMine) {
            const badge = document.createElement('span');
            badge.className = 'wish-badge wish-badge-mine';
            badge.textContent = I18n.t('board.badgeMine');
            meta.appendChild(badge);
        }

        if (wish.winner) {
            const badge = document.createElement('span');
            badge.className = 'wish-badge wish-badge-winner';
            badge.textContent = I18n.t('board.badgeWinner');
            meta.appendChild(badge);
        }

        card.appendChild(text);
        card.appendChild(meta);
        return card;
    },

    formatTime(timestamp) {
        try {
            const date = new Date(timestamp);
            const locale = I18n.lang === 'en' ? 'en-HK' : 'zh-HK';
            return date.toLocaleString(locale, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    },
};
