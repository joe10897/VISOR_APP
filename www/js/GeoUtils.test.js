const GeoUtils = require('../lib/js/GeoUtils');

describe('GeoUtils', () => {
    test('calculates distance between two points correctly', () => {
        // Taipei 101
        const lat1 = 25.033964;
        const lon1 = 121.564468;
        
        // Taipei City Hall (approx 450m away)
        const lat2 = 25.037525;
        const lon2 = 121.563782;

        const distance = GeoUtils.calculateDistance(lat1, lon1, lat2, lon2);
        
        // Expected distance is roughly 400-500 meters
        expect(distance).toBeGreaterThan(390);
        expect(distance).toBeLessThan(410);
    });

    test('returns 0 for same location', () => {
        const dist = GeoUtils.calculateDistance(25, 121, 25, 121);
        expect(dist).toBe(0);
    });
});
