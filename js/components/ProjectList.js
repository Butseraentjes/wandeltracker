import { subscribeToProjects } from '../lib/firebase.js';

const ProjectList = () => {
    console.log('ProjectList component initializing...');
    
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
            console.log('ProjectList cleanup running...');
            mounted = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    // Voorkom re-renders als de state niet verandert
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
                const createdAt = // ... (je bestaande code)

                return React.createElement(
                    'div',
                    {
                        key: project.id || Math.random(),
                        onClick: () => handleProjectClick(project.id),
                        className: 'bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-orange-500'
                    },
                    [
                        React.createElement('h3', 
                            { 
                                key: 'title',
                                className: 'text-xl font-semibold mb-3 text-orange-600' 
                            },
                            project.name || 'Naamloos project'
                        ),
                        // Rest van je projectkaart elementen
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
