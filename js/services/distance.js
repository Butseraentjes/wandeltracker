// js/services/distance.js

export class DistanceService {
    constructor() {
        this.EARTH_RADIUS = 6371; // Kilometers
    }

    /**
     * Berekent de afstand tussen twee punten op aarde
     * @param {Object} point1 - { latitude: number, longitude: number }
     * @param {Object} point2 - { latitude: number, longitude: number }
     * @returns {number} Afstand in kilometers
     */
    calculateDistance(point1, point2) {
        const dLat = this._toRad(point2.latitude - point1.latitude);
        const dLon = this._toRad(point2.longitude - point1.longitude);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this._toRad(point1.latitude)) * 
                Math.cos(this._toRad(point2.latitude)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return this.EARTH_RADIUS * c;
    }

    /**
     * Berekent het totale traject van meerdere punten
     * @param {Array<Object>} points - Array van { latitude: number, longitude: number }
     * @returns {number} Totale afstand in kilometers
     */
    calculateTotalDistance(points) {
        let totalDistance = 0;
        
        for (let i = 0; i < points.length - 1; i++) {
            totalDistance += this.calculateDistance(points[i], points[i + 1]);
        }
        
        return totalDistance;
    }

    /**
     * Formatteert een afstand naar een leesbaar formaat
     * @param {number} distance - Afstand in kilometers
     * @returns {string} Geformatteerde afstand
     */
    formatDistance(distance) {
        if (distance < 1) {
            return `${Math.round(distance * 1000)} m`;
        }
        return `${distance.toFixed(1)} km`;
    }

    _toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
}

export const distanceService = new DistanceService();
