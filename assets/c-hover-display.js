class CoretexHover extends HTMLElement {
    constructor() {
        super();
        this.spotlightElement = null;
        // Generate a unique ID for this instance
        this.uniqueId = `spotlight-content-${Math.random().toString(36).substr(2, 9)}`;

        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    connectedCallback() {
        this.spotlightElement = this.querySelector("[hover-spotlight]");

        if (!this.spotlightElement) {
            return;
        }

        // Find all elements with spotlight-* attributes and add listeners
        this.querySelectorAll("*").forEach((el) => {
            const hasSpotlightAttrs = Array.from(el.attributes).some((attr) => attr.name.startsWith("spotlight-"));

            if (hasSpotlightAttrs) {
                el.addEventListener("mouseenter", this.handleMouseEnter);
                el.addEventListener("mouseleave", this.handleMouseLeave);
                el.addEventListener("focus", this.handleFocus);
                el.addEventListener("blur", this.handleBlur);
                el.addEventListener("keydown", this.handleKeyDown);

                // Use the unique ID for this instance
                el.setAttribute("aria-describedby", this.uniqueId);
            }
        });

        // Set the unique ID on the spotlight element
        this.spotlightElement.id = this.uniqueId;
        this.spotlightElement.setAttribute("role", "status");
        this.spotlightElement.setAttribute("aria-live", "polite");
    }

    disconnectedCallback() {
        this.querySelectorAll("*").forEach((el) => {
            const hasSpotlightAttrs = Array.from(el.attributes).some((attr) => attr.name.startsWith("spotlight-"));

            if (hasSpotlightAttrs) {
                el.removeEventListener("mouseenter", this.handleMouseEnter);
                el.removeEventListener("mouseleave", this.handleMouseLeave);
                el.removeEventListener("focus", this.handleFocus);
                el.removeEventListener("blur", this.handleBlur);
                el.removeEventListener("keydown", this.handleKeyDown);
            }
        });
    }

    handleMouseEnter(event) {
        const target = event.target;
        const spotlightAttrs = Array.from(target.attributes).filter((attr) => attr.name.startsWith("spotlight-"));
        this.updateSpotlight(spotlightAttrs);
    }

    handleMouseLeave(event) {
        if (document.activeElement !== event.target) {
            this.clearSpotlight();
        }
    }

    handleFocus(event) {
        const target = event.target;
        const spotlightAttrs = Array.from(target.attributes).filter((attr) => attr.name.startsWith("spotlight-"));
        this.updateSpotlight(spotlightAttrs);
    }

    handleBlur(event) {
        this.clearSpotlight();
    }

    handleKeyDown(event) {
        if (event.key === "Escape") {
            this.clearSpotlight();
            event.target.blur();
        }
    }

    updateSpotlight(spotlightAttrs) {
        if (!this.spotlightElement) return;
        this.clearSpotlight();

        spotlightAttrs.forEach(attr => {
            const key = attr.name.replace('spotlight-', '');
            const value = attr.value;
            
            const element = document.createElement('div');
            element.classList.add('spotlight-item', `spotlight-item-${key}`);
            
            const keyElement = document.createElement('span');
            keyElement.classList.add('spotlight-key', `spotlight-key-${key}`);
            keyElement.textContent = key + ': ';
            
            const valueElement = document.createElement('span');
            valueElement.classList.add('spotlight-value', `spotlight-value-${key}`);
            valueElement.textContent = value;
            
            element.appendChild(keyElement);
            element.appendChild(valueElement);
            this.spotlightElement.appendChild(element);
        });

        this.spotlightElement.classList.add("active");
    }

    clearSpotlight() {
        if (this.spotlightElement) {
            this.spotlightElement.innerHTML = "";
            this.spotlightElement.classList.remove("active");
        }
    }
}

customElements.define("coretex-hover", CoretexHover);