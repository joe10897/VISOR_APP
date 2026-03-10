/**
 * CryptoUtils.js - V.I.S.O.R. 加密工具
 * 用於保護 API Key 不以明文儲存
 */
const CryptoUtils = {
    // 系統內部使用的加密金鑰 (建議在發布前修改此字串)
    _SECRET: 'VISOR_MK_XXV_PROTOCOL_9527',
    
    _BUILTIN_KEYS: {
        // Obfuscated Keys (Reversed String)
        gemini: '4PNvaX6WGOAtGg9_1NMCDQnqcO142zGBDySazIA',
        deepseek: 'f8695beecb1cb84f6fada1dfaee2c05b90b3bba7fd5222c8509c7493defa0e92-1v-ro-ks'
    },

    getBuiltinKey: (provider) => {
        const key = CryptoUtils._BUILTIN_KEYS[provider];
        return key ? key.split('').reverse().join('') : '';
    },

    /**
     * 加密字串
     * @param {string} text 原始文字
     * @returns {string} 加密後的 Base64 字串
     */
    encrypt: (text) => {
        if (!text) return '';
        try {
            return CryptoJS.AES.encrypt(text, CryptoUtils._SECRET).toString();
        } catch (e) {
            console.error('Encryption failed:', e);
            return '';
        }
    },

    /**
     * 解密字串
     * @param {string} ciphertext 加密文字
     * @returns {string} 原始文字
     */
    decrypt: (ciphertext) => {
        if (!ciphertext) return '';
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, CryptoUtils._SECRET);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            console.error('Decryption failed:', e);
            return '';
        }
    },

    /**
     * 安全儲存 Key 到 localStorage
     */
    saveKey: (storageName, rawKey) => {
        const encrypted = CryptoUtils.encrypt(rawKey);
        localStorage.setItem(storageName, encrypted);
    },

    /**
     * 從 localStorage 讀取並解密 Key
     */
    loadKey: (storageName) => {
        const encrypted = localStorage.getItem(storageName);
        return CryptoUtils.decrypt(encrypted);
    }
};

// Export for tests and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoUtils;
} else {
    window.CryptoUtils = CryptoUtils;
}
