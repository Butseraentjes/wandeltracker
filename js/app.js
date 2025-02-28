import { ProjectDetailView } from './views/ProjectDetailView.js';
import { Router, View } from './lib/router.js';
import { initializeAuth, loginWithGoogle, logout, createProject, createProjectWithGeocode } from './lib/firebase.js';
import Homepage from './components/Homepage.js';

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
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold">Mijn Projecten</h2>
                            <p class="text-gray-600 text-sm">Beheer je wandelroutes en volg je vooruitgang</p>
                        </div>
                        <button id="new-project-btn" class="primary-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Nieuw Project
                        </button>
                    </div>
                    <div id="stats-overview" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold">Totale Afstand</h3>
                                <span class="p-2 bg-orange-100 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M18 6L6 18"></path>
                                        <path d="M6 6l12 12"></path>
                                    </svg>
                                </span>
                            </div>
                            <p class="text-3xl font-bold text-gray-800" id="total-distance">0 km</p>
                            <p class="text-gray-500 text-sm">Over alle projecten</p>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold">Projecten</h3>
                                <span class="p-2 bg-orange-100 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                                    </svg>
                                </span>
                            </div>
                            <p class="text-3xl font-bold text-gray-800" id="total-projects">0</p>
                            <p class="text-gray-500 text-sm">Actieve routes</p>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold">Wandelingen</h3>
                                <span class="p-2 bg-orange-100 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </span>
                            </div>
                            <p class="text-3xl font-bold text-gray-800" id="total-walks">0</p>
                            <p class="text-gray-500 text-sm">Deze maand</p>
                        </div>
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
                container.innerHTML = `
                    <div class="bg-red-50 text-red-600 p-6 rounded-lg shadow text-center border border-red-200 mt-8">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="text-lg font-semibold mb-2">Er is iets misgegaan</h3>
                        <p>Er is een fout opgetreden bij het laden van de projecten. Probeer het later opnieuw.</p>
                    </div>
                `;
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
                <div class="dashboard-header mb-6">
                    <div>
                        <h2 class="text-2xl font-bold">Instellingen</h2>
                        <p class="text-gray-600 text-sm">Beheer je account en voorkeuren</p>
                    </div>
                    <a href="/" data-route="/" class="secondary-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Terug
                    </a>
                </div>
                
                <div class="bg-white p-6 rounded-xl shadow-md mb-6">
                    <h3 class="text-lg font-semibold mb-4">Accountinstellingen</h3>
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-medium mb-2">E-mailadres</label>
                        <div class="flex items-center">
                            <input type="text" value="gebruiker@voorbeeld.nl" disabled class="border p-2 rounded mr-2 bg-gray-50 w-full">
                            <button class="secondary-btn">Wijzigen</button>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-medium mb-2">Profielnaam</label>
                        <div class="flex items-center">
                            <input type="text" placeholder="Jouw naam" class="border p-2 rounded mr-2 w-full">
                            <button class="secondary-btn">Opslaan</button>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-xl shadow-md mb-6">
                    <h3 class="text-lg font-semibold mb-4">Wandelinstellingen</h3>
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-medium mb-2">Standaard eenheid</label>
                        <select class="border p-2 rounded w-full">
                            <option>Kilometers (km)</option>
                            <option>Mijlen (mi)</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-medium mb-2">Dagelijks wandeldoel</label>
                        <div class="flex items-center">
                            <input type="number" value="5" min="0" step="0.1" class="border p-2 rounded mr-2 w-24">
                            <span class="text-gray-600">km per dag</span>
                        </div>
                    </div>
                    <button class="primary-btn mt-2">Instellingen opslaan</button>
                </div>
                
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h3 class="text-lg font-semibold mb-4">Account verwijderen</h3>
                    <p class="text-gray-600 mb-4">Als je je account verwijdert, worden alle gegevens permanent gewist. Deze actie kan niet ongedaan worden gemaakt.</p>
                    <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition">Account verwijderen</button>
                </div>
            </div>
        `;
    }
}

// 404 View
class NotFoundView extends View {
    async render() {
        return `
            <div class="flex flex-col items-center justify-center py-12">
                <div class="text-center">
                    <h2 class="text-9xl font-bold text-orange-500">404</h2>
                    <h3 class="text-2xl font-semibold mt-4 mb-6">Pagina Niet Gevonden</h3>
                    <p class="text-gray-600 mb-8">De pagina die je zoekt bestaat niet of is verplaatst.</p>
                    <a href="/" data-route="/" class="primary-btn inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Terug naar Home
                    </a>
                </div>
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
    // Focus op het eerste invoerveld
    setTimeout(() => {
        document.getElementById('project-name').focus();
    }, 100);
}

function hideModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.add('hidden');
    document.getElementById('project-form').reset();
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
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
                        city: document.getElementById('project-city').value,
                        country: 'Belgium' // Default waarde
                    },
                    description: document.getElementById('project-description').value
                };

                // Gebruik nieuwe functie met geocoding
                await createProjectWithGeocode(projectData);
                hideModal();
                
                // Succesnotificatie tonen
                const notification = document.createElement('div');
                notification.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg';
                notification.innerHTML = `
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <p>Project succesvol aangemaakt!</p>
                    </div>
                `;
                document.body.appendChild(notification);
                
                // Notificatie na 3 seconden verwijderen
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
                
            } catch (error) {
                console.error('Error creating project:', error);
                
                // Foutmelding tonen
                const errorModal = document.createElement('div');
                errorModal.className = 'fixed inset-0 flex items-center justify-center z-50';
                errorModal.innerHTML = `
                    <div class="fixed inset-0 bg-black opacity-50"></div>
                    <div class="bg-white rounded-lg p-6 max-w-md mx-auto relative z-10">
                        <div class="flex items-center text-red-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 class="text-lg font-semibold">Fout bij aanmaken project</h3>
                        </div>
                        <p class="text-gray-700 mb-4">Er is iets misgegaan bij het aanmaken van het project. Probeer het opnieuw.</p>
                        <div class="text-right">
                            <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Sluiten</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(errorModal);
                
                // Sluit de foutmelding bij klikken op de knop
                errorModal.querySelector('button').addEventListener('click', () => errorModal.remove());
                
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
    
    // Update statistieken na inladen van projecten
    window.addEventListener('projectsLoaded', (e) => {
        const projects = e.detail.projects || [];
        
        // Bijwerken projectenteller
        const totalProjectsElement = document.getElementById('total-projects');
        if (totalProjectsElement) {
            totalProjectsElement.textContent = projects.length;
        }
        
        // Bijwerken totale afstand en wandelingen
        // Dit is een placeholder - in werkelijkheid zou je deze data uit de projecten moeten halen
        const totalDistanceElement = document.getElementById('total-distance');
        const totalWalksElement = document.getElementById('total-walks');
        
        if (totalDistanceElement && totalWalksElement) {
            let totalDistance = 0;
            let totalWalks = 0;
            
            // Hier zou je eigenlijk de wandelingen moeten ophalen en tellen
            // Voor nu gebruiken we willekeurige waarden als voorbeeld
            totalDistance = Math.floor(Math.random() * 100);
            totalWalks = Math.floor(Math.random() * 20);
            
            totalDistanceElement.textContent = `${totalDistance} km`;
            totalWalksElement.textContent = totalWalks;
        }
    });
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
        
        // Voeg gebruikersinfo toe met avatar
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            // Eerste letter van e-mail als avatar
            const firstLetter = user.email.charAt(0).toUpperCase();
            userInfo.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                        ${firstLetter}
                    </div>
                    <span class="hidden md:inline">${user.email}</span>
                </div>
            `;
        }
        
        // Toon welkomstbericht de eerste keer
        const lastLogin = localStorage.getItem('lastLogin');
        const now = new Date().toDateString();
        
        if (lastLogin !== now) {
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-white border-l-4 border-orange-500 text-gray-700 p-4 rounded shadow-lg max-w-sm';
            notification.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium">Welkom terug, ${user.displayName || user.email.split('@')[0]}!</p>
                        <p class="text-xs text-gray-500 mt-1">Je bent succesvol ingelogd. Tijd om te wandelen!</p>
                    </div>
                    <button class="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500">
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Notificatie verwijderen bij klikken op close button
            notification.querySelector('button').addEventListener('click', () => {
                notification.remove();
            });
            
            // Notificatie na 5 seconden verwijderen
            setTimeout(() => {
                notification.classList.add('opacity-0');
                notification.style.transition = 'opacity 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }, 5000);
            
            localStorage.setItem('lastLogin', now);
        }
        
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
