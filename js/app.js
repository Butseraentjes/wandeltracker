// In app.js

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
            
            // Alleen een nieuwe root maken als die nog niet bestaat
            const container = document.getElementById('projects-list');
            if (!this.root) {
                this.root = ReactDOM.createRoot(container);
            }

            // Render de ProjectList component
            const { default: ProjectList } = await import('./components/ProjectList.js');
            this.root.render(React.createElement(ProjectList));
            
            console.log('HomeView render complete');
        } catch (error) {
            console.error('Error rendering ProjectList:', error);
            const container = document.getElementById('projects-list');
            container.innerHTML = '<div class="error">Er is iets misgegaan bij het laden van de projecten.</div>';
        }

        return '';
    }

    async cleanup() {
        console.log('HomeView cleanup start');
        try {
            // Verwijder event listener
            document.getElementById('new-project-btn')?.removeEventListener('click', showModal);
            
            // Root unmounten maar niet vernietigen
            if (this.root) {
                this.root.unmount();
            }
        } catch (error) {
            console.error('Error in cleanup:', error);
        }
    }

    async initialize() {
        await super.initialize();
        // Voeg hier eventuele extra initialisatie toe
    }
}
