/*** 
🚨 Code #AA-M
*/
import { toggleClassFromAttribute } from "@openthinking/helpers";

const elementName = "coretex-fetch";
const loadingTypes = { EAGER: "eager", LAZY: "lazy" };
const events = { HTML_UPDATE: "htmlupdate" };
const attributes = { loaderLink: "coretex-fetch-link", loadingClass: "loading-class"};

export default class CoretexFetch extends HTMLElement {
	_url;
	_abortController;
	_loading = loadingTypes.EAGER;
	_intersectionObserver;

	constructor() {
		super();
		this._intersectionObserver = new IntersectionObserver(
			(entries, observer) => {
				if (!entries[0].isIntersecting) return;
				observer.unobserve(this);
				this.updateHTML();
			},
			{ rootMargin: "0px 0px 250px 0px" }
		);

		this.addEventListener("click", this.handleClick.bind(this));
	}

	handleClick(event) {
		for (let $target = event.target; $target && $target !== this; $target = $target.parentElement) {
			if ($target.hasAttribute(attributes.loaderLink)) {
				event.preventDefault();
				event.stopPropagation(); // Prevent the event from bubbling up
				let url = $target.getAttribute(attributes.loaderLink) || $target.href;

				// Find the closest coretex-fetch parent
				let closestCoretexFetch = $target.closest(elementName);
				if (closestCoretexFetch) {
					closestCoretexFetch.setUrl(url);
				}
				return;
			}
		}
	}

	connectedCallback() {
		const loading = this.getAttribute("loading");
		if (Object.values(loadingTypes).includes(loading)) {
			this._loading = loading;
		}

		const url = this.getAttribute("href");
		if (!url) return;

		this.setUrl(url);
	}

	setUrl(url) {
		this._url = url;
		if (this._loading === loadingTypes.EAGER) {
			this.updateHTML();
			return;
		}
		this._intersectionObserver.observe(this);
	}

	async updateHTML() {
		if (this._abortController) {
			this._abortController.abort();
		}
		this._abortController = new AbortController();
		try {
			this._toggleLoadingClasses(true);
			const response = await fetch(this._url, {
				signal: this._abortController.signal,
			});
			if (!response.ok) throw new Error(`Response error from the "${response.url}" URL`);

			let queryDOM = elementName;
			if (this.id) queryDOM += `[id="${this.id}"]`;
			const html = await response.text();
			// console.log(html); // Keep for debugging #CTL-A
			const newdocument = new DOMParser().parseFromString(html, "text/html");
			const $newElementsList = newdocument.querySelectorAll(queryDOM);
			if ($newElementsList.length > 0) {
				this.innerHTML = $newElementsList[0].innerHTML;
				if ($newElementsList.length > 1) {
					console.error(
						`[${elementName}] [Multiple ${elementName} elements in the response. Use unique ID for each ${elementName}. Query Selector: '${queryDOM}']`,
						this
					);
				}
			} else {
				// #CBB-E
				// Keep all the children inside .shopify-section but discard the wrapper.
				const $wrapper = newdocument.querySelector(".shopify-section");
				if ($wrapper) {
					this.innerHTML = $wrapper.innerHTML;
				} else {
					console.warn("No .shopify-section found, using full HTML as fallback.");
					this.innerHTML = html;
				}
			}
			this.dispatchEvent(new CustomEvent(events.HTML_UPDATE));
		} catch (error) {
			if (error.name !== "AbortError") {
				throw error;
			}
		}
		this._toggleLoadingClasses(false);
	}

	_toggleLoadingClasses(on) {
		toggleClassFromAttribute(this, attributes.loadingClass, on);
	}
}

customElements.define(elementName, CoretexFetch);