import api from './api';

/**
 * Authenticate user with credentials
 * @param {Object} credentials - User credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Authentication response with token and user info
 */
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);

        // Store token and user in localStorage
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

/**
 * Logout the current user
 * @returns {void}
 */
export const logout = () => {
    // Remove authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

/**
 * Get the current authenticated user from localStorage
 * @returns {Object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error during registration:', error);
        throw error;
    }
};

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Response data
 */
export const changePassword = async (passwordData) => {
    try {
        const response = await api.post('/auth/change-password', passwordData);
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

/**
 * Request password reset
 * @param {Object} data - Password reset request data
 * @param {string} data.email - User email
 * @returns {Promise<Object>} Response data
 */
export const requestPasswordReset = async (data) => {
    try {
        const response = await api.post('/auth/reset-password-request', data);
        return response.data;
    } catch (error) {
        console.error('Error requesting password reset:', error);
        throw error;
    }
};

/**
 * Reset password with token
 * @param {Object} data - Password reset data
 * @param {string} data.token - Reset token
 * @param {string} data.newPassword - New password
 * @returns {Promise<Object>} Response data
 */
export const resetPassword = async (data) => {
    try {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
}; 