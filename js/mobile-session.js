/**
 * Remember mobile number for cross-device "My Wishes"
 */
const MobileSession = {
    storageKey: 'wish-mobile',

    init() {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = this.normalize(params.get('mobile') || '');

        if (fromUrl && this.isValid(fromUrl)) {
            this.set(fromUrl);
            this.cleanUrl();
        }

        return this.get();
    },

    normalize(mobile) {
        let digits = (mobile || '').replace(/\D/g, '');
        if (digits.startsWith('852') && digits.length === 11) {
            digits = digits.slice(3);
        }
        return digits;
    },

    isValid(mobile) {
        return /^[569]\d{7}$/.test(mobile);
    },

    get() {
        return localStorage.getItem(this.storageKey) || '';
    },

    set(mobile) {
        const normalized = this.normalize(mobile);
        if (!this.isValid(normalized)) return false;
        localStorage.setItem(this.storageKey, normalized);
        return true;
    },

    getDisplay() {
        const mobile = this.get();
        if (!mobile) return '';
        return mobile.replace(/(\d{4})(\d{4})/, '$1 $2');
    },

    getShareUrl() {
        const url = new URL(window.location.href);
        url.searchParams.set('mobile', this.get());
        url.hash = '';
        return url.toString();
    },

    async copyShareLink() {
        try {
            await navigator.clipboard.writeText(this.getShareUrl());
            return true;
        } catch {
            return false;
        }
    },

    cleanUrl() {
        const url = new URL(window.location.href);
        url.searchParams.delete('mobile');
        window.history.replaceState({}, '', url);
    },
};
