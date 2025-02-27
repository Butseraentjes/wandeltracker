import { ProjectDetailView } from './views/ProjectDetailView.js';
import { Router, View } from './lib/router.js';
import { initializeAuth, loginWithGoogle, logout, createProject, createProjectWithGeocode } from './lib/firebase.js';
import Homepage from './components/Homepage.js';

// De routes.js wordt al in ProjectDetailView.js geïmporteerd, dus geen expliciete import nodig in app.js

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

// Update de routes configuratie
const routes = {
    '/': { view: HomeView },
    '/settings': { view: SettingsView },
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
    // Project form submission
// In app.js waar project wordt aangemaakt
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
                    city: document.getElementById('project-city').value,
                    country: 'Belgium' // Default waarde
                },
                description: document.getElementById('project-description').value
            };

            // Gebruik nieuwe functie met geocoding
            await createProjectWithGeocode(projectData);
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
});

// Initialize auth state observer
initializeAuth(
    // Login callback
    (user) => {
        console.log('User logged in:', user.email);
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) {
            loginContainer.innerHTML = ''; // Clear homepage
        }
        // Toon main content en navigatie
        document.getElementById('main-content')?.classList.remove('hidden');
        document.getElementById('main-nav')?.classList.remove('hidden');
        document.getElementById('logout-btn')?.classList.remove('hidden');
        const userInfo = document.getElementById('user-info');
        if (userInfo) userInfo.textContent = user.email;
        
        router.start();
    },
    // Logout callback
    () => {
        console.log('User logged out');
        // Verberg main content en navigatie
        document.getElementById('main-content')?.classList.add('hidden');
        document.getElementById('main-nav')?.classList.add('hidden');
        document.getElementById('logout-btn')?.classList.add('hidden');
        const userInfo = document.getElementById('user-info');
        if (userInfo) userInfo.textContent = '';

        // Toon homepage
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) {
            const root = ReactDOM.createRoot(loginContainer);
            root.render(React.createElement(Homepage));
        }
    }
);

// Start router
router.start();
