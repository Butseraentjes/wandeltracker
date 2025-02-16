// js/services/geocoding.js

import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

class GeocodingService {
    constructor() {
        this.db = getFirestore();
        this.cache = new Map();
        this.lastRequestTime = 0;
    }

    async getCoordinates(address) {
        // Check cache first
        const cacheKey = this._createCacheKey(address);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Check Firestore cache
        const cachedCoords = await this._checkFirestoreCache(cacheKey);
        if (cachedCoords) {
            this.cache.set(cacheKey, cachedCoords);
            return cachedCoords;
        }

        // Respect rate limiting (1 request per second)
        await this._respectRateLimit();

        // Make API request
        const coords = await this._fetchFromNominatim(address);
        
        // Save to caches
        await this._saveToFirestore(cacheKey, coords);
        this.cache.set(cacheKey, coords);

        return coords;
    }

    _createCacheKey(address) {
        return Object.values(address)
            .map(val => val.toLowerCase().trim())
            .join('|');
    }

    async _checkFirestoreCache(cacheKey) {
        const docRef = doc(this.db, 'geocoding_cache', cacheKey);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    }

    async _saveToFirestore(cacheKey, coords) {
        const docRef = doc(this.db, 'geocoding_cache', cacheKey);
        await setDoc(docRef, coords);
    }

    async _respectRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < 1000) { // 1 second
            await new Promise(resolve => 
                setTimeout(resolve, 1000 - timeSinceLastRequest)
            );
        }
        this.lastRequestTime = Date.now();
    }

    async _fetchFromNominatim(address) {
        const query = this._formatAddressQuery(address);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );
        
        if (!response.ok) {
            throw new Error('Geocoding request failed');
        }

        const data = await response.json();
        if (data.length === 0) {
            throw new Error('Adres niet gevonden');
        }

        return {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
            timestamp: Date.now()
        };
    }

    _formatAddressQuery(address) {
        const { street, houseNumber, postalCode, city, country } = address;
        return encodeURIComponent(
            `${street} ${houseNumber}, ${postalCode} ${city}, ${country}`
        );
    }
}

export const geocodingService = new GeocodingService();
