/**
 * Client-side message moderation check (server-backed)
 */
const Moderation = {
    debounceTimer: null,
    lastAllowed: true,

    init() {
        this.input = document.getElementById('message-input');
        this.hintEl = document.getElementById('moderation-hint');
        this.submitBtn = document.getElementById('btn-submit');

        if (!this.input) return;

        this.input.addEventListener('input', () => this.onInput());
    },

    onInput() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.check(), 400);
    },

    async check() {
        const message = this.input.value.trim();

        if (message.length < 2) {
            this.setAllowed(true);
            return;
        }

        try {
            const res = await fetch('api/check-message.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    lang: I18n.getApiLang(),
                }),
            });
            const data = await res.json();
            this.setAllowed(data.allowed);
        } catch {
            this.setAllowed(true);
        }
    },

    setAllowed(allowed) {
        this.lastAllowed = allowed;

        if (this.submitBtn) {
            this.submitBtn.disabled = !allowed;
        }

        if (this.hintEl) {
            if (!allowed) {
                this.hintEl.textContent = I18n.t('error.blocked');
                this.hintEl.classList.remove('hidden');
            } else {
                this.hintEl.classList.add('hidden');
            }
        }
    },

    isAllowed() {
        return this.lastAllowed;
    },
};
