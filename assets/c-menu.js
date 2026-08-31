class CoretexMenu extends HTMLElement {
  constructor() {
    super();
    this.detailsElements = this.querySelectorAll('details.lv1');
    this.isMegaMenu = this.closest('coretex-header[coretex-menu="mega"]');
    this.openOnHover = this.getAttribute('open-on-hover') === 'true';

    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.updateA11yAttributes = this.updateA11yAttributes.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMediaQueryChange = this.handleMediaQueryChange.bind(this);

    // Define the media query
    this.mediaQuery = window.matchMedia('(min-width: 777px)');
  }

  connectedCallback() {
    document.addEventListener('click', this.handleOutsideClick);
    document.addEventListener('keydown', this.handleKeyDown);
    this.detailsElements.forEach(details => {
      details.addEventListener('toggle', this.updateA11yAttributes);
      this.updateA11yAttributes({ target: details });
    });

    // Initial check and add media query listener
    this.handleMediaQueryChange(this.mediaQuery);
    this.mediaQuery.addEventListener('change', this.handleMediaQueryChange);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleKeyDown);
    this.detailsElements.forEach(details => {
      details.removeEventListener('toggle', this.updateA11yAttributes);
    });

    // Remove media query listener
    this.mediaQuery.removeEventListener('change', this.handleMediaQueryChange);

    // Remove mouse event listeners if they were added
    if (this.mediaQuery.matches) {
      if (this.isMegaMenu && this.openOnHover) {
        this.detailsElements.forEach(details => {
          details.removeEventListener('mouseenter', this.handleMouseOver);
          details.removeEventListener('mouseleave', this.handleMouseOut);
        });
      }
    }
  }

  handleMediaQueryChange(event) {
    if (event.matches) {
      if (this.isMegaMenu && this.openOnHover) {
        this.detailsElements.forEach(details => {
          details.addEventListener('mouseenter', this.handleMouseOver);
          details.addEventListener('mouseleave', this.handleMouseOut);
        });
      }
    } else {
      this.detailsElements.forEach(details => {
        details.removeEventListener('mouseenter', this.handleMouseOver);
        details.removeEventListener('mouseleave', this.handleMouseOut);
      });
    }
  }

  handleOutsideClick(event) {
    this.detailsElements.forEach(openDetails => {
      if (openDetails.hasAttribute('open') && !openDetails.contains(event.target)) {
        openDetails.open = false;
      }
    });
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.detailsElements.forEach(openDetails => {
        if (openDetails.hasAttribute('open')) {
          openDetails.open = false;
        }
      });
    }
  }

  updateA11yAttributes(_event) {
    // Empty - native <details>/<summary> provides implicit disclosure semantics
  }

  handleMouseOver(event) {
    const details = event.currentTarget;
    details.open = true;
  }

  handleMouseOut(event) {
    const details = event.currentTarget;
    setTimeout(() => {
      if (!details.matches(':hover') && details.open) {
        details.open = false;
      }
    }, 900); // Slight delay to ensure mouseout event completes
  }
}

customElements.define('coretex-menu', CoretexMenu);