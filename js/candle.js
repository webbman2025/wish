/**
 * Candle blow-out animation controller
 */
const CandleAnimation = {
    flame: null,
    smoke: null,
    isBlownOut: false,

    init() {
        this.flame = document.getElementById('flame');
        this.smoke = document.getElementById('smoke');
    },

    reset() {
        this.isBlownOut = false;
        if (this.flame) {
            this.flame.classList.remove('blown-out');
            this.flame.style.display = '';
        }
        if (this.smoke) {
            this.smoke.classList.add('hidden');
        }
    },

    blowOut() {
        return new Promise((resolve) => {
            if (!this.flame || this.isBlownOut) {
                resolve();
                return;
            }

            this.isBlownOut = true;
            this.flame.classList.add('blown-out');

            setTimeout(() => {
                if (this.smoke) {
                    this.smoke.classList.remove('hidden');
                }
            }, 400);

            setTimeout(resolve, 1200);
        });
    },

    relight() {
        this.reset();
    },
};
