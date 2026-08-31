/*** 
🚨 Code #AA-M
*/

class PageViewer extends HTMLElement {
    DATA_SETS = {
      main: 'page-viewer-default',
      block: 'page-viewer-block',
      action: 'page-viewer-action',
      visible: 'page-viewer-visible',
    };

    /**
     * Creates an instance of PageViewer.
     * @memberof PageViewer
     */
    constructor() {
      super();
      const $defaultBlock = this.querySelector(
        `[${this.DATA_SETS.block}='${this.getAttribute(this.DATA_SETS.main)}']`
      );
      this.$blocks = this.querySelectorAll(`[${this.DATA_SETS.block}]`);
      this.$actions = this.querySelectorAll(`[${this.DATA_SETS.action}]`);

      /**
       * Shows block based on current url hash.
       */
      const locationHash = window.location.hash.substring(1);
      const $hashActiveBlock = this.querySelector(
        `[${this.DATA_SETS.block}='${locationHash}']`
      );
      if ($hashActiveBlock) {
        $hashActiveBlock.setAttribute(this.DATA_SETS.visible, '');
        return;
      }

      /**
       * Shows first block in DOM if default is not defined.
       */
      if (!$defaultBlock) {
        if (!this.$blocks || !this.$blocks.length) {
          return console.info('<page-viewer/>: Page viewer blocks are missing.');
        }
        this.$blocks[0].setAttribute(this.DATA_SETS.visible, '');
        return;
      }

      /**
       * Shows [page-viewer-default] defined block.
       */
      $defaultBlock.setAttribute(this.DATA_SETS.visible, '');
    }

    /**
     * Block action events (click).
     */
    connectedCallback() {
      const _self = this;
      this.$actions.forEach((action) => {
        const actionTarget = action.getAttribute(this.DATA_SETS.action);
        if (!actionTarget) return;
        action.addEventListener('click', (e) => {
          e.preventDefault();
          _self.$blocks.forEach((block) => {
            block.removeAttribute(this.DATA_SETS.visible);
          });
          _self
            .querySelector(`[${this.DATA_SETS.block}='${actionTarget}']`)
            .setAttribute(this.DATA_SETS.visible, '');
          window.location.hash = actionTarget;
        });
      });
    }
}
customElements.define('page-viewer', PageViewer);