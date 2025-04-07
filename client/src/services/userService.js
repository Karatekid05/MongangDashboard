import api from './api';

/**
 * Get all users with optional filtering
 * @param {Object} options - Filter options
 * @param {string} [options.searchTerm] - Search term for username
 * @param {string} [options.sortBy] - Field to sort by
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=10] - Number of results per page
 * @param {string} [options.gangId] - Filter by gang ID
 * @returns {Promise<Object>} Result object with users and pagination info
 */
export const getUsers = async (options = {}) => {
  const { searchTerm, sortBy, page = 1, limit = 10, gangId } = options;

  try {
    console.log('Fetching users from API with params:', {
      searchTerm,
      sort: sortBy,
      page,
      limit,
      gangId
    });

    const response = await api.get('/users', {
      params: {
        searchTerm,
        sort: sortBy,
        page,
        limit,
        gangId
      }
    });

    console.log('API response for users:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get a user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Get user activity
 * @param {string} userId - User ID
 * @param {Object} options - Filter options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Results per page
 * @returns {Promise<Object>} Activity data with pagination
 */
export const getUserActivity = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;

  try {
    const response = await api.get(`/users/${userId}/activity`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching activity for user with ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Get user gang history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Gang history
 */
export const getUserGangHistory = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/gangHistory`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching gang history for user with ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
export const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching statistics for user with ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Update a user
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
}; 