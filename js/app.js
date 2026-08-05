/**
 * Main application controller
 */
const App = {
    sections: {},

    init() {
        MobileSession.init();
        I18n.init();
        Moderation.init();

        this.sections = {
            landing: document.getElementById('landing'),
            form: document.getElementById('wish-form-section'),
        };

        CandleAnimation.init();
        this.bindEvents();
        this.prefillMobile();
        this.trackPageView();
    },

    prefillMobile() {
        const mobile = MobileSession.get();
        const input = document.getElementById('mobile-input');
        if (mobile && input) {
            input.value = MobileSession.getDisplay();
        }
    },

    bindEvents() {
        document.getElementById('cta-make-wish').addEventListener('click', () => {
            this.showSection('form');
            CandleAnimation.relight();
            this.prefillMobile();
        });

        document.getElementById('btn-back-landing').addEventListener('click', () => {
            this.showSection('landing');
            this.resetForm();
        });

        const messageInput = document.getElementById('message-input');
        const charCount = document.getElementById('char-count');
        messageInput.addEventListener('input', () => {
            charCount.textContent = messageInput.value.length;
        });

        document.getElementById('wish-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitWish();
        });
    },

    showSection(name) {
        Object.entries(this.sections).forEach(([key, el]) => {
            if (el) el.classList.toggle('hidden', key !== name);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    resetForm() {
        const mobile = MobileSession.get();
        document.getElementById('wish-form').reset();
        if (mobile) {
            document.getElementById('mobile-input').value = MobileSession.getDisplay();
        }
        document.getElementById('char-count').textContent = '0';
        document.getElementById('form-error').classList.add('hidden');
        document.getElementById('moderation-hint')?.classList.add('hidden');
        document.getElementById('form-success').classList.add('hidden');
        CandleAnimation.relight();
        document.getElementById('btn-submit').disabled = false;
    },

    async submitWish() {
        const mobileInput = document.getElementById('mobile-input');
        const messageInput = document.getElementById('message-input');
        const errorEl = document.getElementById('form-error');
        const successEl = document.getElementById('form-success');
        const submitBtn = document.getElementById('btn-submit');

        const mobile = MobileSession.normalize(mobileInput.value);
        const message = messageInput.value.trim();

        errorEl.classList.add('hidden');
        successEl.classList.add('hidden');

        if (!MobileSession.isValid(mobile)) {
            errorEl.textContent = I18n.t('error.invalidMobile');
            errorEl.classList.remove('hidden');
            return;
        }

        if (message.length < 2) {
            errorEl.textContent = I18n.t('error.tooShort');
            errorEl.classList.remove('hidden');
            return;
        }

        if (!Moderation.isAllowed()) {
            errorEl.textContent = I18n.t('error.blocked');
            errorEl.classList.remove('hidden');
            return;
        }

        submitBtn.disabled = true;

        await CandleAnimation.blowOut();

        try {
            const res = await fetch('api/submit.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile,
                    message,
                    lang: I18n.getApiLang(),
                }),
            });

            const data = await res.json();

            if (data.success) {
                MobileSession.set(mobile);
                successEl.textContent = data.message;
                successEl.classList.remove('hidden');

                setTimeout(() => {
                    window.location.href = 'board.html';
                }, 1500);
            } else {
                errorEl.textContent = data.error || I18n.t('error.submitFailed');
                errorEl.classList.remove('hidden');
                CandleAnimation.relight();
                submitBtn.disabled = false;
            }
        } catch (e) {
            errorEl.textContent = I18n.t('error.network');
            errorEl.classList.remove('hidden');
            CandleAnimation.relight();
            submitBtn.disabled = false;
        }
    },

    trackPageView() {
        fetch('api/wishes.php?track=page_view').catch(() => {});
    },
};

document.addEventListener('DOMContentLoaded', () => App.init());
