import { Router, View } from './lib/router.js';
import { initializeAuth, loginWithGoogle, logout, createProject } from './lib/firebase.js';

// Home View
class HomeView extends View {
    constructor() {
        super();
        this.root = null;
        this.isDestroyed = false;
    }

    async render() {
        console.log('HomeView render start');
        
        const mainContent = document.getElementById('main-content');
        if (!mainContent || this.isDestroyed) return;

        // Setup base structure only if needed
        if (!document.querySelector('.dashboard')) {
            mainContent.innerHTML = `
                <div class="dashboard">
                    <div class="dashboard-header">
                        <h2>Mijn Projecten</h2>
                        <button id="new-project-btn" class="primary-btn">
                            + Nieuw Project
                        </button>
                    </div>
                    <div id="projects-list"></div>
                </div>
            `;
        }

        try {
            // Bind events only if they're not already bound
            const newProjectBtn = document.getElementById('new-project-btn');
            if (newProjectBtn && !newProjectBtn.hasListener) {
                newProjectBtn.addEventListener('click', showModal);
                newProjectBtn.hasListener = true;
            }
            
            // Mount React component only if not already mounted
            const container = document.getElementById('projects-list');
            if (!container || this.isDestroyed) return;

            if (!this.root) {
                const { default: ProjectList } = await import('./components/ProjectList.js');
                this.root = ReactDOM.createRoot(container);
                if (!this.isDestroyed) {
                    this.root.render(React.createElement(ProjectList));
                }
            }
            
            console.log('HomeView render complete');
        } catch (error) {
            console.error('Error rendering ProjectList:', error);
            const container = document.getElementById('projects-list');
            if (container && !this.isDestroyed) {
                container.innerHTML = '<div class="error">Er is iets misgegaan bij het laden van de projecten.</div>';
            }
        }

        return '';
    }

    async cleanup() {
        console.log('HomeView cleanup start');
        this.isDestroyed = true;

        try {
            // Cleanup event listeners
            const newProjectBtn = document.getElementById('new-project-btn');
            if (newProjectBtn && newProjectBtn.hasListener) {
                newProjectBtn.removeEventListener('click', showModal);
                delete newProjectBtn.hasListener;
            }
            
            // Cleanup React root
            if (this.root) {
                await new Promise(resolve => {
                    // Give React time to cleanup
                    setTimeout(() => {
                        this.root.unmount();
                        this.root = null;
                        resolve();
                    }, 0);
                });
            }
        } catch (error) {
            console.error('Error in cleanup:', error);
        }
    }
}
// Settings View
class SettingsView extends View {
    async render() {
        return `
            <div class="settings">
                <h2>Instellingen</h2>
                <p>Instellingen komen hier</p>
            </div>
        `;
    }
}

// 404 View
class NotFoundView extends View {
    async render() {
        return `
            <div class="not-found">
                <h2>Pagina Niet Gevonden</h2>
                <p>De pagina die je zoekt bestaat niet.</p>
                <a href="/" data-route="/">Terug naar Home</a>
            </div>
        `;
    }
}

// Route configuratie
// Update de routes configuratie
const routes = {
    '/': { view: HomeView },
    '/settings': { view: SettingsView },
    '/timeline': { view: TimelineView }, // Nieuwe route
    '/404': { view: NotFoundView },
    '/project/:id': { view: ProjectDetailView }
};

// Initialize Router
const router = new Router(routes);

// Modal functions
function showModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('hidden');
}

function hideModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.add('hidden');
    document.getElementById('project-form').reset();
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login button
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            try {
                document.getElementById('loading-spinner').classList.remove('hidden');
                const user = await loginWithGoogle();
            } catch (error) {
                console.error('Login failed:', error);
                alert('Inloggen mislukt. Probeer het opnieuw.');
            } finally {
                document.getElementById('loading-spinner').classList.add('hidden');
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                document.getElementById('loading-spinner').classList.remove('hidden');
                await logout();
            } catch (error) {
                console.error('Logout failed:', error);
                alert('Uitloggen mislukt. Probeer het opnieuw.');
            } finally {
                document.getElementById('loading-spinner').classList.add('hidden');
            }
        });
    }

    // Project form submission
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                document.getElementById('loading-spinner').classList.remove('hidden');
                
                const projectData = {
                    name: document.getElementById('project-name').value,
                    location: {
                        street: document.getElementById('project-street').value,
                        number: document.getElementById('project-number').value,
                        postalCode: document.getElementById('project-postal').value,
                        city: document.getElementById('project-city').value
                    },
                    description: document.getElementById('project-description').value
                };

                await createProject(projectData);
                hideModal();
                alert('Project succesvol aangemaakt!');
                
            } catch (error) {
                console.error('Error creating project:', error);
                alert('Er is iets misgegaan bij het aanmaken van het project. Probeer het opnieuw.');
            } finally {
                document.getElementById('loading-spinner').classList.add('hidden');
            }
        });
    }

    // Modal close handlers
    document.querySelector('.close-modal')?.addEventListener('click', hideModal);
    document.getElementById('cancel-project')?.addEventListener('click', hideModal);
    document.getElementById('project-modal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) hideModal();
    });
});

// Initialize auth state observer
initializeAuth(
    // Login callback
    (user) => {
        console.log('User logged in:', user.email);
        router.start();
    },
    // Logout callback
    () => {
        console.log('User logged out');
        router.navigate('/');
    }
);

// Start router
router.start();

// Tijdlijn View
class TimelineView extends View {
    constructor() {
        super();
        this.root = null;
        this.isDestroyed = false;
    }

    async render() {
        console.log('TimelineView render start');
        
        const mainContent = document.getElementById('main-content');
        if (!mainContent || this.isDestroyed) return;

        // Setup base structure
        mainContent.innerHTML = `
            <div class="timeline-container">
                <div class="dashboard-header mb-6">
                    <div class="flex flex-col">
                        <h2 class="text-2xl font-bold">Tijdlijn</h2>
                        <p class="text-gray-600 text-sm">Volg wandelavonturen van jezelf en anderen</p>
                    </div>
                </div>
                <div id="timeline-container"></div>
            </div>
        `;

        try {
            // Mount React component
            const container = document.getElementById('timeline-container');
            if (!container || this.isDestroyed) return;

            if (!this.root) {
                const { default: Timeline } = await import('./components/Timeline.js');
                this.root = ReactDOM.createRoot(container);
                if (!this.isDestroyed) {
                    this.root.render(React.createElement(Timeline));
                }
            }
            
            console.log('TimelineView render complete');
        } catch (error) {
            console.error('Error rendering Timeline:', error);
            const container = document.getElementById('timeline-container');
            if (container && !this.isDestroyed) {
                container.innerHTML = `
                    <div class="bg-red-50 text-red-600 p-6 rounded-lg shadow text-center border border-red-200 mt-8">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="text-lg font-semibold mb-2">Er is iets misgegaan</h3>
                        <p>Er is een fout opgetreden bij het laden van de tijdlijn. Probeer het later opnieuw.</p>
                    </div>
                `;
            }
        }

        return '';
    }

    async cleanup() {
        console.log('TimelineView cleanup start');
        this.isDestroyed = true;

        try {
            // Cleanup React root
            if (this.root) {
                await new Promise(resolve => {
                    setTimeout(() => {
                        this.root.unmount();
                        this.root = null;
                        resolve();
                    }, 0);
                });
            }
        } catch (error) {
            console.error('Error in cleanup:', error);
        }
    }
}
