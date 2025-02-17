class ProjectDetailView extends View {
    constructor() {
        super();
        this.projectId = null;
    }

    async render() {
        console.log('ProjectDetailView render start');
        
        // Haal project ID uit de URL
        const path = window.location.pathname;
        this.projectId = path.split('/project/')[1];
        
        if (!this.projectId) {
            return `
                <div class="error-container">
                    <h2>Project niet gevonden</h2>
                    <p>Ga terug naar <a href="/" data-route="/">projecten</a></p>
                </div>
            `;
        }

        try {
            // Haal project data op
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = `
                <div class="project-detail">
                    <div class="project-header">
                        <h2>Project wordt geladen...</h2>
                    </div>
                    <div class="project-content grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="calendar-section bg-white p-4 rounded-lg shadow">
                            <h3>Kalender</h3>
                            <p>Hier komt de kalender...</p>
                        </div>
                        <div class="map-section bg-white p-4 rounded-lg shadow">
                            <h3>Kaart</h3>
                            <p>Hier komt later de kaart...</p>
                        </div>
                    </div>
                </div>
            `;

            // Project data ophalen en weergeven
            const unsubscribe = subscribeToProject(this.projectId, (project) => {
                if (!project) {
                    mainContent.innerHTML = `
                        <div class="error-container">
                            <h2>Project niet gevonden</h2>
                            <p>Ga terug naar <a href="/" data-route="/">projecten</a></p>
                        </div>
                    `;
                    return;
                }

                const header = document.querySelector('.project-header');
                if (header) {
                    header.innerHTML = `
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h2 class="text-2xl font-bold">${project.name}</h2>
                                <p class="text-gray-600">
                                    ${project.location.street} ${project.location.number}, 
                                    ${project.location.postalCode} ${project.location.city}
                                </p>
                                ${project.description ? `<p class="mt-2">${project.description}</p>` : ''}
                            </div>
                            <a href="/" data-route="/" class="text-blue-600 hover:text-blue-800">
                                ← Terug naar projecten
                            </a>
                        </div>
                    `;
                }
            });

            // Cleanup functie retourneren
            this.cleanup = () => {
                if (unsubscribe) unsubscribe();
            };

        } catch (error) {
            console.error('Error in ProjectDetailView:', error);
            return `
                <div class="error-container">
                    <h2>Er is iets misgegaan</h2>
                    <p>Ga terug naar <a href="/" data-route="/">projecten</a></p>
                </div>
            `;
        }

        return '';
    }
}
