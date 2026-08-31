class GridViewController extends HTMLElement {
    constructor() {
        super();
        this.grid = null;
        this.buttons = null;
        this.isInitialized = false;
        this.observer = null;
    }

    connectedCallback() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupComponent());
        } else {
            this.setupComponent();
        }
    }

    disconnectedCallback() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    setupComponent() {
        this.grid = document.getElementById('ajaxContainer');
        this.buttons = this.querySelectorAll('button[data-col]');

        if (!this.grid || !this.buttons.length) {
            setTimeout(() => this.setupComponent(), 100);
            return;
        }

        if (!this.isInitialized) {
            this.initializeGrid();
            this.addEventListeners();
            this.setupMutationObserver();
            this.isInitialized = true;
        }
    }

    setupMutationObserver() {
        this.observer = new MutationObserver(() => {
            const newGrid = document.getElementById('ajaxContainer');
            if (newGrid !== this.grid) {
                this.grid = newGrid;
                this.initializeGrid();
            }
        });
        this.observer.observe(document.querySelector('[data-facets-form-content]') || document.body, {
            childList: true,
            subtree: true
        });
    }

    initializeGrid() {
        const savedCols = localStorage.getItem('gridColumns');
        if (savedCols) {
            const cols = JSON.parse(savedCols) || { desktop: 5, tablet: 3, mobile: 2 };
            this.updateGridAttributes(cols);
            this.updateActiveButton(this.getCurrentViewportValue(cols));
        }
        this.removePreloadingClass();
    }

    addEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const colNum = button.getAttribute('data-col');
                if (colNum) {
                    this.handleColumnChange(colNum);
                }
            });
        });
    }

    handleColumnChange(colNum) {
        const num = parseInt(colNum) || 5;
        const currentCols = this.getCurrentColumns();
        const updatedCols = this.updateViewportColumns(currentCols, num);
        this.updateGridAttributes(updatedCols);
        this.updateActiveButton(num);
        this.saveToLocalStorage(updatedCols);
    }

    getCurrentColumns() {
        const savedCols = localStorage.getItem('gridColumns');
        return savedCols ? JSON.parse(savedCols) : { desktop: 5, tablet: 3, mobile: 2 };
    }

    updateViewportColumns(currentCols, num) {
        const viewport = this.getCurrentViewport();
        return {
            desktop: viewport === 'desktop' ? num : currentCols.desktop,
            tablet: viewport === 'tablet' ? num : currentCols.tablet,
            mobile: viewport === 'mobile' ? num : currentCols.mobile
        };
    }

    getCurrentViewport() {
        if (window.innerWidth >= 1024) return 'desktop';
        if (window.innerWidth >= 778) return 'tablet';
        return 'mobile';
    }

    getCurrentViewportValue(cols) {
        const viewport = this.getCurrentViewport();
        return cols[viewport];
    }

    updateGridAttributes(cols) {
        if (this.grid) {
            this.grid.setAttribute('columns', cols.desktop);
            this.grid.setAttribute('columns-m', cols.tablet);
            this.grid.setAttribute('columns-s', cols.mobile);
        }
    }

    updateActiveButton(colNum) {
        this.buttons.forEach(btn => btn.classList.remove('active'));
        const activeButton = this.querySelector(`button[data-col="${colNum}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    saveToLocalStorage(cols) {
        localStorage.setItem('gridColumns', JSON.stringify(cols));
    }

    removePreloadingClass() {
        if (this.grid) {
            this.grid.classList.remove('preloading');
        }
    }
}

customElements.define('grid-view-controller', GridViewController);