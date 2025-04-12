import DebugService from "../services/DebugService";

/**
 * Custom element for header scroll behavior
 * @customElement scroll-header
 */
class ScrollHeader extends HTMLElement {
	private lastScrollY = 0;
	private ticking = false;
	private scrollThreshold = 100; // Minimum scroll amount to trigger class changes
	private headerElement: HTMLElement | null = null;
	private boundOnScroll: () => void;
	private resizeObserver: ResizeObserver | null = null;
	private headerHeight = 0; // Store the header height

	constructor() {
		super();
		this.boundOnScroll = this.onScroll.bind(this);
	}

	connectedCallback(): void {
		// Get the header element (this custom element should be applied to the header itself)
		this.headerElement = this;

		// Set up the Intersection Observer for performance
		this.setupScrollListener();

		// Set up ResizeObserver for responsive adjustments
		this.setupResizeObserver();

		// add class
		this.headerElement.classList.add('ready');

		// wait for animation to finish
		setTimeout(() => {
			this.setHeaderSize();
			// Initial check for scroll position
			this.updateHeaderState();
		});

		DebugService.log('Scroll header initialized');
	}

	disconnectedCallback(): void {
		// Clean up event listeners
		window.removeEventListener('scroll', this.boundOnScroll);

		// Clean up resize observer
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}

		// remove class
		this.headerElement?.classList.remove('ready');

		DebugService.log('Scroll header destroyed');
	}

	private setupScrollListener(): void {
		// Use passive event listener for better performance
		window.addEventListener('scroll', this.boundOnScroll, { passive: true });
	}

	private setupResizeObserver(): void {
		// Watch for size changes and adjust behavior if needed
		this.resizeObserver = new ResizeObserver(() => {
			// Update header height on resize
			this.setHeaderSize();
			// Reset state on resize
			this.updateHeaderState();
		});

		if (this.headerElement) {
			this.resizeObserver.observe(this.headerElement);
		}
	}

	private onScroll(): void {
		// Store current scroll position
		const currentScrollY = window.scrollY;

		// Use requestAnimationFrame for performance
		if (!this.ticking) {
			window.requestAnimationFrame(() => {
				this.updateHeaderClasses(currentScrollY);
				this.ticking = false;
			});

			this.ticking = true;
		}
	}

	private updateHeaderClasses(currentScrollY: number): void {
		if (!this.headerElement) return;

		// Always add scrolled class if we're scrolled at all
		if (currentScrollY > 0) {
			this.headerElement.classList.add('scrolled');
		} else {
			this.headerElement.classList.remove('scrolled');
		}

		// Add class when scroll position is larger than the element height
		if (currentScrollY > this.headerHeight) {
			this.headerElement.classList.add('scrolled-beyond-header');
		} else {
			this.headerElement.classList.remove('scrolled-beyond-header');
		}

		// Only add direction classes if we've scrolled beyond threshold
		if (currentScrollY > this.scrollThreshold) {
			// Determine scroll direction
			if (currentScrollY > this.lastScrollY) {
				// Scrolling down
				this.headerElement.classList.add('scrolled-down');
				this.headerElement.classList.remove('scrolled-up');
			} else if (currentScrollY < this.lastScrollY) {
				// Scrolling up
				this.headerElement.classList.add('scrolled-up');
				this.headerElement.classList.remove('scrolled-down');
			}
		}

		// Update last scroll position
		this.lastScrollY = currentScrollY;
	}

	private updateHeaderState(): void {
		// Force an update based on current scroll position
		this.updateHeaderClasses(window.scrollY);
	}

	private setHeaderSize(): void {
		if (this.headerElement) {
			const height = this.headerElement.getBoundingClientRect().height;
			this.headerHeight = Number(height.toFixed(2));
			document.documentElement.style.setProperty('--header-height', `${this.headerHeight}px`);
		}
	}
}

// Register the custom element
customElements.define('scroll-header', ScrollHeader);
