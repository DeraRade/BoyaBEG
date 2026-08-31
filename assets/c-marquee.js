if (!customElements.get('coretex-marquee')) {
    customElements.define('coretex-marquee', class CoretexMarquee extends HTMLElement {
        constructor() {
            super();
            this.resizeObserver = null;
            this.setupResizeObserver();
        }

        connectedCallback() {
            this.updateDuration(); // Initial setup
        }

        disconnectedCallback() {
            if (this.resizeObserver) {
                this.resizeObserver.disconnect(); // Clean up
            }
        }

        setupResizeObserver() {
            if (window.ResizeObserver) {
                this.resizeObserver = new ResizeObserver(entries => this.duration(entries));
                this.resizeObserver.observe(this);
            }
        }

        duration(entries) {
            const entry = entries[0];
            const contentWidth = entry.contentRect.width;
            const span = entry.target.querySelector('span');
            if (!span) return; // Ensure span element exists

            const scrollingSpeed = parseInt(this.getAttribute('speed') || 5);
            const slowFactor = contentWidth <= 375 ? 1 : contentWidth >= 1280 ? 3 : 1 + (contentWidth - 375) / (1280 - 375);
            const scrollingDuration = (scrollingSpeed * slowFactor * span.clientWidth / contentWidth).toFixed(3);

            this.style.setProperty('--coretexSpeed', `${scrollingDuration}s`);
        }

        updateDuration() {
            if (this.offsetWidth && this.querySelector('span')) this.duration([{ contentRect: { width: this.offsetWidth }, target: this }]);
        }
    });
}
