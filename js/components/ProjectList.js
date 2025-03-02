import { subscribeToProjects, toggleProjectArchiveStatus } from '../lib/firebase.js';

const ProjectList = () => {
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [showArchived, setShowArchived] = React.useState(false);

    React.useEffect(() => {
        console.log('ProjectList useEffect running...');
        let mounted = true;
        let unsubscribe = null;

        const setupSubscription = async () => {
            try {
                unsubscribe = subscribeToProjects((newProjects) => {
                    console.log('Received projects:', newProjects);
                    if (mounted) {
                        setProjects(newProjects || []);
                        setLoading(false);
                        
                        // Bereken totalen en dispatch event
                        calculateTotals(newProjects);
                    }
                });
            } catch (err) {
                console.error('Error in subscribeToProjects:', err);
                if (mounted) {
                    setError(err.message || 'Er is een fout opgetreden bij het laden van de projecten');
                    setLoading(false);
                }
            }
        };

        setupSubscription();

        return () => {
            mounted = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);
    
    // Functie om totalen te berekenen
    const calculateTotals = (projectsData) => {
        let totalDistance = 0;
        let totalWalks = 0;
        
        // Voor elk project, haal wandelingen op en bereken afstanden
        projectsData.forEach(project => {
            if (project.totalDistance) {
                totalDistance += project.totalDistance;
            }
            if (project.walkCount) {
                totalWalks += project.walkCount;
            }
        });
        
        // Trigger event om applicatie te informeren over de nieuwe totalen
        window.dispatchEvent(new CustomEvent('projectsLoaded', { 
            detail: { 
                projects: projectsData,
                totalDistance,
                totalWalks,
                activeProjects: projectsData.filter(p => !p.archived).length
            } 
        }));
    };

    const handleProjectClick = (projectId) => {
        window.history.pushState({}, '', `/project/${projectId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };
    
    const handleArchiveToggle = async (e, projectId, currentStatus) => {
        e.stopPropagation(); // Voorkom navigatie naar project
        try {
            document.getElementById('loading-spinner').classList.remove('hidden');
            await toggleProjectArchiveStatus(projectId, !currentStatus);
            
            // Toon notificatie
            const action = currentStatus ? 'uit archief gehaald' : 'gearchiveerd';
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50';
            notification.innerHTML = `
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p>Project succesvol ${action}!</p>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Verwijder notificatie na 3 seconden
            setTimeout(() => {
                notification.classList.add('opacity-0');
                notification.style.transition = 'opacity 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        } catch (error) {
            console.error('Error toggling archive status:', error);
            alert('Er is een fout opgetreden bij het wijzigen van de archiefstatus.');
        } finally {
            document.getElementById('loading-spinner').classList.add('hidden');
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Onbekende datum';
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        if (typeof date.toDate === 'function') {
            return date.toDate().toLocaleDateString('nl-NL', options);
        } else {
            return new Date(date).toLocaleDateString('nl-NL', options);
        }
    };
    
    // Filter projecten op basis van archiefstatus
    const filteredProjects = projects.filter(project => showArchived === Boolean(project.archived));
    
    const renderedContent = React.useMemo(() => {
        if (loading) {
            return React.createElement('div', { className: 'flex justify-center items-center p-8' },
                React.createElement('div', { className: 'spinner' })
            );
        }

        if (error) {
            return React.createElement('div', { 
                className: 'bg-red-50 text-red-600 p-6 rounded-lg shadow text-center border border-red-200 mt-8'
            },
                React.createElement('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    className: 'w-12 h-12 mx-auto mb-4 text-red-500',
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    stroke: 'currentColor'
                },
                    React.createElement('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    })
                ),
                React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Er is een fout opgetreden'),
                React.createElement('p', {}, error)
            );
        }
        
        // Tab/filter controls for archived/active projects
        const filterControls = React.createElement('div', {
                className: 'mb-6 bg-white rounded-lg shadow p-2 flex'
            },
            React.createElement('button', {
                className: `flex-1 py-2 px-4 rounded-md transition ${!showArchived ? 'bg-orange-100 text-orange-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`,
                onClick: () => setShowArchived(false)
            }, 'Actieve Projecten'),
            React.createElement('button', {
                className: `flex-1 py-2 px-4 rounded-md transition ${showArchived ? 'bg-orange-100 text-orange-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`,
                onClick: () => setShowArchived(true)
            }, 'Archief')
        );

        if (!filteredProjects || filteredProjects.length === 0) {
            return React.createElement(React.Fragment, {},
                filterControls,
                React.createElement('div', { className: 'no-projects-message' },
                    React.createElement('svg', {
                        xmlns: 'http://www.w3.org/2000/svg',
                        className: 'w-16 h-16 mx-auto mb-4 text-gray-400',
                        fill: 'none',
                        viewBox: '0 0 24 24',
                        stroke: 'currentColor'
                    },
                        React.createElement('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: showArchived 
                                ? 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' 
                                : 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                        })
                    ),
                    React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 
                        showArchived ? 'Geen gearchiveerde projecten' : 'Je hebt nog geen projecten'
                    ),
                    React.createElement('p', { className: 'mb-6 max-w-md mx-auto' }, 
                        showArchived 
                            ? 'Projecten die je archiveert verschijnen hier.'
                            : 'Maak een nieuw project aan om je wandelingen bij te houden en te zien waar je virtueel naartoe wandelt.'
                    ),
                    !showArchived && React.createElement('button', {
                        className: 'primary-btn mx-auto',
                        onClick: () => document.getElementById('new-project-btn').click()
                    },
                        'Nieuw project maken',
                        React.createElement('svg', {
                            xmlns: 'http://www.w3.org/2000/svg',
                            className: 'w-5 h-5 ml-2',
                            fill: 'none',
                            viewBox: '0 0 24 24',
                            stroke: 'currentColor'
                        },
                            React.createElement('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: 2,
                                d: 'M12 4v16m8-8H4'
                            })
                        )
                    )
                )
            );
        }

        return React.createElement(React.Fragment, {},
            filterControls,
            React.createElement(
                'div',
                { className: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' },
                filteredProjects.map((project, index) => {
                    try {
                        const location = project.location || {};
                        const createdAt = project.createdAt ? formatDate(project.createdAt) : 'Onbekende datum';
                        
                        // Bepaal animation delay op basis van index
                        const delayClass = `delay-${Math.min((index % 5) * 100, 500)}`;

                        return React.createElement(
                            'div',
                            {
                                key: project.id || Math.random(),
                                className: `project-card animate-slide-in ${delayClass} relative`
                            },
                            // Archive/Unarchive button overlay
                            React.createElement('button', {
                                className: 'absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100 z-10',
                                onClick: (e) => handleArchiveToggle(e, project.id, project.archived),
                                title: project.archived ? 'Uit archief halen' : 'Archiveren'
                            },
                                React.createElement('svg', {
                                    xmlns: 'http://www.w3.org/2000/svg',
                                    className: 'h-5 w-5 text-gray-600',
                                    fill: 'none',
                                    viewBox: '0 0 24 24',
                                    stroke: 'currentColor'
                                },
                                    React.createElement('path', {
                                        strokeLinecap: 'round',
                                        strokeLinejoin: 'round',
                                        strokeWidth: 2,
                                        d: project.archived 
                                            ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' 
                                            : 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
                                    })
                                )
                            ),
                            
                            // Clickable project card content
                            React.createElement('div', {
                                className: 'cursor-pointer',
                                onClick: () => handleProjectClick(project.id)
                            }, [
                                // Badge element voor nieuwe projecten (voorbeeld: als project minder dan 7 dagen oud is)
                                project.createdAt && typeof project.createdAt.toDate === 'function' && 
                                (new Date() - project.createdAt.toDate()) / (1000 * 60 * 60 * 24) < 7 ?
                                    React.createElement('span', { 
                                        className: 'badge'
                                    }, 'Nieuw') : null,
                                    
                                // Project titel
                                React.createElement('h3', { 
                                    className: 'text-lg font-semibold mb-2 text-primary mr-8'
                                }, project.name || 'Naamloos project'),
                                
                                // Locatie met icoon
                                React.createElement('div', {
                                    className: 'location'
                                },
                                    React.createElement('svg', {
                                        xmlns: 'http://www.w3.org/2000/svg',
                                        className: 'location-icon w-4 h-4',
                                        fill: 'none',
                                        viewBox: '0 0 24 24',
                                        stroke: 'currentColor'
                                    },
                                        React.createElement('path', {
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round',
                                            strokeWidth: 2,
                                            d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                                        }),
                                        React.createElement('path', {
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round',
                                            strokeWidth: 2,
                                            d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                                        })
                                    ),
                                    React.createElement('span', {}, 
                                        `${location.street || ''} ${location.number || ''}, ${location.postalCode || ''} ${location.city || ''}`
                                    )
                                ),
                                
                                // Project beschrijving
                                project.description ? 
                                    React.createElement('p', {
                                        className: 'my-3 text-text-secondary'
                                    }, project.description) : null,
                                
                                // Statistieken weergeven
                                React.createElement('div', {
                                    className: 'grid grid-cols-2 gap-2 my-3'
                                }, [
                                    React.createElement('div', {
                                        className: 'bg-orange-50 p-2 rounded'
                                    }, [
                                        React.createElement('p', {
                                            className: 'text-xs text-gray-500'
                                        }, 'Afstand'),
                                        React.createElement('p', {
                                            className: 'font-semibold'
                                        }, `${project.totalDistance ? project.totalDistance.toFixed(1) : '0'} km`)
                                    ]),
                                    React.createElement('div', {
                                        className: 'bg-orange-50 p-2 rounded'
                                    }, [
                                        React.createElement('p', {
                                            className: 'text-xs text-gray-500'
                                        }, 'Wandelingen'),
                                        React.createElement('p', {
                                            className: 'font-semibold'
                                        }, project.walkCount || '0')
                                    ])
                                ]),
                                
                                // Datum met icoon
                                React.createElement('div', {
                                    className: 'date mt-auto pt-2 border-t border-gray-100'
                                },
                                    React.createElement('svg', {
                                        xmlns: 'http://www.w3.org/2000/svg',
                                        className: 'w-4 h-4',
                                        fill: 'none',
                                        viewBox: '0 0 24 24',
                                        stroke: 'currentColor'
                                    },
                                        React.createElement('path', {
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round',
                                            strokeWidth: 2,
                                            d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                        })
                                    ),
                                    React.createElement('span', {}, `Aangemaakt op: ${createdAt}`)
                                )
                            ])
                        );
                    } catch (err) {
                        console.error('Error rendering project:', err, project);
                        return null;
                    }
                }).filter(Boolean)
            )
        );
    }, [loading, error, filteredProjects, showArchived]);

    return renderedContent;
};

export default ProjectList;
