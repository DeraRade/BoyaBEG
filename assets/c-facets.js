/*** 
 * 🚨 Code #AA-M
=== [ CORETEX FYI ] ===
The "form" attribute is supported for form components:
If you want to put an "input" or "select" element outside the component --
add an id to the form and the "form" attribute to the element
*/

import { getShopifySection, toggleClassFromAttribute } from "@openthinking/helpers";

const ELEMENT_NAME = "facets-form";

const attributes = {
	ajaxInput: `data-${ELEMENT_NAME}-input`, // data-facets-form-input
	content: `data-${ELEMENT_NAME}-content`, // data-facets-form-content
	link: `data-${ELEMENT_NAME}-link`, // data-facets-form-link
};

let lastFocusedId = null;
let responseCache = []; // [{url, html}, {url, html}]
let searchParamsInitial = window.location.search.slice(1);
let searchParamsPrev = window.location.search.slice(1);
let abortController;

// #CBB-A
// Listen for popstate events to handle browser navigation.
window.addEventListener("popstate", (event) => {
	const searchParams = event.state ? event.state.searchParams : searchParamsInitial;
	if (searchParams === searchParamsPrev) return;
	facetsChangeHandler(searchParams, false);
});

// #CBB-A
// Global listener for clicks on interactive elements inside a facets-form.
// This covers elements marked with data-facets-form-link or data-facets-form-input,
// as well as native interactive elements.
document.addEventListener("click", (event) => {
	const interactive = event.target.closest("[data-facets-form-link], [data-facets-form-input], a, button, input, select, textarea");
	if (!interactive) return;
	// Ensure the element is inside a <facets-form> component.
	if (!interactive.closest(ELEMENT_NAME)) return;

	// Capture the element's id (if available)
	if (interactive.id) {
		lastFocusedId = interactive.id; // #CTL-A
	}

	// If the element is a link with data-facets-form-link, handle the AJAX update.
	if (interactive.hasAttribute(attributes.link)) {
		const url = interactive.href;
		if (!url) return;
		facetsChangeHandler(new URL(url).searchParams.toString());
		event.preventDefault();
	}
});

// #CBB-A
// Additionally, listen for focusin events on any element within a facets-form.
// This ensures that when a user navigates via keyboard, the last-focused element is tracked.
document.addEventListener("focusin", (event) => {
	const target = event.target;
	if (target.closest(ELEMENT_NAME) && target.id) {
		lastFocusedId = target.id; // #CTL-A
	}
});

function toggleResultsAttribute(searchParams) {
	const resultsUsed = searchParams !== searchParamsInitial;
	document.querySelectorAll(ELEMENT_NAME).forEach((el) => {
		if (resultsUsed) {
			el.setAttribute("filters", "true");
		} else {
			el.removeAttribute("filters");
		}
	});
}

function facetsChangeHandler(searchParams, updateURLHash = true) {
	try {
		if (abortController) {
			abortController.abort();
			abortController = undefined;
		}
		searchParamsPrev = searchParams;
		toggleResultsAttribute(searchParams); // #CTL-A

		const sectionsMap = {};
		document.querySelectorAll(`[${attributes.content}]`).forEach(($content) => {
			const [sectionId] = getShopifySection($content);
			if (!sectionId) throw new Error(`[${ELEMENT_NAME}] [The "${attributes.content}" element must be within a Shopify section]`);
			sectionsMap[sectionId] = true;
		});

		const sections = Object.keys(sectionsMap);
		if (sections.length > 5) {
			throw new Error(`[${ELEMENT_NAME}] [The "${attributes.content}" elements exist in more than 5 sections]`);
		}

		const url = `${window.location.pathname}?sections=${sections.join(",")}&${searchParams}`;

		const cachedResponse = responseCache.find((item) => item.url === url);
		if (cachedResponse) renderPage(cachedResponse.html);
		else {
			abortController = new AbortController();
			toggleLoadingClasses(true);
			disableTextInputs(true);
			fetch(url, { signal: abortController.signal })
				.then((response) => response.json())
				.then((data) => {
					let html = "";
					for (let i in data) {
						html += data[i];
					}
					responseCache.push({ url, html });
					renderPage(html);
				})
				.catch((error) => {
					if (error.name !== "AbortError") {
						console.error(`[${ELEMENT_NAME}] [Section API request error]`, error);
						window.location.href = `?${searchParams}`;
					}
				})
				.finally(() => {
					disableTextInputs(false);
					toggleLoadingClasses(false);
				});
		}

		if (updateURLHash) {
			history.pushState({ searchParams }, "", `${window.location.pathname}${searchParams && "?".concat(searchParams)}`);
		}
	} catch (e) {
		console.error(e);
		window.location.href = `?${searchParams}`;
	}
}

