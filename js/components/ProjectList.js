import { subscribeToProjects } from '../lib/firebase.js';

const ProjectList = () => {
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

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

    const handleProjectClick = (projectId) => {
        window.history.pushState({}, '', `/project/${projectId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
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

        if (!projects || projects.length === 0) {
            return React.createElement('div', { className: 'no-projects-message' },
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
                        d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    })
                ),
                React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 
                    'Je hebt nog geen projecten'
                ),
                React.createElement('p', { className: 'mb-6 max-w-md mx-auto' }, 
                    'Maak een nieuw project aan om je wandelingen bij te houden en te zien waar je virtueel naartoe wandelt.'
                ),
                React.createElement('button', {
                    className: 'primary-btn mx-auto',
                    onClick: () => document.getElementById('new-project-btn').click()
                },
                    React.createElement('span', {}, 'Nieuw project maken'),
                    React.createElement('svg', {
                        xmlns: 'http://www.w3.org/2000/svg',
                        className: 'w-5 h-5',
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
            );
        }

        return React.createElement(
            'div',
            { className: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' },
            projects.map((project, index) => {
                try {
                    const location = project.location || {};
                    const createdAt = project.createdAt ? formatDate(project.createdAt) : 'Onbekende datum';
                    
                    // Bepaal animation delay op basis van index
                    const delayClass = `delay-${Math.min((index % 5) * 100, 500)}`;

                    return React.createElement(
                        'div',
                        {
                            key: project.id || Math.random(),
                            onClick: () => handleProjectClick(project.id),
                            className: `project-card animate-slide-in ${delayClass}`
                        },
                        // Badge element voor nieuwe projecten (voorbeeld: als project minder dan 7 dagen oud is)
                        project.createdAt && typeof project.createdAt.toDate === 'function' && 
                        (new Date() - project.createdAt.toDate()) / (1000 * 60 * 60 * 24) < 7 ?
                            React.createElement('span', { 
                                className: 'badge'
                            }, 'Nieuw') : null,
                            
                        // Project titel
                        React.createElement('h3', { 
                            className: 'text-lg font-semibold mb-2 text-primary'
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
                    );
                } catch (err) {
                    console.error('Error rendering project:', err, project);
                    return null;
                }
            }).filter(Boolean)
        );
    }, [loading, error, projects]);

    return renderedContent;
};

export default ProjectList;
