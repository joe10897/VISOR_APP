const AuthService = require('../lib/js/AuthService');

describe('AuthService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should register a new user', () => {
        const user = AuthService.register('testuser', 'password123');
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username', 'testuser');
        expect(user).toHaveProperty('passwordHash');
        expect(user.settings).toEqual({});
    });

    test('should not register existing user', () => {
        AuthService.register('testuser', 'password123');
        const user = AuthService.register('testuser', 'password456');
        expect(user).toBeNull();
    });

    test('should login successfully with correct credentials', () => {
        AuthService.register('testuser', 'password123');
        const session = AuthService.login('testuser', 'password123');
        expect(session).toHaveProperty('token');
        expect(session.user).toHaveProperty('username', 'testuser');
    });

    test('should fail login with incorrect credentials', () => {
        AuthService.register('testuser', 'password123');
        const session = AuthService.login('testuser', 'wrongpassword');
        expect(session).toBeNull();
    });

    test('should logout successfully', () => {
        AuthService.register('testuser', 'password123');
        AuthService.login('testuser', 'password123');
        AuthService.logout();
        expect(localStorage.getItem('visor_auth_token')).toBeNull();
    });

    test('should get current user', () => {
        AuthService.register('testuser', 'password123');
        AuthService.login('testuser', 'password123');
        const user = AuthService.getCurrentUser();
        expect(user).toHaveProperty('username', 'testuser');
    });
});