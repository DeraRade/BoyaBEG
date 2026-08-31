// deferred-media.js
// === [ CORETEX FYI] === 
// this code is also available in t-product.js 
// was added here because of an unassigned error. 
// TODO: find a more efficient way to fix this.
if (!customElements.get('deferred-media')) {
	customElements.define(
		'deferred-media',
		class DeferredMedia extends HTMLElement {
			constructor() {
				super()
				const poster = this.querySelector('[id^="Deferred-Poster-"]')
				if (!poster) return
				poster.addEventListener('click', this.loadContent.bind(this))
			}

			loadContent(focus = true) {
				// === [ CORETEX FYI ] ===
				// Check if there's a <video-player> element
				// If there's a <video-player>, do not run the rest of the logic
				const videoPlayer = this.querySelector('video-player');
                window.pauseAllMedia();

				if (!videoPlayer) {
					window.pauseAllMedia();

					const template = this.querySelector('template')
					if (!template) {
						console.error('Template element not found.')
						return
					}

					if (!this.getAttribute('loaded')) {
						const content = document.createElement('div')
						content.appendChild(template.content.firstElementChild.cloneNode(true))

						this.setAttribute('loaded', true)
						const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'))
						if (focus) deferredElement.focus()
						if (deferredElement.nodeName === 'VIDEO' && deferredElement.getAttribute('autoplay')) {
							// Force autoplay for Safari
							deferredElement.play()
						}
					}

                    // Workaround for safari iframe bug
                    const formerStyle = deferredElement.getAttribute('style');
                    deferredElement.setAttribute('style', 'display: block;');
                    window.setTimeout(() => {
                        deferredElement.setAttribute('style', formerStyle);
                    }, 0);
				}
			}
		}
	)
}

// product-model.js
if (!customElements.get('product-model')) {
    customElements.define('product-model',
    class ProductModel extends DeferredMedia {
      constructor() {
        super();
      }

      loadContent() {
        super.loadContent();

        Shopify.loadFeatures([
          {
            name: 'model-viewer-ui',
            version: '1.0',
            onLoad: this.setupModelViewerUI.bind(this),
          },
        ]);
      }

      setupModelViewerUI(errors) {
        if (errors) return;

        this.modelViewerUI = new Shopify.ModelViewerUI(this.querySelector('model-viewer'));
      }
    }
  );
}

window.ProductModel = {
  loadShopifyXR() {
    Shopify.loadFeatures([
      {
        name: 'shopify-xr',
        version: '1.0',
        onLoad: this.setupShopifyXR.bind(this),
      },
    ]);
  },

  setupShopifyXR(errors) {
    if (errors) return;

    if (!window.ShopifyXR) {
      document.addEventListener('shopify_xr_initialized', () => this.setupShopifyXR());
      return;
    }

    document.querySelectorAll('[id^="ProductJSON-"]').forEach((modelJSON) => {
      window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
      modelJSON.remove();
    });
    window.ShopifyXR.setupXRElements();
  },
};

window.addEventListener('DOMContentLoaded', () => {
  if (window.ProductModel) window.ProductModel.loadShopifyXR();
});
