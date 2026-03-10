// AuthService.js
const AuthService = {
    init: () => {
        // 預建管理員帳號
        if (!localStorage.getItem('visor_users')) {
            AuthService.register('admin', 'admin');
            console.log("V.I.S.O.R. Admin account initialized: admin/admin");
        }
    },

    register: (username, password) => {
        const users = JSON.parse(localStorage.getItem('visor_users') || '{}');
        
        if (users[username]) {
            return null; // User already exists
        }

        const newUser = {
            id: 'user_' + Date.now(),
            username: username,
            passwordHash: btoa(password), // Simple base64 encoding for MVP (NOT secure for production)
            settings: {}
        };

        users[username] = newUser;
        localStorage.setItem('visor_users', JSON.stringify(users));
        return newUser;
    },

    login: (username, password) => {
        const users = JSON.parse(localStorage.getItem('visor_users') || '{}');
        const user = users[username];

        if (user && user.passwordHash === btoa(password)) {
            const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2);
            localStorage.setItem('visor_auth_token', token);
            localStorage.setItem('visor_current_user', JSON.stringify(user));
            return { token, user };
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem('visor_auth_token');
        localStorage.removeItem('visor_current_user');
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('visor_auth_token');
        if (!token) return null;
        return JSON.parse(localStorage.getItem('visor_current_user'));
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('visor_auth_token');
    }
};

// Export for module systems (tests) and browser global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
} else {
    window.AuthService = AuthService;
}
