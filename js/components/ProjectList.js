import { subscribeToProjects } from '../lib/firebase.js';

console.log('ProjectList module loading...'); // Debug log

const ProjectList = () => {
    console.log('ProjectList component initializing...'); // Debug log
    
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        console.log('ProjectList useEffect running...'); // Debug log
        let unsubscribe = null;

        try {
            unsubscribe = subscribeToProjects((newProjects) => {
                console.log('Received projects:', newProjects); // Debug log
                setProjects(newProjects);
                setLoading(false);
            });
        } catch (err) {
            console.error('Error in subscribeToProjects:', err);
            setError(err.message);
            setLoading(false);
        }

        return () => {
            console.log('ProjectList cleanup running...'); // Debug log
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    console.log('ProjectList rendering with state:', { loading, error, projectCount: projects?.length }); // Debug log

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
            const location = project.location || {};
            const createdAt = project.createdAt ? 
                (typeof project.createdAt.toDate === 'function' ? 
                    project.createdAt.toDate().toLocaleDateString() : 
                    'Ongeldige datum') 
                : 'Onbekende datum';

            return React.createElement(
                'div',
                {
                    key: project.id || Math.random(),
                    className: 'bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow'
                },
                [
                    React.createElement('h3', 
                        { className: 'text-lg font-semibold mb-2' },
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
        })
    );
};

console.log('ProjectList module loaded'); // Debug log

export default ProjectList;
