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

    const renderedContent = React.useMemo(() => {
        if (loading) {
            return React.createElement('div', { className: 'text-center p-4' },
                'Projecten laden...'
            );
        }

        if (error) {
            return React.createElement('div', { className: 'text-red-500 p-4' },
                `Er is een fout opgetreden: ${error}`
            );
        }

        if (!projects || projects.length === 0) {
            return React.createElement('div', { className: 'text-center text-gray-500 p-8' },
                'Je hebt nog geen projecten. Maak een nieuw project aan om te beginnen!'
            );
        }

        return React.createElement(
            'div',
            { className: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' },
            projects.map(project => {
                try {
                    const location = project.location || {};
                    const createdAt = project.createdAt ? 
                        (typeof project.createdAt.toDate === 'function' ? 
                            project.createdAt.toDate().toLocaleDateString() : 
                            new Date(project.createdAt).toLocaleDateString())
                        : 'Onbekende datum';

                    return React.createElement(
                        'div',
                        {
                            key: project.id,
                            onClick: () => handleProjectClick(project.id),
                            className: 'bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50'
                        },
                        [
                            React.createElement('h3', 
                                { className: 'text-lg font-semibold mb-2 text-blue-600' },
                                project.name || 'Naamloos project'
                            ),
                            React.createElement('p',
                                { className: 'text-gray-600 text-sm mb-2' },
                                `${location.street || ''} ${location.number || ''}, ${location.postalCode || ''} ${location.city || ''}`
                            ),
                            project.description && React.createElement('p',
                                { className: 'text-gray-700 mb-4' },
                                project.description
                            ),
                            React.createElement('div',
                                { className: 'text-sm text-gray-500' },
                                `Aangemaakt op: ${createdAt}`
                            )
                        ]
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

