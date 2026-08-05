/**
 * Internationalization — Traditional Chinese (zh-HK) & English (en)
 */
const I18n = {
    lang: 'zh-HK',
    storageKey: 'wish-lang',

    strings: {
        'zh-HK': {
            'meta.description': '《我未許願先吹蠟燭》許願板 — 許下你的願望，贏取電影優惠券！',
            'page.title': '許願板 — 我未許願先吹蠟燭',
            'poster.alt': '《我未許願先吹蠟燭》電影海報',
            'movie.title': '我未許願<br>先吹蠟燭',
            'movie.subtitle': 'I Blew Out the Candle<br>Before Making a Wish',
            'intro': '在許願之前，蠟燭已悄然熄滅。<br>寫下你的願望，讓它飄向許願板。<br><strong>每週最佳許願，贏取電影優惠券！</strong>',
            'cta.makeWish': '許個願',
            'cta.viewOthers': '查看其他人的許願',
            'btn.back': '← 返回',
            'btn.backAria': '返回',
            'form.title': '許下你的願望',
            'form.desc': '寫下心中所願，吹熄蠟燭，讓願望飛向星空。',
            'form.label': '你的訊息',
            'form.placeholder': '我希望...',
            'form.mobileLabel': '手機號碼',
            'form.mobilePlaceholder': '9123 4567',
            'form.mobileHint': '用於同步你的許願記錄及發送優惠券（不會公開顯示）',
            'form.submit': '吹熄蠟燭 · 送出許願',
            'board.title': '許願板',
            'board.desc': '來自各方的願望，在星空中飄浮',
            'board.tabAll': '全部許願',
            'board.tabMine': '我的許願',
            'board.empty': '暫時還沒有許願，成為第一個許願的人吧！',
            'board.loading': '載入中…',
            'board.emptyMine': '你還未許過願，快來許下第一個願望吧！',
            'board.badgeMine': '你',
            'board.badgeWinner': '得獎',
            'sync.desc': '在其他裝置輸入相同手機號碼，即可查看你的許願記錄。',
            'sync.yourMobile': '你的手機號碼',
            'sync.copyLink': '複製同步連結',
            'sync.placeholder': '輸入手機號碼同步',
            'sync.linkBtn': '同步',
            'sync.copied': '連結已複製！在其他裝置開啟即可看到你的許願。',
            'sync.copyFailed': '無法複製，請手動複製網址列連結。',
            'sync.invalidMobile': '手機號碼格式不正確，請輸入 8 位香港號碼。',
            'sync.linked': '已同步！你的許願記錄已載入。',
            'sync.noMobile': '尚未登記手機號碼',
            'footer.copyright': '© 2026 3HK × 3SUPREME · 《我未許願先吹蠟燭》',
            'footer.note': '許願即時顯示 · 不當內容將被移除 · 個人資料受 PDPO 保障',
            'error.tooShort': '訊息太短，請至少輸入 2 個字。',
            'error.submitFailed': '提交失敗，請稍後再試。',
            'error.network': '網絡錯誤，請檢查連線後再試。',
            'error.invalidMobile': '請輸入有效的香港手機號碼（8 位數字）。',
            'error.blocked': '訊息包含不允許的內容，請修改後再試。',
            'lang.switch': 'EN',
            'lang.label': 'Switch to English',
        },
        en: {
            'meta.description': 'Make a Wish board for "I Blew Out the Candle Before Making a Wish" — share your wish and win movie vouchers!',
            'page.title': 'Make a Wish — I Blew Out the Candle Before Making a Wish',
            'poster.alt': 'I Blew Out the Candle Before Making a Wish movie poster',
            'movie.title': 'I Blew Out the Candle<br>Before Making a Wish',
            'movie.subtitle': '我未許願先吹蠟燭',
            'intro': 'Before you could make a wish, the candle was already out.<br>Write your wish and let it drift onto the board.<br><strong>Best wish each week wins a movie voucher!</strong>',
            'cta.makeWish': 'Make a Wish',
            'cta.viewOthers': 'View Other Wishes',
            'btn.back': '← Back',
            'btn.backAria': 'Back',
            'form.title': 'Make Your Wish',
            'form.desc': 'Write what you wish for, blow out the candle, and send it to the stars.',
            'form.label': 'Your message',
            'form.placeholder': 'I wish...',
            'form.mobileLabel': 'Mobile number',
            'form.mobilePlaceholder': '9123 4567',
            'form.mobileHint': 'Used to sync your wishes and send vouchers (not shown publicly)',
            'form.submit': 'Blow Out Candle · Submit',
            'board.title': 'Wish Board',
            'board.desc': 'Wishes from everyone, floating among the stars',
            'board.tabAll': 'All Wishes',
            'board.tabMine': 'My Wishes',
            'board.empty': 'No wishes yet — be the first to make one!',
            'board.loading': 'Loading…',
            'board.emptyMine': "You haven't made a wish yet — be the first!",
            'board.badgeMine': 'You',
            'board.badgeWinner': 'Winner',
            'sync.desc': 'Enter the same mobile number on another device to view your wishes.',
            'sync.yourMobile': 'Your mobile number',
            'sync.copyLink': 'Copy Sync Link',
            'sync.placeholder': 'Enter mobile to sync',
            'sync.linkBtn': 'Sync',
            'sync.copied': 'Link copied! Open it on another device to see your wishes.',
            'sync.copyFailed': 'Could not copy. Please copy the URL from the address bar.',
            'sync.invalidMobile': 'Invalid mobile number. Please enter an 8-digit HK number.',
            'sync.linked': 'Synced! Your wishes have been loaded.',
            'sync.noMobile': 'No mobile number saved yet',
            'footer.copyright': '© 2026 3HK × 3SUPREME · I Blew Out the Candle Before Making a Wish',
            'footer.note': 'Wishes appear live · Inappropriate content may be removed · Personal data protected under PDPO',
            'error.tooShort': 'Your message is too short. Please enter at least 2 characters.',
            'error.submitFailed': 'Submission failed. Please try again later.',
            'error.network': 'Network error. Please check your connection and try again.',
            'error.invalidMobile': 'Please enter a valid Hong Kong mobile number (8 digits).',
            'error.blocked': 'Your message contains disallowed content. Please edit and try again.',
            'lang.switch': '繁',
            'lang.label': 'Switch to Traditional Chinese',
        },
    },

    init() {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang');
        const stored = localStorage.getItem(this.storageKey);
        const browserEn = navigator.language?.startsWith('en');

        if (urlLang === 'en' || urlLang === 'zh-HK') {
            this.lang = urlLang;
        } else if (stored === 'en' || stored === 'zh-HK') {
            this.lang = stored;
        } else if (browserEn) {
            this.lang = 'en';
        }

        this.apply();
        this.bindToggle();
    },

    t(key) {
        return this.strings[this.lang]?.[key] ?? this.strings['zh-HK'][key] ?? key;
    },

    apply() {
        document.documentElement.lang = this.lang === 'en' ? 'en' : 'zh-HK';

        const title = this.t('page.title');
        document.title = title;

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = this.t('meta.description');

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            el.textContent = this.t(el.dataset.i18n);
        });

        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            el.innerHTML = this.t(el.dataset.i18nHtml);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });

        document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            el.setAttribute('aria-label', this.t(el.dataset.i18nAria));
        });

        document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
            el.alt = this.t(el.dataset.i18nAlt);
        });

        const toggle = document.getElementById('lang-toggle');
        if (toggle) {
            toggle.textContent = this.t('lang.switch');
            toggle.setAttribute('aria-label', this.t('lang.label'));
            toggle.setAttribute('title', this.t('lang.label'));
        }

        localStorage.setItem(this.storageKey, this.lang);

        if (typeof WishFeed !== 'undefined' && WishFeed.wishes?.length) {
            WishFeed.render();
        }

        if (typeof Moderation !== 'undefined' && !Moderation.lastAllowed && Moderation.hintEl) {
            Moderation.hintEl.textContent = this.t('error.blocked');
        }
    },

    toggle() {
        this.lang = this.lang === 'en' ? 'zh-HK' : 'en';
        this.apply();
    },

    bindToggle() {
        const toggle = document.getElementById('lang-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggle());
        }
    },

    getApiLang() {
        return this.lang === 'en' ? 'en' : 'zh';
    },
};
