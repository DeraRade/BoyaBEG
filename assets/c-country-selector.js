/*** 
🚨 Code #AA-O
*/

class CountryProvinceSelector extends HTMLElement {
    constructor() {
      super();
      this.$countrySelector = this.querySelector("select[name*='country']");
      this.$provinceSelector = this.querySelector("select[name*='province']");
      this.$provinceContainer = this.querySelector("[data-province-container]");
  
      this.selectedCountry = this.$countrySelector.getAttribute("data-default");
      this.selectedProvince = this.$provinceSelector.getAttribute("data-default");
  
      if (!this.selectedProvince || this.selectedProvince === "") {
        this.$provinceContainer.style.display = "none";
      }
      this.setDefaultSelected(this.$countrySelector, this.selectedCountry);
      this.generateProvinces(
        this.$countrySelector,
        this.$provinceSelector,
        this.$provinceContainer
      );
      this.setDefaultSelected(this.$provinceSelector, this.selectedProvince);
    }
    connectedCallback() {
      this.$countrySelector.addEventListener("change", () => {
        this.generateProvinces(
          this.$countrySelector,
          this.$provinceSelector,
          this.$provinceContainer
        );
      });
    }
  
    clearOptions(selector) {
      while (selector.firstChild) {
        selector.removeChild(selector.firstChild);
      }
    }
  
    setOptions(selector, options) {
      for (let i = 0; i < options.length; i++) {
        const new_option = document.createElement("option");
        new_option.value = options[i][0];
        new_option.innerHTML = options[i][1];
        selector.appendChild(new_option);
      }
    }
  
    setDefaultSelected(selector, value) {
      if (value && value !== "" && selector) {
        selector.value = value;
      }
    }
  
    generateProvinces($countrySelector, $provinceSelector, $provinceContainer) {
      const selectedOption =
        $countrySelector.options[$countrySelector.selectedIndex];
      const rawProvinces = selectedOption.getAttribute("data-provinces");
      const parsedProvinces = JSON.parse(rawProvinces);
  
      this.clearOptions($provinceSelector);
  
      if (!parsedProvinces?.length) {
        $provinceContainer.style.display = "none";
      } else {
        this.setOptions($provinceSelector, parsedProvinces);
        $provinceContainer.style.display = "";
      }
    }
  }
  customElements.define("country-province-selector", CountryProvinceSelector);  