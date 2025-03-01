// Timeline.js - Component voor een sociale tijdlijn
import { subscribeToActivities, createActivity } from '../lib/activities.js';

const Timeline = () => {
    const [activities, setActivities] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [newActivity, setNewActivity] = React.useState('');

    React.useEffect(() => {
        console.log('Timeline component mounting...');
        let mounted = true;
        let unsubscribe = null;

        const setupSubscription = async () => {
            try {
                unsubscribe = subscribeToActivities((newActivities) => {
                    console.log('Received activities:', newActivities);
                    if (mounted) {
                        setActivities(newActivities || []);
                        setLoading(false);
                    }
                });
            } catch (err) {
                console.error('Error in subscribeToActivities:', err);
                if (mounted) {
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

    const handlePostActivity = async (e) => {
        e.preventDefault();
        if (!newActivity.trim()) return;

        try {
            await createActivity({
                content: newActivity,
                type: 'post'
            });
            setNewActivity('');
        } catch (error) {
            console.error('Error posting activity:', error);
            alert('Er is een fout opgetreden bij het plaatsen van je bericht.');
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        
        const now = new Date();
        const activityDate = date instanceof Date ? date : date.toDate();
        const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Zojuist';
        if (diffInMinutes < 60) return `${diffInMinutes} minuten geleden`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} uur geleden`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} dagen geleden`;
        
        return activityDate.toLocaleDateString('nl-NL', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const getActivityIcon = (type) => {
        switch(type) {
            case 'walk':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                );
            case 'project':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                );
            case 'post':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="timeline">
            {/* Post formulier */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                <form onSubmit={handlePostActivity} className="flex flex-col">
                    <textarea 
                        className="border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Deel je wandelavontuur..."
                        rows="3"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                    ></textarea>
                    <button 
                        type="submit" 
                        className="primary-btn self-end"
                        disabled={!newActivity.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Plaatsen
                    </button>
                </form>
            </div>

            {/* Activiteiten lijst */}
            {activities.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    <h3 className="text-lg font-semibold mb-2">Geen activiteiten</h3>
                    <p className="text-gray-600">Er zijn nog geen activiteiten om te tonen. Deel je eerste wandelavontuur!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="bg-white p-4 rounded-xl shadow-md">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                    {activity.userPhotoUrl ? (
                                        <img 
                                            src={activity.userPhotoUrl} 
                                            alt={activity.userName || 'Gebruiker'} 
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                                            {(activity.userName || 'A').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold">{activity.userName || 'Anonieme gebruiker'}</h4>
                                        <span className="text-xs text-gray-500">{formatDate(activity.createdAt)}</span>
                                    </div>
                                    
                                    <div className="flex items-start mb-2">
                                        <div className="mr-2 mt-1">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <p className="text-gray-800">{activity.content}</p>
                                    </div>
                                    
                                    {activity.imageUrl && (
                                        <div className="mt-3 rounded-lg overflow-hidden">
                                            <img 
                                                src={activity.imageUrl} 
                                                alt="Activiteit afbeelding" 
                                                className="w-full h-auto"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="flex mt-3 pt-3 border-t border-gray-100">
                                        <button className="flex items-center text-gray-600 hover:text-orange-500 mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                            </svg>
                                            Leuk
                                        </button>
                                        <button className="flex items-center text-gray-600 hover:text-orange-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            Reageren
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Timeline;
