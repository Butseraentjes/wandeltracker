import { subscribeToProject, saveWalk, subscribeToWalks, updateProjectGoal } from '../lib/firebase.js';
import { saveRoute, subscribeToRoutes, deleteRoute, saveRouteWithGeocode } from '../lib/routes.js';
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

    async getRouteCoordinates(startLat, startLng, endLat, endLng) {
        try {
            const { apiKey } = config.graphhopper;
            
            // GraphHopper API aanroepen om een echte wandelroute te krijgen
            const url = `https://graphhopper.com/api/1/route?vehicle=foot&locale=nl&key=${apiKey}&point=${startLat},${startLng}&point=${endLat},${endLng}&points_encoded=false&instructions=true&elevation=true`;

            console.log('Requesting walking route from GraphHopper:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`GraphHopper API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('GraphHopper response:', data);
            
            if (data.paths && data.paths.length > 0) {
                // GraphHopper geeft coördinaten terug in volgorde [longitude, latitude], 
                // maar Leaflet verwacht [latitude, longitude]
                return data.paths[0].points.coordinates.map(coord => [coord[1], coord[0]]);
            }
            
            throw new Error('Geen route gevonden in GraphHopper response');
        } catch (error) {
            console.error('Error getting route:', error);
            // Fallback naar rechte lijn als er iets misgaat
            return [
                [startLat, startLng],
                [endLat, endLng]
            ];
        }
    }

    async render() {
        console.log('ProjectDetailView render start');

        const projectId = this.params.id;

        if (!projectId) {
            return `
                <div class="flex flex-col items-center justify-center py-12">
                    <div class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-orange-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 class="text-2xl font-bold mb-4">Project niet gevonden</h2>
                        <p class="text-gray-600 mb-8">Het project dat je zoekt bestaat niet of is verwijderd.</p>
                        <a href="/" data-route="/" class="primary-btn inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Terug naar projecten
                        </a>
                    </div>
                </div>
            `;
        }

        try {
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = `
                <div class="project-detail">
                    <div class="project-header">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center">
                                <div class="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 17l6-6"></path>
                                        <path d="M10 16l4-4"></path>
                                        <path d="M15 15l5-5"></path>
                                        <path d="M19 15v5h-5"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold">Project wordt geladen...</h2>
                                    <p class="text-gray-500">Details worden opgehaald...</p>
                                </div>
                            </div>
                            <a href="/" data-route="/" class="secondary-btn inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                                    <path d="M19 12H5"></path>
                                    <path d="M12 19l-7-7 7-7"></path>
                                </svg>
                                Terug naar projecten
                            </a>
                        </div>
                    </div>
                    
                    <!-- Stats Overview -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div class="bg-white p-4 rounded-xl shadow-md flex items-center">
                            <div class="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 6L6 18"></path>
                                    <path d="M6 6l12 12"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">Totale afstand</p>
                                <p id="total-distance" class="text-lg font-semibold">Wordt berekend...</p>
                            </div>
                        </div>
                        
                        <div class="bg-white p-4 rounded-xl shadow-md flex items-center">
                            <div class="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">Wandelingen</p>
                                <p id="walks-count" class="text-lg font-semibold">0</p>
                            </div>
                        </div>
                        
                        <div class="bg-white p-4 rounded-xl shadow-md flex items-center">
                            <div class="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">Routes</p>
                                <p id="routes-count" class="text-lg font-semibold">0</p>
                            </div>
                        </div>
                        
                        <div class="bg-white p-4 rounded-xl shadow-md flex items-center">
                            <div class="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0"></path>
                                    <path d="M12 7v5l2.5 2.5"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">Laatste wandeling</p>
                                <p id="last-walk-date" class="text-lg font-semibold">-</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="project-content grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="calendar-section bg-white rounded-xl shadow-md overflow-hidden">
                            <div class="p-6 border-b border-gray-100">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <h3 class="text-lg font-semibold">Wandelingen</h3>
                                        <p class="text-sm text-gray-500">Klik op een datum om een wandeling toe te voegen</p>
                                    </div>
                                    <button id="add-walk-btn" class="primary-btn inline-flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                                            <path d="M12 5v14"></path>
                                            <path d="M5 12h14"></path>
                                        </svg>
                                        Nieuwe wandeling
                                    </button>
                                </div>
                            </div>
                            <div id="calendar" class="fc p-4"></div>
                        </div>
                        
                        <div class="map-section bg-white rounded-xl shadow-md overflow-hidden">
                            <div class="p-6 border-b border-gray-100">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <h3 class="text-lg font-semibold">Routes</h3>
                                        <p class="text-sm text-gray-500">Beheer je wandelroutes</p>
                                    </div>
                                    <button id="add-route-btn" class="primary-btn inline-flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                                            <path d="M12 5v14"></path>
                                            <path d="M5 12h14"></path>
                                        </svg>
                                        Nieuwe route
                                    </button>
                                </div>
                            </div>
                            <div class="p-4">
                                <div id="routes-container" class="mb-4">
                                    <div class="flex justify-center items-center p-4 text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Routes worden geladen...
                                    </div>
                                </div>
                            </div>
                            <div id="map" class="w-full h-[400px] rounded-lg overflow-hidden border border-gray-100"></div>
                        </div>
                    </div>
                </div>
            `;

            this.unsubscribeProject = subscribeToProject(projectId, (project) => {
                if (!project) {
                    mainContent.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-12">
                            <div class="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-orange-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h2 class="text-2xl font-bold mb-4">Project niet gevonden</h2>
                                <p class="text-gray-600 mb-8">Het project dat je zoekt bestaat niet of is verwijderd.</p>
                                <a href="/" data-route="/" class="primary-btn inline-flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    Terug naar projecten
                                </a>
                            </div>
                        </div>
                    `;
                    return;
                }

                const header = document.querySelector('.project-header');
                if (header) {
                    header.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div class="flex items-center">
                                <div class="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 17l6-6"></path>
                                        <path d="M10 16l4-4"></path>
                                        <path d="M15 15l5-5"></path>
                                        <path d="M19 15v5h-5"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold">${project.name}</h2>
                                    <p class="text-gray-600">
                                        ${project.location.street} ${project.location.number}, 
                                        ${project.location.postalCode} ${project.location.city}
                                    </p>
                                    ${project.description ? `<p class="mt-2 text-gray-500">${project.description}</p>` : ''}
                                </div>
                            </div>
                            <a href="/" data-route="/" class="secondary-btn inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                                    <path d="M19 12H5"></path>
                                    <path d="M12 19l-7-7 7-7"></path>
                                </svg>
                                Terug naar projecten
                            </a>
                        </div>
                    `;
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
                        totalDistanceElement.textContent = `${totalDistance.toFixed(1)} km`;
                    }

                    // Update wandelteller
                    const walksCountElement = document.getElementById('walks-count');
                    if (walksCountElement) {
                        walksCountElement.textContent = walks.length;
                    }

                    // Update laatste wandeldatum
                    if (walks.length > 0) {
                        const lastWalkDateElement = document.getElementById('last-walk-date');
                        if (lastWalkDateElement) {
                            // Sorteer de wandelingen op datum (nieuwste eerst)
                            const sortedWalks = [...walks].sort((a, b) => new Date(b.date) - new Date(a.date));
                            const lastWalkDate = new Date(sortedWalks[0].date);
                            lastWalkDateElement.textContent = lastWalkDate.toLocaleDateString('nl-NL');
                        }
                    }

                    const events = walks.map(walk => ({
                        title: `${walk.distance} km`,
                        start: walk.date,
                        display: 'block',
                        backgroundColor: '#f97316',
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
                <div class="flex flex-col items-center justify-center py-12">
                    <div class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-red-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 class="text-2xl font-bold mb-4">Er is iets misgegaan</h2>
                        <p class="text-gray-600 mb-8">Er is een fout opgetreden bij het laden van dit project.</p>
                        <a href="/" data-route="/" class="primary-btn inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Terug naar projecten
                        </a>
                    </div>
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
            dateClick: (info) => {
                this.handleDateClick(info, project);
            }
        });

        this.calendar.render();

        const addWalkBtn = document.getElementById('add-walk-btn');
        if (addWalkBtn) {
            addWalkBtn.addEventListener('click', () => {
                const today = new Date().toISOString().split('T')[0];
                this.handleDateClick({ dateStr: today }, project);
            });
        }
    }

    initializeMap(project) {
        const mapDiv = document.getElementById('map');
        if (!mapDiv || this.map) return;

        // Startpunt (project locatie)
        const startLat = project.location.coordinates?.lat || 50.981728;
        const startLng = project.location.coordinates?.lng || 4.127903;

        // Initialiseer de kaart
        this.map = L.map('map').setView([startLat, startLng], 13);

        // Voeg de OpenStreetMap tile layer toe
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Voeg marker toe voor startpunt
        const startMarker = L.marker([startLat, startLng])
            .addTo(this.map)
            .bindPopup(`
                <div class="text-center">
                    <strong>Start</strong><br>
                    ${project.location.street} ${project.location.number},<br>
                    ${project.location.postalCode} ${project.location.city}
                </div>
            `);
    }

    async updateMapPath(project, totalDistance) {
        if (!this.map || !this.routes || this.routes.length === 0) {
            // Als er geen routes zijn, gebruik de originele implementatie
            if (!this.map) return;

            const startLat = project.location.coordinates?.lat || 50.9953;
            const startLng = project.location.coordinates?.lng || 4.1277;

            this.map.eachLayer((layer) => {
                if (
                    layer instanceof L.Polyline ||
                    (layer instanceof L.Marker && layer._popup?.getContent().includes('Huidige positie'))
                ) {
                    this.map.removeLayer(layer);
                }
            });

            try {
                // Simuleer een route - dit zou vervangen moeten worden door een echte route naar een bestemming
                const angleInRadians = Math.random() * 2 * Math.PI;
                const distanceInDegrees = totalDistance / 111;
                const endLat = startLat + (distanceInDegrees * Math.cos(angleInRadians));
                const endLng = startLng + (distanceInDegrees * Math.sin(angleInRadians));
                
                const routeCoords = await this.getRouteCoordinates(startLat, startLng, endLat, endLng);

                const mainPath = L.polyline(routeCoords, {
                    color: '#f97316',
                    weight: 4,
                    opacity: 0.8,
                    lineCap: 'round'
                }).addTo(this.map);

                const endPoint = routeCoords[routeCoords.length - 1];
                const marker = L.marker(endPoint)
                    .addTo(this.map)
                    .bindPopup(
                        `
                            <div class="text-center">
                                <strong>Huidige positie</strong><br>
                                ${totalDistance.toFixed(1)} km vanaf start
                            </div>
                        `,
                        { className: 'custom-popup' }
                    );

                marker.openPopup();
                this.map.fitBounds(mainPath.getBounds(), { padding: [50, 50] });
            } catch (error) {
                console.error('Error updating map:', error);

                const endLng = startLng + (totalDistance / 111);
                const pathLine = L.polyline(
                    [
                        [startLat, startLng],
                        [startLat, endLng]
                    ],
                    {
                        color: '#f97316',
                        weight: 4,
                        opacity: 0.8
                    }
                ).addTo(this.map);

                L.marker([startLat, endLng])
                    .addTo(this.map)
                    .bindPopup(
                        `
                            <div class="text-center">
                                <strong>Huidige positie</strong><br>
                                ${totalDistance.toFixed(1)} km vanaf start
                            </div>
                        `
                    );

                this.map.fitBounds(pathLine.getBounds(), { padding: [50, 50] });
            }
        } else {
            // Als er routes zijn, gebruik de nieuwe route-gebaseerde weergave
            this.updateMapWithRoutes(project, this.routes);
        }
    }

    handleDateClick(info, project) {
        const modal = document.getElementById('walk-modal');
        const dateInput = document.getElementById('walk-date');
        const distanceInput = document.getElementById('walk-distance');
        const form = document.getElementById('walk-form');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancel-walk');

        form.reset();
        dateInput.value = info.dateStr;

        modal.classList.remove('hidden');

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

        const handleClose = () => {
            modal.classList.add('hidden');
            form.removeEventListener('submit', handleSubmit);
            closeBtn.removeEventListener('click', handleClose);
            cancelBtn.removeEventListener('click', handleClose);
            modal.removeEventListener('click', handleModalClick);
        };

        const handleModalClick = (e) => {
            if (e.target === modal) handleClose();
        };

        form.addEventListener('submit', handleSubmit);
        closeBtn.addEventListener('click', handleClose);
        cancelBtn.addEventListener('click', handleClose);
        modal.addEventListener('click', handleModalClick);
