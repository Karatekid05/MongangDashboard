const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

export const endpoints = {
    health: `${API_URL}/health`,
    users: `${API_URL}/users`,
    gangs: `${API_URL}/gangs`,
    leaderboard: `${API_URL}/leaderboard`,
    gangsLeaderboard: `${API_URL}/gangs/leaderboard`,
};

export default API_URL; 