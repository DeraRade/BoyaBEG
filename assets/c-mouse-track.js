class CoretexMouseTracker extends HTMLElement {
	constructor() {
		super();
		this.trackElement = null;
		this.observer = null;
		this.rafId = null;
		this.lastMouseEvent = null;

		// Default configuration
		this.defaults = {
			offsetX: -50,
			offsetY: -10,
			smoothing: 0.1,
		};

		// Initialize configuration from attributes
		this.config = {
			offsetX: parseInt(this.getAttribute("offset-x")) || this.defaults.offsetX,
			offsetY: parseInt(this.getAttribute("offset-y")) || this.defaults.offsetY,
			smoothing: parseFloat(this.getAttribute("smoothing")) || this.defaults.smoothing,
		};
	}

	connectedCallback() {
		this._initObserver();
		this._updateTrackElement();
		this._bindEvents();
	}

	static get observedAttributes() {
		return ["offset-x", "offset-y", "smoothing"];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
			case "offset-x":
				this.config.offsetX = parseInt(newValue) || this.defaults.offsetX;
				break;
			case "offset-y":
				this.config.offsetY = parseInt(newValue) || this.defaults.offsetY;
				break;
			case "smoothing":
				this.config.smoothing = parseFloat(newValue) || this.defaults.smoothing;
				break;
		}
	}

	disconnectedCallback() {
		this._cleanup();
	}

	// Private methods
	_bindEvents() {
		this.addEventListener("mousemove", this._handleMouseMove.bind(this));
		this.addEventListener("mouseenter", this._handleMouseEnter.bind(this));
		this.addEventListener("mouseleave", this._handleMouseLeave.bind(this));
	}

	_initObserver() {
		const config = {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["data-track"],
		};

		this.observer = new MutationObserver(() => this._updateTrackElement());
		this.observer.observe(this, config);
	}

	_updateTrackElement() {
		const newTrackElement = this.querySelector("[data-track]");

		if (newTrackElement === this.trackElement) return;

		// Clean up previous element
		if (this.trackElement) {
			this.trackElement.style.removeProperty("--mouse-x");
			this.trackElement.style.removeProperty("--mouse-y");
		}

		this.trackElement = newTrackElement;

		if (!this.trackElement) {
			console.warn("CoretexMouseTracker: No element with data-track attribute found.");
		}
	}

	_handleMouseMove(event) {
		this.lastMouseEvent = event;

		if (this.rafId) return;

		this.rafId = requestAnimationFrame(() => {
			this._updateMousePosition(this.lastMouseEvent);
			this.rafId = null;
		});
	}

	_updateMousePosition(event) {
		if (!this.trackElement || !event) return;

		const rect = this.getBoundingClientRect();
		const x = event.clientX - rect.left + this.config.offsetX;
		const y = event.clientY - rect.top + this.config.offsetY;

		this.trackElement.style.setProperty("--mouse-x", `${x}px`);
		this.trackElement.style.setProperty("--mouse-y", `${y}px`);

		this._dispatchTrackEvent("mouse-track", { x, y, originalEvent: event });
	}

	_handleMouseEnter(event) {
		if (!this.trackElement) return;

		this._updateMousePosition(event);
		this._updateTrackState(true);
		this._dispatchTrackEvent("mouse-track-enter", { originalEvent: event });
	}

	_handleMouseLeave(event) {
		if (!this.trackElement) return;

		this._updateTrackState(false);
		this._cancelAnimation();
		this._dispatchTrackEvent("mouse-track-leave", { originalEvent: event });
	}

	_updateTrackState(isShowing) {
		if (!this.trackElement) return;

		const currentValue = this.trackElement.getAttribute("data-track") || "";
		const values = currentValue.split(" ").filter((v) => v && v !== "show");

		if (isShowing) {
			values.push("show");
		}

		this.trackElement.setAttribute("data-track", values.join(" ").trim() || "show");
	}

	_dispatchTrackEvent(eventName, detail) {
		this.dispatchEvent(
			new CustomEvent(eventName, {
				detail,
				bubbles: true,
			})
		);
	}

	_cancelAnimation() {
		if (this.rafId) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	_cleanup() {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}

		this._cancelAnimation();

		if (this.trackElement) {
			this.trackElement.style.removeProperty("--mouse-x");
			this.trackElement.style.removeProperty("--mouse-y");
		}

		this.trackElement = null;
		this.lastMouseEvent = null;
	}
}

if (!customElements.get("coretex-mouse-tracker")) {
	customElements.define("coretex-mouse-tracker", CoretexMouseTracker);
}
