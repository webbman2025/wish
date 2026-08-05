/**
 * Scrollable wish feed — all users' messages
 */
const WishFeed = {
    wishes: [],

    init() {
        this.feedEl = document.getElementById('wish-feed');
        this.emptyEl = document.getElementById('board-empty');
    },

    update(wishes) {
        this.wishes = wishes;
        this.render();
    },

    render() {
        if (!this.feedEl) return;

        this.feedEl.innerHTML = '';

        const isEmpty = this.wishes.length === 0;
        this.emptyEl?.classList.toggle('hidden', !isEmpty);
        this.feedEl.classList.toggle('hidden', isEmpty);

        this.wishes.forEach((wish) => {
            this.feedEl.appendChild(this.createCard(wish));
        });
    },

    createCard(wish) {
        const card = document.createElement('article');
        const isMine = wish.is_mine;
        card.className = 'wish-card' + (isMine ? ' wish-card-mine' : '') + (wish.winner ? ' wish-card-winner' : '');

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
