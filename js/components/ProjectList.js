import { subscribeToProjects } from '../lib/firebase.js';

const ProjectList = () => {
    // State setup using React hooks
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Effect voor het ophalen van projecten
    React.useEffect(() => {
        let unsubscribe = null;
        
        try {
            setLoading(true);
            
            // Subscribe to projects
            unsubscribe = subscribeToProjects((newProjects) => {
                console.log('Nieuwe projecten ontvangen:', newProjects); // Debug log
                setProjects(newProjects);
                setLoading(false);
            });
        } catch (err) {
            console.error('Error in ProjectList effect:', err);
            setError(err.message);
            setLoading(false);
        }

        // Cleanup subscription on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []); // Empty dependency array -> run once on mount

    // Debug logs
    console.log('ProjectList render state:', { loading, error, projectCount: projects.length });

    if (loading) {
        return React.createElement('div', { className: 'text-center p-4' }, 
            'Projecten laden...'
        );
    }

    if (error) {
        return React.createElement('div', { className: 'text-red-500 p-4' },
            `Error: ${error}`
        );
    }

    if (!projects || projects.length === 0) {
        return React.createElement('div', { className: 'text-center text-gray-500 p-8' },
            'Je hebt nog geen projecten. Maak een nieuw project aan om te beginnen!'
        );
    }

    // Render project list
    return React.createElement(
        'div',
        { className: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' },
        projects.map(project => {
            // Safely handle missing data
            const location = project.location || {};
            const createdAt = project.createdAt ? project.createdAt.toDate().toLocaleDateString() : 'Onbekende datum';
            
            return React.createElement(
                'div',
                { 
                    key: project.id || Math.random(),
                    className: 'bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow'
                },
                [
                    React.createElement(
                        'h3',
                        { className: 'text-lg font-semibold mb-2' },
                        project.name || 'Naamloos project'
                    ),
                    
                    React.createElement(
                        'p',
                        { className: 'text-gray-600 text-sm mb-2' },
                        `${location.street || ''} ${location.number || ''}, ${location.postalCode || ''} ${location.city || ''}`
                    ),
                    
                    project.description && React.createElement(
                        'p',
                        { className: 'text-gray-700 mb-4' },
                        project.description
                    ),
                    
                    React.createElement(
                        'div',
                        { className: 'text-sm text-gray-500' },
                        `Aangemaakt op: ${createdAt}`
                    )
                ]
            );
        })
    );
};

// Debug log wanneer component geladen wordt
console.log('ProjectList component loaded');

export default ProjectList;
