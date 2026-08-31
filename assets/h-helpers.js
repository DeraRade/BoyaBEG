export const getShopifySection = ($element) => {
	const sectionPrefix = "shopify-section-";
	const $section = $element.closest(`[id^="${sectionPrefix}"]`);
	if (!$section) return [null, null];
	const sectionId = $section.id.replace(sectionPrefix, "");
	return [sectionId, $section];
};

// #CBB-E
export const toggleClassFromAttribute = ($context, attributeName, on) => {
	if (!$context || typeof $context.querySelectorAll !== 'function') {
		console.error('Invalid context provided:', $context);
		return;
	}

	const elements = ($context instanceof Element && $context.hasAttribute(attributeName))
		? [$context, ...$context.querySelectorAll(`[${attributeName}]`)]
		: [...$context.querySelectorAll(`[${attributeName}]`)];

	elements.forEach(($element) => {
		const className = $element.getAttribute(attributeName);
		if (className) {
			if (on) $element.classList.add(className);
			else $element.classList.remove(className);
		}
	});
};

export function serializeForm(form) {
	let obj = {};
	let formData = new FormData(form);

	for (let key of formData.keys()) {
		obj[key] = formData.get(key);
	}

	return obj;
}

export function debounce(fn, wait) {
	let t;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn.apply(this, args), wait);
	};
}

export function parseTag(url) {
	const regex = /[^/]+$/;
	return url.match(regex)[0];
}

export function getCollectionUrl(url) {
	const regex = /\/\S+\//;
	return url.match(regex)[0];
}

export async function loadJS(FILE_URL, cb) {
	let $script = document.createElement("script");

	$script.setAttribute("src", FILE_URL);
	$script.setAttribute("type", "text/javascript");

	document.body.appendChild($script);

	cb && cb($script);
	return new Promise((resolve, reject) => {
		$script.addEventListener("load", () => {
			resolve(true);
		});
		$script.addEventListener("error", () => {
			reject(false);
		});
	});
}

// #CBB-A
export class FocusTrap {
	constructor(element, options = {}) {
		this.trapElement = element;
		this.previousActiveElement = null;
		// Add a flag to control click handling, defaulting to false
		this.enableClickTrap = options.enableClickTrap || false;

		// Bind methods to maintain correct 'this' context
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}

	getFocusableElements() {
		return Array.from(this.trapElement.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])')).filter(
			(el) => !el.hasAttribute("disabled") && el.offsetParent !== null
		);
	}

	activate() {
		this.previousActiveElement = document.activeElement;

		// Add event listeners
		document.addEventListener("keydown", this.handleKeyDown);
		document.addEventListener("focus", this.handleFocus, true);
		// Only add click listener if explicitly enabled
		if (this.enableClickTrap) {
			document.addEventListener("click", this.handleClick, true);
		}

		const focusableElements = this.getFocusableElements();
		if (focusableElements.length > 0) {
			focusableElements[0].focus();
		}
	}

	deactivate() {
		// Remove event listeners
		document.removeEventListener("keydown", this.handleKeyDown);
		document.removeEventListener("focus", this.handleFocus, true);
		// Only remove click listener if it was added
		if (this.enableClickTrap) {
			document.removeEventListener("click", this.handleClick, true);
		}

		if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
			this.previousActiveElement.focus();
		}
	}

	// Add method to toggle click trapping if needed
	setClickTrap(enabled) {
		if (enabled && !this.enableClickTrap) {
			this.enableClickTrap = true;
			document.addEventListener("click", this.handleClick, true);
		} else if (!enabled && this.enableClickTrap) {
			this.enableClickTrap = false;
			document.removeEventListener("click", this.handleClick, true);
		}
	}

	handleKeyDown(event) {
		if (event.key === "Tab") {
			const focusableElements = this.getFocusableElements();
			if (focusableElements.length === 0) return;

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];
			const { activeElement } = document;

			if (event.shiftKey) {
				if (activeElement === firstElement) {
					lastElement.focus();
					event.preventDefault();
				}
			} else {
				if (activeElement === lastElement) {
					firstElement.focus();
					event.preventDefault();
				}
			}
		}
	}

	handleFocus(event) {
		if (!this.trapElement.contains(event.target)) {
			const focusableElements = this.getFocusableElements();
			if (focusableElements.length > 0) {
				event.stopPropagation();
				focusableElements[0].focus();
			}
		}
	}

	handleClick(event) {
		if (!this.trapElement.contains(event.target)) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
}

// Example usage:
/*
# Normal usage
const modalElement = document.querySelector('.modal');
const focusTrap = new FocusTrap(modalElement);

// When opening the modal
focusTrap.activate();

// When closing the modal
focusTrap.deactivate();

# Inside another class:
constructor() {
    super();
    // with click trap disabled (click trap aka user being able to interact with elements outside the trapFocus node)
    this.focusTrap = new FocusTrap(this);
    // with click trap enabled
    this.focusTrap = new FocusTrap(this, { enableClickTrap: true });
}

open() {
    this.focusTrap.activate();
}

close() {
    this.focusTrap.deactivate();
}
*/
