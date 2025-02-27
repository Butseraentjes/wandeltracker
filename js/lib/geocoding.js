// js/lib/geocoding.js
export async function geocodeAddress(address) {
    try {
        // We gebruiken OpenStreetMap Nominatim voor geocoding
        const query = encodeURIComponent(
            `${address.street} ${address.number}, ${address.postalCode} ${address.city}, ${address.country || 'Belgium'}`
        );
        
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
        
        console.log('Requesting geocoding for:', query);
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'WandelTracker/1.0'  // Nominatim vereist een User-Agent
            }
        });
        
        if (!response.ok) {
            throw new Error(`Geocoding error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Geocoding response:', data);
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        }
        
        throw new Error('Geen locatie gevonden voor dit adres');
    } catch (error) {
        console.error('Error geocoding address:', error);
        // Fallback voor België
        return {
            lat: 50.8503,  // Default: Brussel
            lng: 4.3517,
            displayName: 'Locatie niet gevonden - standaardlocatie gebruikt'
        };
    }
}