function disableTextInputs(disable) {
	document.querySelectorAll(`[${attributes.ajaxInput}][type="number"], [${attributes.ajaxInput}][type="text"]`).forEach(($input) => {
		$input.readOnly = disable;
	});
}

function toggleLoadingClasses(on) {
	toggleClassFromAttribute(document, attributes.loadingClass, on);
}

function renderPage(html) {
	const $receivedDocument = new DOMParser().parseFromString(html, "text/html");
	document.querySelectorAll(`[${attributes.content}]`).forEach(($content) => {
		const contentId = $content.getAttribute(attributes.content);
		if (!contentId) throw new Error(`[${ELEMENT_NAME}] [A "${attributes.content}" element doesn't have unique value]`);
		const $receivedContent = $receivedDocument.querySelector(`[${attributes.content}="${contentId}"]`);
		if (!$receivedContent) {
			throw new Error(`[${ELEMENT_NAME}] [A "${attributes.content}" element with "${contentId}" value isn't found in the section API response]`);
		}
		$content.innerHTML = $receivedContent.innerHTML;
	});

	// #CBB-A
	// After updating the content, restore focus to the element that was last focused.
	if (lastFocusedId) {
		const $newElement = document.getElementById(lastFocusedId);
		if ($newElement) {
			// A short delay ensures the updated DOM is ready before focusing.
			setTimeout(() => $newElement.focus(), 0); // #CTL-A
		}
		lastFocusedId = null;
	}
}

class FacetsForm extends HTMLElement {
	_$form;
	connectedCallback() {
		this._$form = this.querySelector("form");
		if (!this._$form) throw new Error(`[${ELEMENT_NAME}] [The "form" element isn't found]`);

		// Handle form submission via AJAX.
		this._$form.addEventListener("submit", (event) => {
			event.preventDefault();
			this._ajaxSubmit();
		});

		// #CBB-A
		// Listen for change events on inputs with data-facets-form-input.
		// This covers checkboxes, radios, and other inputs.
		this._$form.addEventListener("change", (event) => {
			if (event.target.hasAttribute(attributes.ajaxInput)) {
				if (event.target.id) {
					lastFocusedId = event.target.id; // #CTL-A
				}
				this._ajaxSubmit();
			}
		});

		// #CBB-A
		// Also capture any focus event within this <facets-form>.
		this.addEventListener("focusin", (event) => {
			const target = event.target;
			if (target.id) {
				lastFocusedId = target.id; // #CTL-A
			}
		});

		/***
		 * === [ CORETEX FYI ] ===
		 * Implementation with `m-ranger.js`
		 * Add the event listener for the range slider change event
		 */
		const priceSlider = document.getElementById("priceSlider");
		const minPriceInput = document.getElementById("priceSlider-minor");
		const maxPriceInput = document.getElementById("priceSlider-major");

		if (priceSlider) {
			priceSlider.addEventListener("change", (event) => {
				clearTimeout(this.debounceTimer);
				this.debounceTimer = setTimeout(() => {
					minPriceInput.value = event.detail.value1;
					maxPriceInput.value = event.detail.value2;

					//console.log(minPriceInput.value, maxPriceInput.value);
					this._ajaxSubmit();
				}, 500); // Adjust debounce delay as needed // #CTL-A
			});
		}
	}

	_ajaxSubmit() {
		const formData = new FormData(this._$form);
		facetsChangeHandler(new URLSearchParams(formData).toString());
	}
}

customElements.define(ELEMENT_NAME, FacetsForm);
