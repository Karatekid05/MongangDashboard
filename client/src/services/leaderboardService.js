import api from './api';

/**
 * Get leaderboard statistics
 * @returns {Promise<Object>} Leaderboard statistics
 */
export const getLeaderboardStats = async () => {
  try {
    const response = await api.get('/leaderboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    throw error;
  }
};

/**
 * Get gang leaderboard
 * @param {number} [limit=10] - Number of results to return
 * @returns {Promise<Array>} Gang leaderboard
 */
export const getGangLeaderboard = async (limit = 10) => {
  try {
    const response = await api.get('/leaderboard/gangs', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching gang leaderboard:', error);
    throw error;
  }
};

/**
 * Get weekly gang leaderboard
 * @param {number} [limit=10] - Number of results to return
 * @returns {Promise<Array>} Weekly gang leaderboard
 */
export const getWeeklyGangLeaderboard = async (limit = 10) => {
  try {
    const response = await api.get('/leaderboard/gangs/weekly', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly gang leaderboard:', error);
    throw error;
  }
};

/**
 * Get user leaderboard
 * @param {number} [page=1] - Page number
 * @param {number} [limit=20] - Results per page
 * @returns {Promise<Object>} User leaderboard with pagination
 */
export const getUserLeaderboard = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/leaderboard/users', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user leaderboard:', error);
    throw error;
  }
};

/**
 * Get weekly user leaderboard
 * @param {number} [page=1] - Page number
 * @param {number} [limit=20] - Results per page
 * @returns {Promise<Object>} Weekly user leaderboard with pagination
 */
export const getWeeklyUserLeaderboard = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/leaderboard/users/weekly', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly user leaderboard:', error);
    throw error;
  }
};

/**
 * Get gang ranking by ID
 * @param {string} gangId - Gang ID
 * @returns {Promise<Object>} Gang ranking
 */
export const getGangRanking = async (gangId) => {
  try {
    const response = await api.get(`/leaderboard/gangs/${gangId}/rank`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ranking for gang with ID ${gangId}:`, error);
    throw error;
  }
};

/**
 * Get user ranking by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User ranking
 */
export const getUserRanking = async (userId) => {
  try {
    const response = await api.get(`/leaderboard/users/${userId}/rank`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ranking for user with ID ${userId}:`, error);
    throw error;
  }
}; 