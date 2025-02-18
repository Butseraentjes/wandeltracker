import { subscribeToProject, saveWalk, subscribeToWalks } from '../lib/firebase.js';
import { View } from '../lib/router.js';

export class ProjectDetailView extends View {
    constructor() {
        super();
        this.unsubscribeProject = null;
        this.unsubscribeWalks = null;
        this.calendar = null;
        this.map = null;
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
                            <h3 class="text-lg font-semibold mb-4">Kaart</h3>
                            <div id="map" style="height: 400px;"></div>
                        </div>
                    </div>
                </div>
            `;

            // Project data ophalen en weergeven
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
                            </div>
                            <a href="/" data-route="/" class="text-blue-600 hover:text-blue-800">
                                ← Terug naar projecten
                            </a>
                        </div>
                    `;
                }

                // Initialiseer kalender en kaart
                this.initializeCalendar(project);
                this.initializeMap(project);
                
                // Subscribe naar wandelingen
                if (this.unsubscribeWalks) {
                    this.unsubscribeWalks();
                }
                
                this.unsubscribeWalks = subscribeToWalks(projectId, (walks) => {
                    // Bereken totale afstand
                    const totalDistance = walks.reduce((total, walk) => total + (walk.distance || 0), 0);
                    
                    // Update totale afstand weergave
                    const totalDistanceElement = document.getElementById('total-distance');
                    if (totalDistanceElement) {
                        totalDistanceElement.textContent = `Totale afstand: ${totalDistance.toFixed(1)} km`;
                    }

                    // Convert walks naar FullCalendar events
                    const events = walks.map(walk => ({
                        title: `${walk.distance} km`,
                        start: walk.date,
                        display: 'block',
                        backgroundColor: '#3B82F6',
                    }));
                    
                    // Update calendar events
                    if (this.calendar) {
                        this.calendar.removeAllEvents();
                        this.calendar.addEventSource(events);
                    }

                    // Update kaart met de nieuwe totale afstand
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

        // Voeg click event toe aan de "Nieuwe wandeling" knop
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

        // Voorlopig gebruiken we vaste coördinaten voor Lebbeke
        const defaultLat = 50.9953;
        const defaultLng = 4.1277;

        // Initialiseer de kaart
        this.map = L.map('map').setView([defaultLat, defaultLng], 13);

        // Voeg de OpenStreetMap tile layer toe
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Voeg een marker toe voor de startlocatie
        L.marker([defaultLat, defaultLng])
            .addTo(this.map)
            .bindPopup(`Startlocatie: ${project.location.street} ${project.location.number}, ${project.location.postalCode} ${project.location.city}`);
    }

async updateMapPath(project, totalDistance) {
    if (!this.map) return;

    const startLat = 50.9953;
    const startLng = 4.1277;

    // Verwijder bestaande paden
    this.map.eachLayer((layer) => {
        if (layer instanceof L.Polyline) {
            this.map.removeLayer(layer);
        }
    });

    // Haal wandelpaden op
    const paths = await getWalkingPaths(startLat, startLng);
    
    // Filter en verbind de paden
    let currentLat = startLat;
    let currentLng = startLng;
    let remainingDistance = totalDistance;
    let pathCoordinates = [[startLat, startLng]];

    // Sorteer paden op afstand tot het huidige punt
    const processedPaths = new Set();
    
    while (remainingDistance > 0 && paths.length > 0) {
        // Vind het meest oostelijke pad dat aansluit
        let bestPath = null;
        let bestDistance = Infinity;
        let bestStartIndex = 0;

        for (const path of paths) {
            if (processedPaths.has(path.id)) continue;
            
            if (path.type === 'way' && path.nodes) {
                const coordinates = path.nodes.map(nodeId => {
                    const node = paths.find(n => n.type === 'node' && n.id === nodeId);
                    return node ? [node.lat, node.lon] : null;
                }).filter(Boolean);

                if (coordinates.length < 2) continue;

                // Check afstand tot het huidige punt
                const startDist = L.latLng(currentLat, currentLng)
                    .distanceTo(L.latLng(coordinates[0][0], coordinates[0][1]));
                const endDist = L.latLng(currentLat, currentLng)
                    .distanceTo(L.latLng(coordinates[coordinates.length-1][0], coordinates[coordinates.length-1][1]));

                if (startDist < bestDistance && coordinates[coordinates.length-1][1] > currentLng) {
                    bestDistance = startDist;
                    bestPath = coordinates;
                    bestStartIndex = 0;
                }
                if (endDist < bestDistance && coordinates[0][1] > currentLng) {
                    bestDistance = endDist;
                    bestPath = coordinates.slice().reverse();
                    bestStartIndex = 0;
                }
            }
        }

        if (bestPath) {
            // Voeg pad toe aan onze route
            pathCoordinates.push(...bestPath.slice(bestStartIndex));
            
            // Update huidige positie
            const lastPoint = bestPath[bestPath.length - 1];
            currentLat = lastPoint[0];
            currentLng = lastPoint[1];

            // Update resterende afstand
            const pathLength = L.polyline(bestPath).getLatLngs()
                .reduce((acc, curr, idx, arr) => {
                    if (idx === 0) return acc;
                    return acc + curr.distanceTo(arr[idx-1]);
                }, 0) / 1000; // Convert to km

            remainingDistance -= pathLength;
        } else {
            // Als geen pad gevonden, ga rechtdoor
            currentLng += remainingDistance / 111;
            pathCoordinates.push([currentLat, currentLng]);
            break;
        }
    }

    // Teken het pad
    const pathLine = L.polyline(pathCoordinates, {
        color: 'blue',
        weight: 3
    }).addTo(this.map);

    // Voeg eindpunt marker toe
    const lastPoint = pathCoordinates[pathCoordinates.length - 1];
    L.marker(lastPoint)
        .addTo(this.map)
        .bindPopup(`Huidige positie: ${totalDistance.toFixed(1)} km vanaf start`);

    // Pas kaartweergave aan
    this.map.fitBounds(pathLine.getBounds(), { padding: [50, 50] });
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
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }
}
