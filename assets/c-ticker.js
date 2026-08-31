class CoretexTicker extends HTMLElement {
    constructor() {
        super();

        if (this._getCookie('coretexTickerClosed')) {
            this.style.display = 'none';
            return;
        }

        this.tickerIndex = 0;
        this.tickerTimer = parseInt(this.getAttribute('pause')) || 4000;
    }

    _setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    }

    _getCookie(name) {
        return document.cookie.split('; ').reduce((r, v) => {
            const [key, val] = v.split('=');
            return key === name ? decodeURIComponent(val) : r;
        }, '');
    }

    _closeTicker() {
        this.style.display = 'none';
        this._setCookie('coretexTickerClosed', 'true', 7); // Set cookie for 1 week
    }

    connectedCallback() {
        this.tickers = Array.from(this.querySelectorAll('ul > li.item'));

        const closeButton = this.querySelector('[x-close]');
        if (closeButton) {
            closeButton.addEventListener('click', () => this._closeTicker());
        }

        if (this.tickers.length > 1) {
            this.showTickers();
        } else if (this.tickers.length === 1) {
            this.tickers[0].classList.add('active');
        }
    }

    showTickers() {
        this.tickers.forEach((ticker) => {
            ticker.classList.remove('active', 'upNext');
        });
        this.tickers[this.tickerIndex].classList.add('active');
        this.tickers[(this.tickerIndex + 1) % this.tickers.length].classList.add('upNext');
        this.tickerIndex = (this.tickerIndex + 1) % this.tickers.length;
        setTimeout(() => this.showTickers(), this.tickerTimer);
    }
}

customElements.define('coretex-ticker', CoretexTicker);
