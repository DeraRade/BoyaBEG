export default class CoretexClock extends HTMLElement {
    constructor() {
        super();
        
        this.timeFormat = this.dataset.format || '24';
        this.timezone = this.dataset.timezone || 'auto';
        this.customTimezone = this.dataset.customTimezone || '';
        this.showDate = this.dataset.showDate !== 'false';
        this.dateFormat = this.dataset.dateFormat || 'dd/mm/yyyy';
        this.showLocation = this.dataset.showLocation === 'true';
        this.locationName = this.dataset.locationName || '';
        
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        this.updateClock();
        this.updateInterval = setInterval(() => this.updateClock(), 1000);
    }

    getTimezone() {
        if (this.timezone === 'custom' && this.customTimezone) {
            return this.customTimezone;
        }
        if (this.timezone === 'auto') {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        return this.timezone;
    }

    updateClock() {
        const now = new Date();
        const timezone = this.getTimezone();
        
        const timeElement = this.querySelector('.time-text');
        const dateElement = this.querySelector('.date-text');
        const locationElement = this.querySelector('.location-text');

        if (timeElement) {
            const timeString = this.formatTime(now, timezone);
            timeElement.textContent = timeString;
        }

        if (dateElement && this.showDate) {
            const dateString = this.formatDate(now, timezone);
            dateElement.textContent = dateString;
        }


        if (locationElement && this.showLocation && this.locationName) {
            locationElement.textContent = this.locationName;
        }
    }

    formatTime(date, timezone) {
        const options = {
            timeZone: timezone,
            hour12: this.timeFormat === '12',
            hour: '2-digit',
            minute: '2-digit'
        };

        return date.toLocaleTimeString('en-US', options);
    }

    formatDate(date, timezone) {
        const options = { 
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        switch (this.dateFormat) {
            case 'mm/dd/yyyy':
                return date.toLocaleDateString('en-US', options);
            case 'yyyy-mm-dd':
                return date.toLocaleDateString('sv-SE', options);
            case 'dd/mm/yyyy':
            default:
                return date.toLocaleDateString('en-GB', options);
        }
    }


    disconnectedCallback() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

if (!customElements.get('coretex-clock')) customElements.define('coretex-clock', CoretexClock);