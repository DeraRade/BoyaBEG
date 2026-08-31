/** Recently viewed products */

class CoretexRecently extends HTMLElement {
	constructor() {
		super()
		this.STORAGE_KEY = "openthinking:recently-viewed"
	}

	connectedCallback() {
		this.fetch = this.querySelector("coretex-fetch")
		this.sectionId = this.fetch?.id

		if (!this.fetch) {
			console.error("Required coretex-fetch element not found")
			return
		}

		// Listen for component loaded event
		document.addEventListener("component-loaded", this.handleComponentLoaded.bind(this))
	}

	disconnectedCallback() {
		document.removeEventListener("component-loaded", this.handleComponentLoaded.bind(this))
	}

	handleComponentLoaded(event) {
		const { component } = event.detail
		if (component !== "coretex-fetch") return

		const productsViewedRecently = this.getRecentlyViewedProducts()

		if (productsViewedRecently.length > 0) {
			const searchUrl = this.buildSearchUrl(productsViewedRecently)
			this.fetch.setUrl(searchUrl)
		}
	}

	getRecentlyViewedProducts() {
		try {
			return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]")
		} catch (error) {
			console.error("Error parsing recently viewed products:", error)
			return []
		}
	}

	buildSearchUrl(productIds) {
		const query = productIds.map((id) => `id:${id}`).join(" OR ")
		return `${window.Shopify?.routes?.root || "/"}search?type=product&q=${encodeURIComponent(query)}&section_id=x-pdp-recent`
	}
}

customElements.define("coretex-recently", CoretexRecently)