import { Router, View } from './lib/router.js';
import { initializeAuth, loginWithGoogle, logout, createProject } from './lib/firebase.js';

// Home View
class HomeView extends View {
    constructor() {
        super();
        this.root = null;
    }

    async render() {
        console.log('HomeView render start');
        
        // Eerst de container structuur opzetten
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

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

        try {
            // Event listener voor nieuwe project knop
            document.getElementById('new-project-btn')?.addEventListener('click', showModal);
            
            // ProjectList renderen
            const container = document.getElementById('projects-list');
            if (!container) throw new Error('Projects list container not found');

            const { default: ProjectList } = await import('./components/ProjectList.js');
            const root = ReactDOM.createRoot(container);
            this.root = root; // Root opslaan voor cleanup
            root.render(React.createElement(ProjectList));
            
            console.log('HomeView render complete');
        } catch (error) {
            console.error('Error rendering ProjectList:', error);
            const container = document.getElementById('projects-list');
            if (container) {
                container.innerHTML = '<div class="error">Er is iets misgegaan bij het laden van de projecten.</div>';
            }
        }

        return '';
    }

    async cleanup() {
        console.log('HomeView cleanup start');
        try {
            // Verwijder event listener
            document.getElementById('new-project-btn')?.removeEventListener('click', showModal);
            
            // Root unmounten
            if (this.root) {
                this.root.unmount();
                this.root = null;
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
const routes = {
    '/': { view: HomeView },
    '/settings': { view: SettingsView },
    '/404': { view: NotFoundView }
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
