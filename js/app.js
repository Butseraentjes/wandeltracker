import { Router, View } from './lib/router.js';
import { initializeAuth, loginWithGoogle, logout, createProject } from './lib/firebase.js';

// Home View
class HomeView extends View {
    async render() {
        // We gebruiken de bestaande HTML structuur
        // Deze methode wordt niet meer gebruikt maar moet wel bestaan voor de router
        return '';
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

// UI State Management
function updateUIForLoggedInUser(user) {
    const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');
    const mainNav = document.getElementById('main-nav');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');

    // Verberg login, toon main content
    loginContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
    mainNav.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    
    // Update gebruikersinfo
    userInfo.textContent = user.email;
}

function updateUIForLoggedOutUser() {
    const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');
    const mainNav = document.getElementById('main-nav');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');

    // Toon login, verberg main content
    loginContainer.classList.remove('hidden');
    mainContent.classList.add('hidden');
    mainNav.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    userInfo.textContent = '';
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
                updateUIForLoggedInUser(user);
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
                updateUIForLoggedOutUser();
            } catch (error) {
                console.error('Logout failed:', error);
                alert('Uitloggen mislukt. Probeer het opnieuw.');
            } finally {
                document.getElementById('loading-spinner').classList.add('hidden');
            }
        });
    }

    // New Project button
    const newProjectBtn = document.getElementById('new-project-btn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', showModal);
    }

    // Close modal button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }

    // Cancel project button
    const cancelProjectBtn = document.getElementById('cancel-project');
    if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', hideModal);
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
                    description: document.getElementById('project-description').value,
                    createdAt: new Date()
                };

                await createProject(projectData);
                hideModal();
                alert('Project succesvol aangemaakt!');
                // Later zullen we hier de projectenlijst verversen
                
            } catch (error) {
                console.error('Error creating project:', error);
                alert('Er is iets misgegaan bij het aanmaken van het project. Probeer het opnieuw.');
            } finally {
                document.getElementById('loading-spinner').classList.add('hidden');
            }
        });
    }

    // Click outside modal to close
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
    }
});

// Initialize auth state observer
initializeAuth(
    // Login callback
    (user) => {
        console.log('User logged in:', user.email);
        updateUIForLoggedInUser(user);
        router.start();
    },
    // Logout callback
    () => {
        console.log('User logged out');
        updateUIForLoggedOutUser();
        router.navigate('/');
    }
);

// Start router
router.start();
