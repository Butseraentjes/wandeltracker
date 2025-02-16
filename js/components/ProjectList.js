import { subscribeToProjects } from '../lib/firebase.js';

const ProjectList = () => {
    // State setup using React hooks
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Effect voor het ophalen van projecten
    React.useEffect(() => {
        setLoading(true);
        
        // Subscribe to projects
        const unsubscribe = subscribeToProjects((newProjects) => {
            setProjects(newProjects);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []); // Empty dependency array -> run once on mount

    if (loading) {
        return React.createElement('div', { className: 'text-center p-4' }, 'Projecten laden...');
    }

    if (error) {
        return React.createElement('div', { className: 'text-red-500 p-4' }, error);
    }

    if (projects.length === 0) {
        return React.createElement(
            'div',
            { className: 'text-center text-gray-500 p-8' },
            'Je hebt nog geen projecten. Maak een nieuw project aan om te beginnen!'
        );
    }

    // Render project list
    return React.createElement(
        'div',
        { className: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' },
        projects.map(project => 
            React.createElement(
                'div',
                { 
                    key: project.id,
                    className: 'bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow'
                },
                [
                    // Project Title
                    React.createElement(
                        'h3',
                        { className: 'text-lg font-semibold mb-2' },
                        project.name
                    ),
                    
                    // Project Location
                    React.createElement(
                        'p',
                        { className: 'text-gray-600 text-sm mb-2' },
                        `${project.location.street} ${project.location.number}, ${project.location.postalCode} ${project.location.city}`
                    ),
                    
                    // Project Description (if exists)
                    project.description && React.createElement(
                        'p',
                        { className: 'text-gray-700 mb-4' },
                        project.description
                    ),
                    
                    // Creation Date
                    React.createElement(
                        'div',
                        { className: 'text-sm text-gray-500' },
                        `Aangemaakt op: ${project.createdAt.toDate().toLocaleDateString()}`
                    )
                ]
            )
        )
    );
};

export default ProjectList;
