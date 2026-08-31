export default class VideoPlayer extends HTMLElement {
    constructor() { 
        super(); 
        this.intersectionObserver = null; 
        this.progressElement = null;
        this.video = null;
        this.playPauseButton = null;
        this.muteUnmuteButton = null;
        
        // Bind methods once in constructor
        this.handleIntersection = this.handleIntersection.bind(this);
        this.togglePlayPause = this.togglePlayPause.bind(this);
        this.toggleMuteUnmute = this.toggleMuteUnmute.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.handleHoverEnter = this.handleHoverEnter.bind(this);
        this.handleHoverLeave = this.handleHoverLeave.bind(this);
    }

    connectedCallback() {
        this._cacheElements();
        this._initializeVideo();
        this._setupControls();
        this._setupIntersectionObserver();
        this._setupProgressTracking();
        this._setupHoverPlay();
        this._setupEventListeners();
    }

    disconnectedCallback() {
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = null;
        
        // Clean up event listeners
        this._removeEventListeners();
    }

    _cacheElements() {
        this.video = this.querySelector('video');
        this.playPauseButton = this.querySelector('.controller.play');
        this.muteUnmuteButton = this.querySelector('.controller.mute');
    }

    _initializeVideo() {
        this.video.removeAttribute('controls');
        this._lazyLoad();
        this._syncInitialState();
    }

    _syncInitialState() {
        // Sync play/pause button
        this._updatePlayPauseState();
        
        // Sync mute button if it exists
        if (this.muteUnmuteButton) {
            this._updateMuteState();
        }
    }

    _setupControls() {
        this.playPauseButton.addEventListener('click', this.togglePlayPause);
        
        if (this.muteUnmuteButton) {
            this.muteUnmuteButton.addEventListener('click', this.toggleMuteUnmute);
        }

        if (this.video.hasAttribute('click-play')) {
            this.video.addEventListener('click', this.togglePlayPause);
        }
    }

    _setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(this.handleIntersection);
        this.intersectionObserver.observe(this);
    }

    _setupProgressTracking() {
        const hasProgressPlay = this.hasAttribute('progress-play') || this.video.hasAttribute('progress-play');
        
        if (hasProgressPlay) {
            this.progressElement = document.createElement('div');
            this.progressElement.className = 'video-progress';
            this.appendChild(this.progressElement);
            
            this.video.addEventListener('timeupdate', this.updateProgress);
        }
    }

    _setupHoverPlay() {
        const hasHoverPlay = this.hasAttribute('hover-play') || this.video.hasAttribute('hover-play');
        
        if (hasHoverPlay) {
            this.addEventListener('mouseenter', this.handleHoverEnter);
            this.addEventListener('mouseleave', this.handleHoverLeave);
        }
    }

    _setupEventListeners() {
        this.video.addEventListener('pause', this._updatePlayPauseState.bind(this));
        this.video.addEventListener('play', this._updatePlayPauseState.bind(this));
        this.video.addEventListener('volumechange', this._updateMuteState.bind(this));
    }

    _removeEventListeners() {
        this.playPauseButton?.removeEventListener('click', this.togglePlayPause);
        this.muteUnmuteButton?.removeEventListener('click', this.toggleMuteUnmute);
        this.video?.removeEventListener('click', this.togglePlayPause);
        this.video?.removeEventListener('timeupdate', this.updateProgress);
        this.removeEventListener('mouseenter', this.handleHoverEnter);
        this.removeEventListener('mouseleave', this.handleHoverLeave);
    }

    async togglePlayPause() {
        try {
            if (this.video.paused) {
                await this.video.play();
            } else {
                this.video.pause();
            }
        } catch (error) {
            this._updatePlayPauseState();
        }
    }

    toggleMuteUnmute() {
        if (!this.muteUnmuteButton) return;
        
        this.video.muted = !this.video.muted;
    }

    handleIntersection(entries) {
        const entry = entries[0]; // We only observe one element
        
        if (entry.isIntersecting) {
            this._lazyLoad();
            this._handleAutoplay();
        } else if (!this.video.paused) {
            this.video.pause();
        }
    }

    async _handleAutoplay() {
        if (!this.video.hasAttribute('autoplay') || !this.video.paused) return;
        if (!this._isVideoVisible()) return;
        
        try {
            await this.video.play();
        } catch (error) {
            // Autoplay failed - this is expected in many cases
        }
    }

    _isVideoVisible() {
        const rect = this.video.getBoundingClientRect();
        const style = getComputedStyle(this.video);
        
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               rect.width > 0 && rect.height > 0;
    }

    _lazyLoad() {
        const source = this.video.querySelector('source[data-src]');
        if (!source) return;
        
        source.src = source.dataset.src;
        delete source.dataset.src;
        this.video.load();
    }

    updateProgress() {
        const progress = Math.round((this.video.currentTime / this.video.duration) * 100);
        this.progressElement.style.setProperty('--vp-progress', `${progress}%`);
    }

    handleHoverEnter() {
        if (this.video.paused && this._isVideoVisible()) {
            this.togglePlayPause();
        }
    }

    handleHoverLeave() {
        if (!this.video.paused && this.classList.contains('playing')) {
            this.togglePlayPause();
        }
    }

    _updatePlayPauseState() {
        const isPlaying = !this.video.paused;
        this.playPauseButton.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
        this.classList.toggle('playing', isPlaying);
    }

    _updateMuteState() {
        if (!this.muteUnmuteButton) return;
        
        this.muteUnmuteButton.setAttribute('aria-label', this.video.muted ? 'Unmute' : 'Mute');
        this.classList.toggle('muted', this.video.muted);
    }
}

if (!customElements.get('video-player')) {
    customElements.define('video-player', VideoPlayer);
}