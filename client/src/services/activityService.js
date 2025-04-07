import api from './api';

/**
 * Helper function to ensure timestamps are properly formatted
 * @param {Array} activities - Array of activity objects
 * @returns {Array} Array with normalized timestamps
 */
const normalizeActivityDates = (activities) => {
    if (!Array.isArray(activities)) {
        console.error('Expected activities to be an array, got:', typeof activities);
        return [];
    }

    return activities.map(activity => {
        if (!activity) return activity;

        try {
            // Create a new object to avoid mutating the original
            const normalizedActivity = { ...activity };
            return normalizedActivity;
        } catch (error) {
            console.error('Error normalizing activity:', error);
            return activity;
        }
    });
};

/**
 * Get activities with filtering options
 * @param {Object} options - Filter options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Results per page
 * @param {string} [options.searchTerm] - Search term
 * @param {string} [options.type] - Activity type (award, activity, games, gangActivity, other)
 * @param {string} [options.sortOrder='desc'] - Sort order
 * @returns {Promise<Object>} Activities with pagination
 */
export const getActivities = async (options = {}) => {
    const {
        page = 1,
        limit = 20,
        searchTerm,
        type,
        sortOrder = 'desc'
    } = options;

    try {
        console.log('Fetching activities with options:', options);

        const response = await api.get('/activity', {
            params: {
                page,
                limit,
                search: searchTerm,
                source: type, // Backend expects 'source' for activity type
                sort: 'createdAt',
                order: sortOrder
            }
        });

        console.log('Received activities response:', response.data);

        // Return empty data if response is invalid
        if (!response.data || !response.data.activities) {
            return {
                activities: [],
                totalCount: 0
            };
        }

        // Map backend data to frontend format
        const activities = response.data.activities.map(activity => ({
            id: activity.id || activity._id,
            type: activity.source || activity.type || 'other',  // Use source first, then fallback to type
            points: activity.points || 0,
            message: activity.message || '',
            user: {
                id: activity.targetId || activity.user?.id || activity.user?.discordId,
                name: activity.targetName || activity.user?.username || 'Unknown User'
            },
            currentGangId: activity.currentGangId || activity.gangId,
            currentGangName: activity.currentGangName || activity.gangName,
            createdAt: activity.createdAt,
            awardedBy: activity.awardedBy ? {
                id: activity.awardedBy.id || activity.awardedBy.discordId,
                name: activity.awardedBy.username
            } : null
        }));

        return {
            activities,
            totalCount: response.data.totalActivities || activities.length
        };
    } catch (error) {
        console.error('Error fetching activities:', error);
        return {
            activities: [],
            totalCount: 0
        };
    }
};

/**
 * Get recent activities
 * @param {number} [limit=5] - Number of activities to retrieve
 * @returns {Promise<Array>} Recent activities
 */
export const getRecentActivities = async (limit = 5) => {
    try {
        const response = await api.get('/activity/recent', {
            params: { limit }
        });

        // Normalize data before returning
        const normalizedData = { ...response.data };
        if (normalizedData.activities) {
            normalizedData.activities = normalizeActivityDates(normalizedData.activities);
        }
        return normalizedData;
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        throw error;
    }
};

/**
 * Get activity by ID
 * @param {string} activityId - Activity ID
 * @returns {Promise<Object>} Activity data
 */
export const getActivityById = async (activityId) => {
    try {
        const response = await api.get(`/activity/${activityId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching activity with ID ${activityId}:`, error);
        throw error;
    }
};

/**
 * Log a new activity
 * @param {Object} activityData - Activity data to log
 * @returns {Promise<Object>} Created activity
 */
export const logActivity = async (activityData) => {
    try {
        const response = await api.post('/activity', activityData);
        return response.data;
    } catch (error) {
        console.error('Error logging activity:', error);
        throw error;
    }
};

// Service to interact with activity-related API endpoints
const activityService = {
    // Get all activity with pagination
    getActivity: async (page = 1, limit = 50) => {
        try {
            const response = await api.get('/activity', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching activity:', error);
            throw error;
        }
    },

    // Get activity statistics
    getActivityStats: async () => {
        try {
            const response = await api.get('/activity/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching activity stats:', error);
            throw error;
        }
    },

    // Get activity leaderboard (most active users/gangs)
    getActivityLeaderboard: async () => {
        try {
            const response = await api.get('/activity/leaderboard');
            return response.data;
        } catch (error) {
            console.error('Error fetching activity leaderboard:', error);
            throw error;
        }
    },
};

export default activityService; 