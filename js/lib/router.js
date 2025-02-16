// Router class voor client-side routing
export class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentView = null;
        
        // Event listeners voor navigatie
        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });
    }

    // Route handler
    async handleRoute() {
        const path = window.location.pathname;
        const route = this.routes[path] || this.routes['/404'];
        const mainContent = document.getElementById('main-content');

        try {
            // Toon loading spinner
            document.getElementById('loading-spinner').classList.remove('hidden');

            // Clean up vorige view
            if (this.currentView && this.currentView.cleanup) {
                await this.currentView.cleanup();
            }

            // Initialiseer nieuwe view
            this.currentView = new route.view();
            
            // Render view content
            const content = await this.currentView.render();
            mainContent.innerHTML = content;

            // Initialize view na render
            if (this.currentView.initialize) {
                await this.currentView.initialize();
            }

            // Update active navigation
            this.updateNavigation(path);

        } catch (error) {
            console.error('Error handling route:', error);
            mainContent.innerHTML = '<div class="error">Er is iets misgegaan bij het laden van de pagina.</div>';
        } finally {
            // Verberg loading spinner
            document.getElementById('loading-spinner').classList.add('hidden');
        }
    }

    // Navigatie functie
    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    // Update active navigation status
    updateNavigation(currentPath) {
        const navLinks = document.querySelectorAll('[data-route]');
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('data-route');
            if (linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Start de router
    start() {
        this.handleRoute();
    }
}

// Base view class voor herbruikbare view functionaliteit
export class View {
    constructor() {
        this.isInitialized = false;
    }

    // Render method moet worden overschreven door child classes
    async render() {
        throw new Error('Render method moet worden geïmplementeerd');
    }

    // Optional initialize method
    async initialize() {
        this.isInitialized = true;
    }

    // Optional cleanup method
    async cleanup() {
        this.isInitialized = false;
    }
}
