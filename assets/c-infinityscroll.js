class InfinityScroll extends HTMLElement {
    static get observedAttributes() {
        return ['coretex-loading', 'coretex-container', 'coretex-pagination', 'offset', 'debug']
    }

    constructor() {
        super()
        this.initAttributes()
        this.logger = console // Default logger
        this.itemsContainer = null
        this.paginationContainer = null
        this._observer = null
    }

    initAttributes() {
        this.loadingText = this.getAttribute('coretex-loading') || 'Loading...'
        this.itemsContainerSelector = this.getAttribute('coretex-container') || "#ajaxItems"
        this.paginationContainerSelector = this.getAttribute('coretex-pagination') || "#ajaxPagination"

        const offsetAttr = this.getAttribute('offset')
        this.offset = offsetAttr !== null ? parseInt(offsetAttr, 10) : 0

        this.debug = this.getAttribute('debug') === 'true'
    }


    connectedCallback() {
        this.itemsContainer = this.querySelector(this.itemsContainerSelector)
        this.paginationContainer = this.querySelector(this.paginationContainerSelector)
        this.initScrollListener()
    }

    disconnectedCallback() {
        this.removeScrollListener()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.initAttributes()
        // Additional logic if needed when specific attributes change
    }

    initScrollListener() {
        if (!this.itemsContainer) {
            this.logger.error(`Coretex InfinityScroll: ${this.itemsContainer} is missing.`)
            return
        }
    
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0
        }
    
        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadNextPage()
                }
            })
        }, options)
    
        // If paginationContainer exists, observe it
        if (this.paginationContainer) {
            this._observer.observe(this.paginationContainer)
        }
    }
    

    removeScrollListener() {
        if (this._observer) {
            this._observer.disconnect()
        }
    }

    async loadNextPage() {
        const link = this.paginationContainer.querySelector('a')
        if (!link) {
            this.removeLoadingMessage() // No more pages to load
            return
        }

        const loadingMore = this.paginationContainer.querySelector('.loading-more')
        loadingMore.innerText = this.loadingText

        try {
            const response = await fetch(link.href, {
                method: 'GET',
                credentials: 'same-origin',
                keepalive: true,
                redirect: 'follow',
                headers: { 'Accept': 'text/html' }
            })

            if (!response.ok) {
                throw new Error(`Coretex InfinityScroll: Request failed with status ${response.status}`)
            }

            const text = await response.text()
            const parser = new DOMParser()
            const doc = parser.parseFromString(text, 'text/html')
            const newItems = doc.querySelector(this.itemsContainerSelector)
            const newPagination = doc.querySelector(this.paginationContainerSelector)

            if (newItems) {
                this.itemsContainer.insertAdjacentHTML('beforeend', newItems.innerHTML)
            }

            if (newPagination) {
                this.paginationContainer.innerHTML = newPagination.innerHTML
            } else {
                this.removeLoadingMessage() // No more items to load
                this.removeScrollListener() // Stop listening for scroll events
            }
        } catch (error) {
            this.logger.error('Coretex InfinityScroll: Error loading next page:', error);
            this.removeLoadingMessage();
            return;
        }
    }

    removeLoadingMessage() {
        // Assuming the loading message is inside the pagination container
        const loadingMessage = this.paginationContainer.querySelector('.loading-more');
        if (loadingMessage) loadingMessage.remove();
    }

}

window.customElements.define('infinity-scroll', InfinityScroll)