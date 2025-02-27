import { subscribeToProject, saveWalk, subscribeToWalks, updateProjectGoal } from '../lib/firebase.js';
import { saveRoute, subscribeToRoutes, deleteRoute } from '../lib/routes.js';
import { View } from '../lib/router.js';
import { config } from '../lib/config.js';
 
export class ProjectDetailView extends View {
    constructor() {
        super();
        this.unsubscribeProject = null;
        this.unsubscribeWalks = null;
        this.unsubscribeRoutes = null;
        this.calendar = null;
        this.map = null;
        this.routes = [];
        this.currentRouteIndex = 0;
    }

    async getRouteCoordinates(startLat, startLng, distance) {
        try {
            const angleInRadians = Math.random() * 2 * Math.PI;
            const distanceInDegrees = distance / 111;
            const endLat = startLat + (distanceInDegrees * Math.cos(angleInRadians));
            const endLng = startLng + (distanceInDegrees * Math.sin(angleInRadians));
            
            const { apiKey } = config.graphhopper;
            const url = `https://graphhopper.com/api/1/route?vehicle=foot&locale=nl&key=${apiKey}&point=${startLat},${startLng}&point=${endLat},${endLng}&points_encoded=false&instructions=true&elevation=true`;

            console.log('Requesting route from GraphHopper:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`GraphHopper API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('GraphHopper response:', data);
            
            if (data.paths && data.paths.length > 0) {
                return data.paths[0].points.coordinates.map(coord => [coord[1], coord[0]]);
            }
            
            throw new Error('Geen route gevonden in GraphHopper response');
        } catch (error) {
            console.error('Error getting route:', error);
            const jitter = (Math.random() - 0.5) * 0.01;
            return [
                [startLat, startLng],
                [startLat + jitter, startLng + (distance / 111)]
            ];
        }
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
                            <div class="flex flex-col gap-4">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <h3 class="text-lg font-semibold">Wandelingen</h3>
                                        <p id="total-distance" class="text-sm text-gray-600">Totale afstand wordt berekend...</p>
                                    </div>
                                    <button id="add-walk-btn" class="text-blue-600 hover:text-blue-800">
                                        + Nieuwe wandeling
                                    </button>
                                </div>
                            </div>
                            <div id="calendar" class="fc"></div>
                        </div>
                        <div class="map-section bg-white p-6 rounded-lg shadow">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold">Routes</h3>
                                <button id="add-route-btn" class="text-blue-600 hover:text-blue-800">
                                    + Nieuwe route
                                </button>
                            </div>
                            <div id="routes-container" class="mb-4">
                                <p class="text-gray-600 text-sm mb-2">Routes worden geladen...</p>
                            </div>
                            <div id="map" style="height: 400px;"></div>
                        </div>
                    </div>
                </div>
            `;

            this.unsubscribeProject = subscribeToProject(projectId, (project) => {
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
            <div class="mt-4">
 ${project.goal 
    ? `<div class="flex items-center gap-2">
         <p class="text-green-600">Doel: ${project.goal.city}</p>
         <button id="edit-goal-btn" class="text-blue-600 hover:text-blue-800 text-sm">
           Bewerken
         </button>
       </div>`
    : `<button id="add-goal-btn" class="text-blue-600 hover:text-blue-800">
         + Voeg doel toe
       </button>`
}
            </div>
        </div>
        <a href="/" data-route="/" class="text-blue-600 hover:text-blue-800">
            ← Terug naar projecten
        </a>
    </div>
`;

                }

                // Goal button event listeners
const addGoalBtn = document.getElementById('add-goal-btn');
const editGoalBtn = document.getElementById('edit-goal-btn');

if (addGoalBtn) {
    addGoalBtn.addEventListener('click', () => {
        const modal = document.getElementById('goal-modal');
        modal.classList.remove('hidden');
    });
}

if (editGoalBtn) {
    editGoalBtn.addEventListener('click', () => {
        const modal = document.getElementById('goal-modal');
        const cityInput = document.getElementById('goal-city');
        cityInput.value = project.goal.city; // Vul huidige stad in
        modal.classList.remove('hidden');
    });
}

                // Goal modal event listeners
                const goalForm = document.getElementById('goal-form');
                const goalModal = document.getElementById('goal-modal');
                const closeGoalBtn = goalModal.querySelector('.close-modal');
                const cancelGoalBtn = document.getElementById('cancel-goal');

                const hideGoalModal = () => {
                    goalModal.classList.add('hidden');
                    goalForm.reset();
                };

goalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        document.getElementById('loading-spinner').classList.remove('hidden');
        const city = document.getElementById('goal-city').value;
        
        await updateProjectGoal(this.params.id, { city });
        hideGoalModal();
    } catch (error) {
        console.error('Error saving goal:', error);
        alert('Er is iets misgegaan bij het opslaan van het doel. Probeer het opnieuw.');
    } finally {
        document.getElementById('loading-spinner').classList.add('hidden');
    }
});

                closeGoalBtn.addEventListener('click', hideGoalModal);
                cancelGoalBtn.addEventListener('click', hideGoalModal);
                goalModal.addEventListener('click', (e) => {
                    if (e.target === goalModal) hideGoalModal();
                });

                this.initializeCalendar(project);
             
                this.initializeMap(project);
                
                // Routes initialiseren
                this.handleRoutes(project);

                if (this.unsubscribeWalks) {
                    this.unsubscribeWalks();
                }

                this.unsubscribeWalks = subscribeToWalks(projectId, (walks) => {
                    const totalDistance = walks.reduce((total, walk) => total + (walk.distance || 0), 0);

                    const totalDistanceElement = document.getElementById('total-distance');
                    if (totalDistanceElement) {
                        totalDistanceElement.textContent = `Totale afstand: ${totalDistance.toFixed(1)} km`;
                    }

                    const events = walks.map(walk => ({
                        title: `${walk.distance} km`,
                        start: walk.date,
                        display: 'block',
                        backgroundColor: '#3B82F6',
                    }));

                    if (this.calendar) {
                        this.calendar.removeAllEvents();
                        this.calendar.addEventSource(events);
                    }

                    this.updateMapPath(project, totalDistance);
                });
            });
        } catch (error) {
            console.error('Error in ProjectDetailView:', error);
            return `
                <div class="error-container">
                    <h2>Er is i
