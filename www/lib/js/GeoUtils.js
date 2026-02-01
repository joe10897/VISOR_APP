const GeoUtils = {
    toRad: (value) => value * Math.PI / 180,

    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = GeoUtils.toRad(lat1);
        const φ2 = GeoUtils.toRad(lat2);
        const Δφ = GeoUtils.toRad(lat2 - lat1);
        const Δλ = GeoUtils.toRad(lon2 - lon1);

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
};

// Export for module systems (tests) and browser global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeoUtils;
} else {
    window.GeoUtils = GeoUtils;
}
