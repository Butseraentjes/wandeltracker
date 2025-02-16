import { Router, View } from './lib/router.js';
import { initializeAuth, loginWithGoogle, logout } from './lib/firebase.js';

// Home View
class HomeView extends View {
    async render() {
        return `
            <div class="dashboard">
                <h2>Mijn Projecten</h2>
                <div id="projects-list">
                    <p>Projecten overzicht komt hier</p>
                </div>
            </div>
        `;
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

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login button
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            try {
                document.getElementById('loading-spinner').classList.remove('hidden');
                await loginWithGoogle();
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
                router.navigate('/');
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
