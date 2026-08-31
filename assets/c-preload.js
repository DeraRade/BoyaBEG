class CoretexPreload extends HTMLElement {
	constructor() {
		super();
		this._init();
	}

	connectedCallback() {
		// Shopify editor exclusive
		if (typeof Shopify !== "undefined" && Shopify.designMode && !this.hasAttribute("data-nosdm")) {
			// In design mode, start with preloader hidden unless section is selected
			this._hidePreloader();

			document.addEventListener("shopify:section:select", (event) => this._filterShopifyEvent(event, this._showPreloader.bind(this)));
			document.addEventListener("shopify:section:deselect", (event) => this._filterShopifyEvent(event, this._hidePreloader.bind(this)));
			return;
		}

		// Normal mode - handle page load
		if (document.readyState === "complete") {
			this._handlePageLoaded();
			return;
		}

		window.addEventListener("load", this._handlePageLoaded.bind(this));
	}

	disconnectedCallback() {
		window.removeEventListener("load", this._handlePageLoaded.bind(this));

		// Clean up Shopify event listeners
		if (typeof Shopify !== "undefined" && Shopify.designMode && !this.hasAttribute("data-nosdm")) {
			document.removeEventListener("shopify:section:select", (event) => this._filterShopifyEvent(event, this._showPreloader.bind(this)));
			document.removeEventListener("shopify:section:deselect", (event) => this._filterShopifyEvent(event, this._hidePreloader.bind(this)));
		}
	}

	_init() {
		// Set initial state
		this.setAttribute("aria-hidden", "true");
		this.setAttribute("role", "presentation");
	}

	_handlePageLoaded() {
		const delay = this._getDelay();

		if (delay > 0) {
			setTimeout(() => {
				this._applyLoadedState();
			}, delay);
		} else {
			this._applyLoadedState();
		}
	}

	_getDelay() {
		const delayAttr = this.getAttribute("delay");
		if (!delayAttr) return 0;

		const delayInSeconds = parseFloat(delayAttr);
		if (isNaN(delayInSeconds)) return 0;

		// Convert seconds to milliseconds and ensure non-negative
		return Math.max(0, delayInSeconds * 1000);
	}

	_applyLoadedState() {
		// Add loaded class to body
		document.body.classList.add("loaded");

		// Add loaded attribute to preloader
		this.setAttribute("loaded", "");

		// Dispatch custom event for other components
		this.dispatchEvent(
			new CustomEvent("coretex:preload:complete", {
				bubbles: true,
				detail: { timestamp: Date.now() },
			})
		);
	}

	_filterShopifyEvent(event, callback) {
		// Check if the event target contains this element or is this element
		if (event.target.contains(this) || event.target === this) {
			callback();
		}
	}

	_showPreloader() {
		// Remove loaded state to show preloader (only in design mode when section is selected)
		document.body.classList.remove("loaded");
		this.removeAttribute("loaded");
	}

	_hidePreloader() {
		// Add loaded state to hide preloader
		document.body.classList.add("loaded");
		this.setAttribute("loaded", "");
	}

	// Public method to manually trigger loaded state
	setLoaded() {
		this._applyLoadedState();
	}

	// Public method to check if page is loaded
	get isLoaded() {
		return this.hasAttribute("loaded");
	}
}

// Register the custom element
customElements.define("coretex-preload", CoretexPreload);
