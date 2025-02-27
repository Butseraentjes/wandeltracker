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
        const startLat = 50.981728;  // Dit zou eigenlijk uit project.location moeten komen
        const startLng = 4.127903;

        // Als er een doel is, centreer de kaart tussen start en eindpunt
        if (project.goal) {
            // Voor nu gebruiken we vaste coördinaten voor het doel
            // TODO: Deze moeten we via een geocoding service ophalen
            const endLat = 51.2194475;  // Voorbeeld: Brussel
            const endLng = 4.4024643;

            // Bereken het middelpunt voor de kaartweergave
            const centerLat = (startLat + endLat) / 2;
            const centerLng = (startLng + endLng) / 2;

            this.map = L.map('map').setView([centerLat, centerLng], 10);
        } else {
            // Als er geen doel is, centreer op het startpunt
            this.map = L.map('map').setView([startLat, startLng], 13);
        }

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

        // Als er een doel is, voeg eindpunt toe en teken een lijn
        if (project.goal) {
            const endLat = 51.2194475;  // Voorbeeld: Brussel
            const endLng = 4.4024643;

            // Voeg marker toe voor eindpunt
            const endMarker = L.marker([endLat, endLng])
                .addTo(this.map)
                .bindPopup(`
                    <div class="text-center">
                        <strong>Doel</strong><br>
                        ${project.goal.city}
                    </div>
                `);

            // Teken een lijn tussen start- en eindpunt
            const pathLine = L.polyline(
                [
                    [startLat, startLng],
                    [endLat, endLng]
                ],
                {
                    color: '#3B82F6',
                    weight: 4,
                    opacity: 0.8
                }
            ).addTo(this.map);

            // Pas kaartweergave aan om beide punten te tonen
            this.map.fitBounds(pathLine.getBounds(), { padding: [50, 50] });
        }
    }

    async updateMapPath(project, totalDistance) {
        if (!this.map || !this.routes || this.routes.length === 0) {
            // Als er geen routes zijn, gebruik de originele implementatie
            if (!this.map) return;

            const startLat = 50.9953;
            const startLng = 4.1277;

            this.map.eachLayer((layer) => {
                if (
                    layer instanceof L.Polyline ||
                    (layer instanceof L.Marker && layer._popup?.getContent().includes('Huidige positie'))
                ) {
                    this.map.removeLayer(layer);
                }
            });

            try {
                const routeCoords = await this.getRouteCoordinates(startLat, startLng, totalDistance);

                const mainPath = L.polyline(routeCoords, {
                    color: '#3B82F6',
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
                        color: '#3B82F6',
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
    }

    // Routes beheren
    async handleRoutes(project) {
        const projectId = project.id;
        const addRouteBtn = document.getElementById('add-route-btn');
        
        if (addRouteBtn) {
            addRouteBtn.addEventListener('click', () => {
                this.showRouteModal();
            });
        }

        // Routes ophalen
        if (this.unsubscribeRoutes) {
            this.unsubscribeRoutes();
        }

        this.unsubscribeRoutes = subscribeToRoutes(projectId, (routes) => {
            this.routes = routes;
            this.renderRoutes(routes, project);
            this.updateMapWithRoutes(project, routes);
        });
    }

    // Routes weergeven
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

        const totalDistance = document.getElementById('total-distance');
        const totalKm = totalDistance ? parseFloat(totalDistance.textContent.match(/[\d.]+/)[0]) : 0;

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

        // Huidige geselecteerde route weergeven
        const currentRoute = routes[this.currentRouteIndex] || routes[0];
        if (currentRoute) {
            // Bereken voortgang op deze route (dit is een eenvoudige simulatie)
            const progress = Math.min(100, (totalKm / 300) * 100); // 300km als voorbeeld doel

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
                    <p class="text-gray-600 mb-2">Bestemming: ${currentRoute.city}, ${currentRoute.country}</p>
                    ${currentRoute.description ? `<p class="text-gray-600 mb-2">${currentRoute.description}</p>` : ''}
                    
                    <div class="progress-container border rounded p-2 mb-2">
                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                            <span>${project.location.city}</span>
                            <span>${currentRoute.city}</span>
                        </div>
                        <div class="h-2 bg-gray-200 rounded overflow-hidden">
                            <div class="h-2 bg-blue-600" style="width: ${progress}%"></div>
                        </div>
                        <div class="flex justify-between text-sm mt-1">
                            <span class="text-gray-600">Voortgang: ${progress.toFixed(1)}%</span>
                            <span class="text-gray-600">${totalKm.toFixed(1)} / ~300 km</span>
                        </div>
                    </div>
                </div>
            `;
        }

        routesContainer.innerHTML = routesHTML;

        // Event listeners voor route tabs
        const routeTabs = document.querySelectorAll('.route-tab');
        routeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const index = parseInt(tab.getAttribute('data-route-index'));
                this.currentRouteIndex = index;
                this.renderRoutes(routes, project);
                this.updateMapWithRoutes(project, routes);
            });
        });

        // Event listeners voor route bewerken
        const editButtons = document.querySelectorAll('.edit-route-btn');
        editButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const routeId = btn.getAttribute('data-route-id');
                const route = routes.find(r => r.id === routeId);
                if (route) {
                    this.showRouteModal(route);
                }
            });
        });

        // Event listeners voor route verwijderen
        const deleteButtons = document.querySelectorAll('.delete-route-btn');
        deleteButtons.forEach(btn => {
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

    // Route modal tonen
    showRouteModal(route = null) {
        const modal = document.getElementById('route-modal');
        const form = document.getElementById('route-form');
        const titleEl = document.getElementById('route-modal-title');
        const idInput = document.getElementById('route-id');
        const nameInput = document.getElementById('route-name');
        const cityInput = document.getElementById('route-city');
        const countryInput = document.getElementById('route-country');
        const descriptionInput = document.getElementById('route-description');
        const saveBtn = document.getElementById('save-route-btn');
        
        // Reset form
        form.reset();
        
        // Titel aanpassen
        titleEl.textContent = route ? 'Route Bewerken' : 'Route Toevoegen';
        
        // Formulier vullen als het een bewerking is
        if (route) {
            idInput.value = route.id;
            nameInput.value = route.name;
            cityInput.value = route.city;
            countryInput.value = route.country;
            if (route.description) {
                descriptionInput.value = route.description;
            }
        } else {
            idInput.value = '';
        }
        
        // Modal tonen
        modal.classList.remove('hidden');
        
        // Event handlers
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
                    city: cityInput.value,
                    country: countryInput.value,
                    description: descriptionInput.value,
                };
                
                if (idInput.value) {
                    routeData.id = idInput.value;
                }
                
                await saveRoute(this.params.id, routeData);
                closeModal();
                
            } catch (error) {
                console.error('Error saving route:', error);
                alert(error.message || 'Er is iets misgegaan bij het opslaan van de route.');
            } finally {
                document.getElementById('loading-spinner').classList.add('hidden');
            }
        };
        
        // Event listeners
        form.addEventListener('submit', handleSubmit);
        
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancel-route');
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Kaart updaten met routes
    updateMapWithRoutes(project, routes) {
        if (!this.map) return;
        
        // Verwijder bestaande route lijnen
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Polyline || 
                (layer instanceof L.Marker && 
                 !layer._popup?.getContent().includes('Start') && 
                 !layer._popup?.getContent().includes('Huidige positie'))) {
                this.map.removeLayer(layer);
            }
        });
        
        // Als er geen routes zijn, toon alleen de standaard kaart
        if (routes.length === 0) return;
        
        const startLat = 50.981728;  // Project startlocatie
        const startLng = 4.127903;
        
        // Huidige geselecteerde route
        const currentRoute = routes[this.currentRouteIndex] || routes[0];
        if (!currentRoute) return;
        
        // Eindpunt coördinaten (dit zou eigenlijk via een geocoding service moeten)
        // Voor nu gebruiken we random coördinaten per route
        const routeEndpoints = {
            // Simuleer verschillende eindpunten per route
            0: { lat: 51.2194475, lng: 4.4024643 },  // Bijvoorbeeld Antwerpen
            1: { lat: 50.8503396, lng: 4.3517103 },  // Bijvoorbeeld Brussel
            2: { lat: 51.0543422, lng: 3.7174243 }   // Bijvoorbeeld Gent
        };
        
        const endpoint = routeEndpoints[this.currentRouteIndex] || routeEndpoints[0];
        
        // Voeg route-marker toe
        const destinationMarker = L.marker([endpoint.lat, endpoint.lng])
            .addTo(this.map)
            .bindPopup(`
                <div class="text-center">
                    <strong>Bestemming: ${currentRoute.name}</strong><br>
                    ${currentRoute.city}, ${currentRoute.country}
                </div>
            `);
        
        // Teken een lijn van start naar bestemming
        const routeLine = L.polyline(
            [
                [startLat, startLng],
                [endpoint.lat, endpoint.lng]
            ],
            {
                color: '#6B46C1', // Paars voor de volledige route
                weight: 3,
                opacity: 0.6,
                dashArray: '5, 5' // Gestippelde lijn
            }
        ).addTo(this.map);
        
        // Pas kaartweergave aan om alles te tonen
        const bounds = routeLine.getBounds();
        this.map.fitBounds(bounds, { padding: [50, 50] });
        
        // Als er voortgang is, teken die op de route
        const totalDistanceElement = document.getElementById('total-distance');
        if (totalDistanceElement) {
            const totalDistanceText = totalDistanceElement.textContent;
            const totalDistance = parseFloat(totalDistanceText.match(/[\d.]+/)[0]);
            
            if (totalDistance > 0) {
                // Bereken positie op route
                const routeDistance = this.calculateDistance(
                    startLat, startLng,
                    endpoint.lat, endpoint.lng
                );
                
                const progress = Math.min(1, totalDistance / routeDistance);
                
                // Bereken huidige punt op de route
                const currentLat = startLat + (endpoint.lat - startLat) * progress;
                const currentLng = startLng + (endpoint.lng - startLng) * progress;
                
                // Voeg voortgangs-lijn toe
                const progressLine = L.polyline(
                    [
                        [startLat, startLng],
                        [currentLat, currentLng]
                    ],
                    {
                        color: '#3B82F6', // Blauw voor de voortgang
                        weight: 5,
                        opacity: 0.8
                    }
                ).addTo(this.map);
                
                // Voeg marker voor huidige positie toe
                L.marker([currentLat, currentLng])
                    .addTo(this.map)
                    .bindPopup(`
                        <div class="text-center">
                            <strong>Huidige positie</strong><br>
                            ${totalDistance.toFixed(1)} km vanaf start<br>
                            ${(progress * 100).toFixed(1)}% voltooid
                        </div>
                    `)
                    .openPopup();
            }
        }
    }
    
    // Helper functie om afstand te berekenen (in km)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Straal van de aarde in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Afstand in km
        return distance;
    }
    
    // Helper functie om graden naar radialen om te zetten
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    async cleanup() {
        if (this.unsubscribeProject) {
            this.unsubscribeProject();
        }
        if (this.unsubscribeWalks) {
            this.unsubscribeWalks();
        }
        if (this.unsubscribeRoutes) {
            this.unsubscribeRoutes();
        }
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
