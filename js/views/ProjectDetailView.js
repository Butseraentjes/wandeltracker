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
            const url = `https://graphhopper.com/api/1/route?vehicle=foot&locale=nl&key=${apiKey}&point=${startLat},${startLng}&point=${endLat},${endLng}&points_encoded=false&instructions=true&elevation=true`;

            console.log('Requesting walking route from GraphHopper:', url);
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
                                <div id="map" style="height: 300px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Subscribe to project data
            if (this.unsubscribeProject) this.unsubscribeProject();

            this.unsubscribeProject = subscribeToProject(projectId, (project) => {
                if (!project) {
                    mainContent.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-12">
                            <h2 class="text-2xl font-bold mb-4">Project niet gevonden</h2>
                            <a href="/" data-route="/" class="primary-btn">Terug naar projecten</a>
                        </div>
                    `;
                    return;
                }

                document.querySelector('.project-header h2').textContent = project.name || 'Naamloos Project';
                document.querySelector('.project-header p').textContent = project.description || 'Geen beschrijving beschikbaar';

                // Initialize calendar and map
                this.initializeCalendar(project);
                this.initializeMap(project);
                this.handleRoutes(project);

                // Subscribe to walks
                if (this.unsubscribeWalks) this.unsubscribeWalks();

                this.unsubscribeWalks = subscribeToWalks(projectId, (walks) => {
                    const totalDistance = walks.reduce((total, walk) => total + (walk.distance || 0), 0);
                    const walksCount = walks.length;
                    const lastWalk = walks.length > 0 ? walks[walks.length - 1].date : '-';

                    document.getElementById('total-distance').textContent = `${totalDistance.toFixed(1)} km`;
                    document.getElementById('walks-count').textContent = walksCount;
                    document.getElementById('routes-count').textContent = this.routes.length;
                    document.getElementById('last-walk-date').textContent = lastWalk;

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

            // Goal modal event listeners
            const goalForm = document.getElementById('goal-form');
            const goalModal = document.getElementById('goal-modal');
            if (goalModal) {
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
            }

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
            dateClick: (info) => this.handleDateClick(info, project)
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

        const startLat = project.location.coordinates?.lat || 50.981728;
        const startLng = project.location.coordinates?.lng || 4.127903;

        this.map = L.map('map').setView([startLat, startLng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        L.marker([startLat, startLng])
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
        if (!this.map) return;

        const startLat = project.location.coordinates?.lat || 50.981728;
        const startLng = project.location.coordinates?.lng || 4.127903;

        this.map.eachLayer((layer) => {
            if (layer instanceof L.Polyline || (layer instanceof L.Marker && layer._popup?.getContent().includes('Huidige positie'))) {
                this.map.removeLayer(layer);
            }
        });

        if (this.routes.length === 0) {
            try {
                const angleInRadians = Math.random() * 2 * Math.PI;
                const distanceInDegrees = totalDistance / 111;
                const endLat = startLat + (distanceInDegrees * Math.cos(angleInRadians));
                const endLng = startLng + (distanceInDegrees * Math.sin(angleInRadians));
                
                const routeCoords = await this.getRouteCoordinates(startLat, startLng, endLat, endLng);
                const mainPath = L.polyline(routeCoords, {
                    color: '#3B82F6',
                    weight: 4,
                    opacity: 0.8,
                    lineCap: 'round'
                }).addTo(this.map);

                const endPoint = routeCoords[routeCoords.length - 1];
                const marker = L.marker(endPoint)
                    .addTo(this.map)
                    .bindPopup(`
                        <div class="text-center">
                            <strong>Huidige positie</strong><br>
                            ${totalDistance.toFixed(1)} km vanaf start
                        </div>
                    `);

                marker.openPopup();
                this.map.fitBounds(mainPath.getBounds(), { padding: [50, 50] });
            } catch (error) {
                console.error('Error updating map:', error);
                const endLng = startLng + (totalDistance / 111);
                const pathLine = L.polyline(
                    [[startLat, startLng], [startLat, endLng]],
                    { color: '#3B82F6', weight: 4, opacity: 0.8 }
                ).addTo(this.map);

                L.marker([startLat, endLng])
                    .addTo(this.map)
                    .bindPopup(`
                        <div class="text-center">
                            <strong>Huidige positie</strong><br>
                            ${totalDistance.toFixed(1)} km vanaf start
                        </div>
                    `);

                this.map.fitBounds(pathLine.getBounds(), { padding: [50, 50] });
            }
        } else {
            this.updateMapWithRoutes(project, this.routes);
        }
    }

    handleDateClick(info, project) {
        const modal = document.getElementById('walk-modal');
        if (!modal) return;

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
    }

    async handleRoutes(project) {
        const projectId = project.id;
        const addRouteBtn = document.getElementById('add-route-btn');
        
        if (addRouteBtn) {
            addRouteBtn.addEventListener('click', () => this.showRouteModal());
        }

        if (this.unsubscribeRoutes) this.unsubscribeRoutes();

        this.unsubscribeRoutes = subscribeToRoutes(projectId, (routes) => {
            this.routes = routes;
            this.renderRoutes(routes, project);
            this.updateMapWithRoutes(project, routes);
        });
    }

    renderRoutes(routes, project) {
        const routesContainer = document.getElementById('routes-container');
        if (!routesContainer) return;

        if (routes.length === 0) {
            routesContainer.innerHTML = `
                <div class="text-center py-4 border rounded mb-4">
                    <p class="text-gray-600">Je hebt nog geen routes aangemaakt.</p>
                    <p class="text-gray-600 text-sm">Maak maximaal 3 routes aan om je wandelingen te volgen.</p>
                </div>
            `;
            return;
        }

        const totalDistance = parseFloat(document.getElementById('total-distance').textContent.match(/[\d.]+/)?.[0] || 0);
        let routesHTML = `
            <div class="route-tabs flex mb-4 border-b">
                ${routes.map((route, index) => `
                    <button class="route-tab py-2 px-4 ${this.currentRouteIndex === index ? 'bg-blue-100 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}" 
                            data-route-index="${index}">
                        ${route.name}
                    </button>
                `).join('')}
            </div>
        `;

        const currentRoute = routes[this.currentRouteIndex] || routes[0];
        if (currentRoute) {
            const startLat = project.location.coordinates?.lat || 50.981728;
            const startLng = project.location.coordinates?.lng || 4.127903;
            const destLat = currentRoute.destination?.coordinates?.lat || 51.2194;
            const destLng = currentRoute.destination?.coordinates?.lng || 4.4025;
            const routeDistance = this.calculateDistance(startLat, startLng, destLat, destLng);
            const progress = Math.min(100, (totalDistance / routeDistance) * 100);

            routesHTML += `
                <div class="route-details mb-4">
                    <div class="flex justify-between mb-2">
                        <h4 class="font-semibold">${currentRoute.name}</h4>
                        <div class="flex gap-2">
                            <button class="text-blue-600 hover:text-blue-800 edit-route-btn" data-route-id="${currentRoute.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="text-red-600 hover:text-red-800 delete-route-btn" data-route-id="${currentRoute.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <p class="text-gray-600 mb-2">Bestemming: ${currentRoute.destination?.city || ''}, ${currentRoute.destination?.country || ''}</p>
                    ${currentRoute.description ? `<p class="text-gray-600 mb-2">${currentRoute.description}</p>` : ''}
                    <div class="progress-container border rounded p-2 mb-2">
                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                            <span>${project.location.city}</span>
                            <span>${currentRoute.destination?.city || ''}</span>
                        </div>
                        <div class="h-2 bg-gray-200 rounded overflow-hidden">
                            <div class="h-2 bg-blue-600" style="width: ${progress}%"></div>
                        </div>
                        <div class="flex justify-between text-sm mt-1">
                            <span class="text-gray-600">Voortgang: ${progress.toFixed(1)}%</span>
                            <span class="text-gray-600">${totalDistance.toFixed(1)} / ${routeDistance.toFixed(1)} km</span>
                        </div>
                    </div>
                </div>
            `;
        }

        routesContainer.innerHTML = routesHTML;

        document.querySelectorAll('.route-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentRouteIndex = parseInt(tab.getAttribute('data-route-index'));
                this.renderRoutes(routes, project);
                this.updateMapWithRoutes(project, routes);
            });
        });

        document.querySelectorAll('.edit-route-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const routeId = btn.getAttribute('data-route-id');
                const route = routes.find(r => r.id === routeId);
                if (route) this.showRouteModal(route);
            });
        });

        document.querySelectorAll('.delete-route-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const routeId = btn.getAttribute('data-route-id');
                if (confirm('Weet je zeker dat je deze route wilt verwijderen?')) {
                    try {
                        document.getElementById('loading-spinner').classList.remove('hidden');
                        await deleteRoute(project.id, routeId);
                    } catch (error) {
                        console.error('Error deleting route:', error);
                        alert('Er is iets misgegaan bij het verwijderen van de route.');
                    } finally {
                        document.getElementById('loading-spinner').classList.add('hidden');
                    }
                }
            });
        });
    }

    showRouteModal(route = null) {
        const modal = document.getElementById('route-modal');
        if (!modal) return;

        const form = document.getElementById('route-form');
        const titleEl = document.getElementById('route-modal-title');
        const idInput = document.getElementById('route-id');
        const nameInput = document.getElementById('route-name');
        const streetInput = document.getElementById('route-dest-street');
        const numberInput = document.getElementById('route-dest-number');
        const postalInput = document.getElementById('route-dest-postal');
        const cityInput = document.getElementById('route-dest-city');
        const countryInput = document.getElementById('route-dest-country');
        const descriptionInput = document.getElementById('route-description');

        form.reset();
        titleEl.textContent = route ? 'Route Bewerken' : 'Route Toevoegen';

        if (route) {
            idInput.value = route.id;
            nameInput.value = route.name;
            if (route.destination) {
                streetInput.value = route.destination.street || '';
                numberInput.value = route.destination.number || '';
                postalInput.value = route.destination.postalCode || '';
                cityInput.value = route.destination.city || '';
                countryInput.value = route.destination.country || 'Belgium';
            }
            descriptionInput.value = route.description || '';
        } else {
            idInput.value = '';
            countryInput.value = 'Belgium';
        }

        modal.classList.remove('hidden');

        const closeModal = () => {
            modal.classList.add('hidden');
            form.removeEventListener('submit', handleSubmit);
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                document.getElementById('loading-spinner').classList.remove('hidden');
                const routeData = {
                    name: nameInput.value,
                    destStreet: streetInput.value,
                    destNumber: numberInput.value,
                    destPostalCode: postalInput.value,
                    destCity: cityInput.value,
                    destCountry: countryInput.value,
                    description: descriptionInput.value,
                };
                if (idInput.value) routeData.id = idInput.value;
                await saveRouteWithGeocode(this.params.id, routeData);
                closeModal();
            } catch (error) {
                console.error('Error saving route:', error);
                alert(error.message || 'Er is iets misgegaan bij het opslaan van de route.');
            } finally {
                document.getElementById('loading-spinner').classList.add('hidden');
            }
        };

        form.addEventListener('submit', handleSubmit);
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancel-route');

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    async updateMapWithRoutes(project, routes) {
        if (!this.map || routes.length === 0) return;

        this.map.eachLayer((layer) => {
            if (layer instanceof L.Polyline || (layer instanceof L.Marker && !layer._popup?.getContent().includes('Start'))) {
                this.map.removeLayer(layer);
            }
        });

        const startLat = project.location.coordinates?.lat || 50.981728;
        const startLng = project.location.coordinates?.lng || 4.127903;
        const currentRoute = routes[this.currentRouteIndex] || routes[0];
        const destLat = currentRoute.destination?.coordinates?.lat || 51.2194;
        const destLng = currentRoute.destination?.coordinates?.lng || 4.4025;

        L.marker([destLat, destLng])
            .addTo(this.map)
            .bindPopup(`
                <div class="text-center">
                    <strong>Bestemming: ${currentRoute.name}</strong><br>
                    ${currentRoute.destination?.street || ''} ${currentRoute.destination?.number || ''}<br>
                    ${currentRoute.destination?.postalCode || ''} ${currentRoute.destination?.city || ''}
                </div>
            `);

        try {
            const routeCoords = await this.getRouteCoordinates(startLat, startLng, destLat, destLng);
            const routeLine = L.polyline(routeCoords, {
                color: '#6B46C1',
                weight: 3,
                opacity: 0.6
            }).addTo(this.map);

            this.map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

            const totalDistance = parseFloat(document.getElementById('total-distance').textContent.match(/[\d.]+/)?.[0] || 0);
            if (totalDistance > 0) {
                let routeDistance = 0;
                for (let i = 1; i < routeCoords.length; i++) {
                    routeDistance += this.calculateDistance(
                        routeCoords[i-1][0], routeCoords[i-1][1],
                        routeCoords[i][0], routeCoords[i][1]
                    );
                }

                const progress = Math.min(1, totalDistance / routeDistance);
                let accumulatedDistance = 0;
                let progressCoords = [routeCoords[0]];

                for (let i = 1; i < routeCoords.length; i++) {
                    const segmentDistance = this.calculateDistance(
                        routeCoords[i-1][0], routeCoords[i-1][1],
                        routeCoords[i][0], routeCoords[i][1]
                    );
                    if (accumulatedDistance + segmentDistance <= totalDistance) {
                        progressCoords.push(routeCoords[i]);
                        accumulatedDistance += segmentDistance;
                    } else {
                        const segmentProgress = (totalDistance - accumulatedDistance) / segmentDistance;
                        const lastLat = routeCoords[i-1][0] + (routeCoords[i][0] - routeCoords[i-1][0]) * segmentProgress;
                        const lastLng = routeCoords[i-1][1] + (routeCoords[i][1] - routeCoords[i-1][1]) * segmentProgress;
                        progressCoords.push([lastLat, lastLng]);
                        break;
                    }
                }

                const progressLine = L.polyline(progressCoords, {
                    color: '#3B82F6',
                    weight: 5,
                    opacity: 0.8
                }).addTo(this.map);

                const currentPosition = progressCoords[progressCoords.length - 1];
                L.marker(currentPosition)
                    .addTo(this.map)
                    .bindPopup(`
                        <div class="text-center">
                            <strong>Huidige positie</strong><br>
                            ${totalDistance.toFixed(1)} km afgelegd<br>
                            ${(progress * 100).toFixed(1)}% van de route voltooid
                        </div>
                    `)
                    .openPopup();
            }
        } catch (error) {
            console.error('Error creating walking route:', error);
            const routeLine = L.polyline(
                [[startLat, startLng], [destLat, destLng]],
                { color: '#6B46C1', weight: 3, opacity: 0.6, dashArray: '5, 5' }
            ).addTo(this.map);
            this.map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    async cleanup() {
        if (this.unsubscribeProject) this.unsubscribeProject();
        if (this.unsubscribeWalks) this.unsubscribeWalks();
        if (this.unsubscribeRoutes) this.unsubscribeRoutes();
        if (this.calendar) {
            this.calendar.destroy();
            this.calendar = null;
        }
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        super.cleanup();
    }
}
