import { subscribeToProject, saveWalk, subscribeToWalks } from '../lib/firebase.js';
import { View } from '../lib/router.js';

export class ProjectDetailView extends View {
    constructor() {
        super();
        this.unsubscribeProject = null;
        this.unsubscribeWalks = null;
        this.calendar = null;
    }

    async render() {
        console.log('ProjectDetailView render start');
        
        const projectId = this.params.id;
        
        if (!projectId) {
            return `
                <div class="error-container">
                    <h2>Project niet gevonden</h2>
                    <p>Ga terug naar <a href="/" data-route="/">projecten</a></p>
                </div>
            `;
        }

        try {
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = `
                <div class="project-detail p-4">
                    <div class="project-header mb-6">
                        <h2>Project wordt geladen...</h2>
                    </div>
                    <div class="project-content grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="calendar-section bg-white p-6 rounded-lg shadow">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold">Wandelingen</h3>
                                <button id="add-walk-btn" class="text-blue-600 hover:text-blue-800">
                                    + Nieuwe wandeling
                                </button>
                            </div>
                            <div id="calendar" class="fc"></div>
                        </div>
                        <div class="map-section bg-white p-6 rounded-lg shadow">
                            <h3 class="text-lg font-semibold mb-4">Kaart</h3>
                            <p>Hier komt later de kaart...</p>
                        </div>
                    </div>
                </div>
            `;

            // Project data ophalen en weergeven
            console.log('Setting up project subscription for ID:', projectId);
            this.unsubscribeProject = subscribeToProject(projectId, (project) => {
                console.log('Received project data:', project);
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
                        <div class="flex justify-between items-center">
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

                // Initialiseer kalender
                this.initializeCalendar(project);
                
                // Subscribe naar wandelingen
                if (this.unsubscribeWalks) {
                    this.unsubscribeWalks();
                }
                
                this.unsubscribeWalks = subscribeToWalks(projectId, (walks) => {
                    // Convert walks naar FullCalendar events
                    const events = walks.map(walk => ({
                        title: `${walk.distance} km`,
                        start: walk.date,
                        display: 'block',
                        backgroundColor: '#3B82F6', // Tailwind blue-500
                    }));
                    
                    // Update calendar events
                    if (this.calendar) {
                        this.calendar.removeAllEvents();
                        this.calendar.addEventSource(events);
                    }
                });
            });

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

    initializeCalendar(project) {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl || this.calendar) return;

        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            locale: 'nl',
            height: 'auto',
            selectable: true,
            events: [], // Hier komen later de wandelingen
            dateClick: (info) => {
                this.handleDateClick(info, project);
            }
        });

        this.calendar.render();

        // Voeg click event toe aan de "Nieuwe wandeling" knop
        const addWalkBtn = document.getElementById('add-walk-btn');
        if (addWalkBtn) {
            addWalkBtn.addEventListener('click', () => {
                const today = new Date().toISOString().split('T')[0];
                this.handleDateClick({ dateStr: today }, project);
            });
        }
    }

    handleDateClick(info, project) {
        const modal = document.getElementById('walk-modal');
        const dateInput = document.getElementById('walk-date');
        const distanceInput = document.getElementById('walk-distance');
        const form = document.getElementById('walk-form');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancel-walk');

        // Reset form
        form.reset();
        dateInput.value = info.dateStr;

        // Show modal
        modal.classList.remove('hidden');

        // Handle form submission
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            try {
                document.getElementById('loading-spinner').classList.remove('hidden');
                
                const walkData = {
                    date: dateInput.value,
                    distance: parseFloat(distanceInput.value),
                    projectId: project.id
                };

                await saveWalk(project.id, walkData);
                modal.classList.add('hidden');
                
            } catch (error) {
                console.error('Error saving walk:', error);
                alert('Er is iets misgegaan bij het opslaan van de wandeling. Probeer het opnieuw.');
            } finally {
                document.getElementById('loading-spinner').classList.add('hidden');
            }
        };

        // Handle close
        const handleClose = () => {
            modal.classList.add('hidden');
            form.removeEventListener('submit', handleSubmit);
            closeBtn.removeEventListener('click', handleClose);
            cancelBtn.removeEventListener('click', handleClose);
            modal.removeEventListener('click', handleModalClick);
        };

        // Handle modal background click
        const handleModalClick = (e) => {
            if (e.target === modal) handleClose();
        };

        // Add event listeners
        form.addEventListener('submit', handleSubmit);
        closeBtn.addEventListener('click', handleClose);
        cancelBtn.addEventListener('click', handleClose);
        modal.addEventListener('click', handleModalClick);
    }

    async cleanup() {
        if (this.unsubscribeProject) {
            this.unsubscribeProject();
        }
        if (this.unsubscribeWalks) {
            this.unsubscribeWalks();
        }
        if (this.calendar) {
            this.calendar.destroy();
            this.calendar = null;
        }
    }
}
