// routes.js
import { db, auth } from './firebase.js';

// Routes opslaan
export async function saveRoute(projectId, routeData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        // Controleer of het maximum aantal routes (3) is bereikt
        const routesSnapshot = await db.collection("projects").doc(projectId)
            .collection("routes").get();
        
        if (routesSnapshot.size >= 3 && !routeData.id) {
            throw new Error("Maximum aantal routes (3) bereikt");
        }

        let routeRef;
        
        // Update bestaande route of maak nieuwe aan
        if (routeData.id) {
            routeRef = db.collection("projects").doc(projectId)
                .collection("routes").doc(routeData.id);
            
            await routeRef.update({
                ...routeData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            routeRef = db.collection("projects").doc(projectId)
                .collection("routes").doc();
            
            await routeRef.set({
                ...routeData,
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        return routeRef.id;
    } catch (error) {
        console.error("Error saving route:", error);
        throw error;
    }
}

// Routes ophalen
export function subscribeToRoutes(projectId, callback) {
    console.log('Setting up routes subscription for project:', projectId);
    const user = auth.currentUser;
    if (!user) return null;

    return db.collection("projects").doc(projectId).collection("routes")
        .onSnapshot((snapshot) => {
            const routes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Routes data received:', routes);
            callback(routes);
        }, (error) => {
            console.error('Error fetching routes:', error);
            callback([]);
        });
}

// Route verwijderen
export async function deleteRoute(projectId, routeId) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        await db.collection("projects").doc(projectId)
            .collection("routes").doc(routeId).delete();

        return true;
    } catch (error) {
        console.error("Error deleting route:", error);
        throw error;
    }
}

// In routes.js, toevoegen aan het einde
export async function saveRouteWithGeocode(projectId, routeData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        // Controleer of het maximum aantal routes (3) is bereikt
        const routesSnapshot = await db.collection("projects").doc(projectId)
            .collection("routes").get();
        
        if (routesSnapshot.size >= 3 && !routeData.id) {
            throw new Error("Maximum aantal routes (3) bereikt");
        }

        // Geocode de bestemmingslocatie
        let destinationCoordinates;
        try {
            const { geocodeAddress } = await import('./geocoding.js');
            const destinationAddress = {
                street: routeData.destStreet || '',
                number: routeData.destNumber || '',
                postalCode: routeData.destPostalCode || '',
                city: routeData.destCity,
                country: routeData.destCountry
            };
            destinationCoordinates = await geocodeAddress(destinationAddress);
        } catch (error) {
            console.error("Geocoding error:", error);
            // Fallback coördinaten
            destinationCoordinates = {
                lat: 51.2194, // Default: Antwerpen
                lng: 4.4025,
                displayName: 'Locatie niet gevonden - standaardlocatie gebruikt'
            };
        }

        // Opslag van route met coördinaten
        const routeDataWithCoords = {
            ...routeData,
            destination: {
                street: routeData.destStreet || '',
                number: routeData.destNumber || '',
                postalCode: routeData.destPostalCode || '',
                city: routeData.destCity,
                country: routeData.destCountry,
                coordinates: destinationCoordinates
            }
        };

        // Haal velden eruit die niet direct opgeslagen moeten worden
        delete routeDataWithCoords.destStreet;
        delete routeDataWithCoords.destNumber;
        delete routeDataWithCoords.destPostalCode;
        delete routeDataWithCoords.destCity;
        delete routeDataWithCoords.destCountry;

        let routeRef;
        
        // Update bestaande route of maak nieuwe aan
        if (routeDataWithCoords.id) {
            routeRef = db.collection("projects").doc(projectId)
                .collection("routes").doc(routeDataWithCoords.id);
            
            await routeRef.update({
                ...routeDataWithCoords,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            routeRef = db.collection("projects").doc(projectId)
                .collection("routes").doc();
            
            await routeRef.set({
                ...routeDataWithCoords,
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                waypoints: [] // Array voor dagelijkse wandelingen/waypoints
            });
        }

        return routeRef.id;
    } catch (error) {
        console.error("Error saving route:", error);
        throw error;
    }
}


// In routes.js, toevoegen aan het einde
export async function saveRouteWithGeocode(projectId, routeData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        // Controleer of het maximum aantal routes (3) is bereikt
        const routesSnapshot = await db.collection("projects").doc(projectId)
            .collection("routes").get();
        
        if (routesSnapshot.size >= 3 && !routeData.id) {
            throw new Error("Maximum aantal routes (3) bereikt");
        }

        // Geocode de bestemmingslocatie
        let destinationCoordinates;
        try {
            const { geocodeAddress } = await import('./geocoding.js');
            const destinationAddress = {
                street: routeData.destStreet || '',
                number: routeData.destNumber || '',
                postalCode: routeData.destPostalCode || '',
                city: routeData.destCity,
                country: routeData.destCountry
            };
            destinationCoordinates = await geocodeAddress(destinationAddress);
        } catch (error) {
            console.error("Geocoding error:", error);
            // Fallback coördinaten
            destinationCoordinates = {
                lat: 51.2194, // Default: Antwerpen
                lng: 4.4025,
                displayName: 'Locatie niet gevonden - standaardlocatie gebruikt'
            };
        }

        // Opslag van route met coördinaten
        const routeDataWithCoords = {
            ...routeData,
            destination: {
                street: routeData.destStreet || '',
                number: routeData.destNumber || '',
                postalCode: routeData.destPostalCode || '',
                city: routeData.destCity,
                country: routeData.destCountry,
                coordinates: destinationCoordinates
            }
        };

        // Haal velden eruit die niet direct opgeslagen moeten worden
        delete routeDataWithCoords.destStreet;
        delete routeDataWithCoords.destNumber;
        delete routeDataWithCoords.destPostalCode;
        delete routeDataWithCoords.destCity;
        delete routeDataWithCoords.destCountry;

        let routeRef;
        
        // Update bestaande route of maak nieuwe aan
        if (routeDataWithCoords.id) {
            routeRef = db.collection("projects").doc(projectId)
                .collection("routes").doc(routeDataWithCoords.id);
            
            await routeRef.update({
                ...routeDataWithCoords,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            routeRef = db.collection("projects").doc(projectId)
                .collection("routes").doc();
            
            await routeRef.set({
                ...routeDataWithCoords,
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                waypoints: [] // Array voor dagelijkse wandelingen/waypoints
            });
        }

        return routeRef.id;
    } catch (error) {
        console.error("Error saving route:", error);
        throw error;
    }
}
