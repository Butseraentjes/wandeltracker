// Router class voor client-side routing
export class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentView = null;
        this.isNavigating = false;
        
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

    // Check if route matches pattern
    matchRoute(pattern, path) {
        // Convert route pattern to regex
        const paramRegex = /:(\w+)/g;
        const regex = new RegExp('^' + pattern.replace(paramRegex, '([^/]+)') + '$');
        const match = path.match(regex);

        if (!match) return null;

        // Extract parameters
        const params = {};
        const paramNames = (pattern.match(paramRegex) || [])
            .map(param => param.slice(1));
        
        paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
        });

        return params;
    }

    // Route handler
    async handleRoute() {
        if (this.isNavigating) {
            console.log('Navigation already in progress, skipping...');
            return;
        }

        this.isNavigating = true;
        const path = window.location.pathname;
        
        // Find matching route
        let matchedRoute = null;
        let routeParams = {};

        for (const [pattern, route] of Object.entries(this.routes)) {
            const params = this.matchRoute(pattern, path);
            if (params !== null) {
                matchedRoute = route;
                routeParams = params;
                break;
            }
        }

        // Use 404 route if no match found
        const route = matchedRoute || this.routes['/404'];
        const mainContent = document.getElementById('main-content');

        try {
            // Toon loading spinner
            document.getElementById('loading-spinner').classList.remove('hidden');

            // Clean up vorige view
            if (this.currentView && this.currentView.cleanup) {
                await this.currentView.cleanup();
            }

            // Initialiseer nieuwe view met route parameters
            this.currentView = new route.view();
            this.currentView.params = routeParams;
            
            // Render view content
            const content = await this.currentView.render();
            if (content) {
                mainContent.innerHTML = content;
            }

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
            this.isNavigating = false;
        }
    }

    // Navigatie functie
    async navigate(path) {
        if (this.isNavigating) {
            console.log('Navigation already in progress, skipping...');
            return;
        }
        
        window.history.pushState({}, '', path);
        await this.handleRoute();
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
    async start() {
        await this.handleRoute();
    }
}

// Base view class voor herbruikbare view functionaliteit
export class View {
    constructor() {
        this.isInitialized = false;
        this.isDestroyed = false;
        this.params = {};
    }

    // Render method moet worden overschreven door child classes
    async render() {
        throw new Error('Render method moet worden geïmplementeerd');
    }

    // Optional initialize method
    async initialize() {
        if (!this.isDestroyed) {
            this.isInitialized = true;
        }
    }

    // Optional cleanup method
    async cleanup() {
        this.isDestroyed = true;
        this.isInitialized = false;
    }
}
