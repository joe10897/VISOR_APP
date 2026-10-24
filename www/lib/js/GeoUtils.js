const GeoUtils = {
    toRad: (value) => value * Math.PI / 180,

    // 1. 計算兩點間的球面距離 (公尺)
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
    },

    // 2. 計算由點1至點2的絕對方位角 (0°~360°，正北為0，順時針)
    calculateBearing: (lat1, lon1, lat2, lon2) => {
        const φ1 = GeoUtils.toRad(lat1);
        const φ2 = GeoUtils.toRad(lat2);
        const Δλ = GeoUtils.toRad(lon2 - lon1);

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.cos(φ1) * Math.sin(φ2) * Math.cos(Δλ);
        const θ = Math.atan2(y, x);
        return (θ * 180 / Math.PI + 360) % 360;
    },

    // 3. 計算兩個角度之間的最小絕對夾角 (0°~180°)
    normalizeAngleDiff: (angle1, angle2) => {
        if (angle1 === null || angle2 === null || isNaN(angle1) || isNaN(angle2)) return 0;
        return Math.abs((angle1 - angle2 + 180) % 360 - 180);
    },

    // 4. 方向吻合度判定 (支援雙向 ALL 與指定角度容許差，預設寬容度 75 度，未校準時全放行)
    isDirectionMatch: (riderHeading, camHeading, tolerance = 75) => {
        if (camHeading === 'ALL' || camHeading === null || camHeading === undefined) return true;
        if (riderHeading === null || isNaN(riderHeading) || riderHeading === 0) return true;
        const diff = GeoUtils.normalizeAngleDiff(riderHeading, Number(camHeading));
        return diff <= tolerance;
    },

    // 5. 判定目標點是否在騎士車輛的前方扇形視野內 (未校準航向時全放行，避免誤殺平面道路)
    isAhead: (riderLat, riderLng, riderHeading, camLat, camLng, maxAngle = 80) => {
        if (riderHeading === null || isNaN(riderHeading) || riderHeading === 0) return true;
        const bearing = GeoUtils.calculateBearing(riderLat, riderLng, camLat, camLng);
        const diff = GeoUtils.normalizeAngleDiff(riderHeading, bearing);
        return diff <= maxAngle;
    },

    // 6. 判定目標點是否已落在騎士車身後方 (已通過測速照相點)
    isBehind: (riderLat, riderLng, riderHeading, camLat, camLng, minAngle = 90) => {
        if (riderHeading === null || isNaN(riderHeading) || riderHeading === 0) return false;
        const bearing = GeoUtils.calculateBearing(riderLat, riderLng, camLat, camLng);
        const diff = GeoUtils.normalizeAngleDiff(riderHeading, bearing);
        return diff >= minAngle;
    },

    // 7. 橋上/橋下平面防誤觸智能過濾 (Bridge & Overpass Altitude/Speed Disambiguation)
    isBridgeMismatch: (speedKmh, camAddress, camLimit, riderHeading, camHeading) => {
        const addr = String(camAddress || '');
        // 嚴格比對專屬高架道路關鍵字，絕不誤傷「中正路」、「中山路」等一般市區道路
        const isElevated = /(?:市民|建國|新生|洲美|台64|台65|台68|國道)高架/.test(addr) || /高架橋段|快速道路高架/.test(addr);

        // 高架橋相機防誤觸：確認為高架專用相機且速限>=70，但騎士在市區慢速騎乘 (<45 km/h)
        if (isElevated && speedKmh < 45 && camLimit >= 70) {
            return true;
        }

        return false;
    }
};

// Export for module systems (tests) and browser global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeoUtils;
} else {
    window.GeoUtils = GeoUtils;
}
