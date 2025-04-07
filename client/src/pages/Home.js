import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Container,
    Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MessageIcon from '@mui/icons-material/Message';
import axios from 'axios';

import StatCard from '../components/common/StatCard';
import ActivityList from '../components/activity/ActivityList.simple';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

import { leaderboardService } from '../services';
import { getActivities } from '../services/activityService';

const Home = () => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [serverStatus, setServerStatus] = useState({
        status: 'unknown',
        botEnabled: false
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, activityData] = await Promise.all([
                    leaderboardService.getLeaderboardStats(),
                    getActivities({ page: 1, limit: 10 })
                ]);

                console.log('Raw activity data:', JSON.stringify(activityData.activities[0], null, 2));

                // Format activities to match ActivityList.simple format
                const formattedActivities = activityData.activities.map(activity => ({
                    id: activity._id || activity.id,
                    type: activity.source || activity.type || 'other',
                    source: activity.source,
                    points: activity.points || 0,
                    message: activity.message || `${activity.points > 0 ? 'Awarded' : 'Deducted'} ${Math.abs(activity.points)} points`,
                    createdAt: activity.createdAt || activity.timestamp,
                    user: {
                        id: activity.targetId || (activity.user?.id || null),
                        name: activity.targetName || (activity.user?.name || 'Unknown User')
                    }
                }));

                setStats(statsData);
                setActivities(formattedActivities);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/health`);
                setServerStatus(response.data);
            } catch (error) {
                console.error('Error checking server status:', error);
                setServerStatus({
                    status: 'error',
                    message: 'Could not connect to server',
                    botEnabled: false
                });
            }
        };

        checkServerStatus();
    }, []);

    if (loading) {
        return <LoadingState fullPage />;
    }

    if (error) {
        return <ErrorState message={error} retry={() => window.location.reload()} />;
    }

    return (
        <Box sx={{ pl: 3, pr: 3 }}>
            <Box sx={{ mb: 5 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Mongang Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    View stats, leaderboards and information about the gangs
                </Typography>
            </Box>

            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={<PeopleAltIcon />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Gangs"
                        value={stats?.totalGangs || 0}
                        icon={<GroupsIcon />}
                        color="secondary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Points"
                        value={stats?.totalPoints || 0}
                        icon={<EmojiEventsIcon />}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Users"
                        value={stats?.activeUsers || 0}
                        icon={<MessageIcon />}
                        color="info.main"
                    />
                </Grid>
            </Grid>

            {/* Top Performers */}
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Top Performers
            </Typography>

            <Grid container spacing={4} sx={{ mb: 5 }}>
                {/* Top Gang */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Top Gang
                            </Typography>

                            {stats?.topGang ? (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        {stats.topGang.icon && (
                                            <Box
                                                component="img"
                                                src={stats.topGang.icon}
                                                alt={stats.topGang.name}
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: '50%',
                                                    mr: 2
                                                }}
                                            />
                                        )}
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold">
                                                {stats.topGang.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {stats.topGang.totalMemberPoints} points
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        component={Link}
                                        to={`/gangs/${stats.topGang.id}`}
                                        variant="outlined"
                                        size="small"
                                    >
                                        View Details
                                    </Button>
                                </Box>
                            ) : (
                                <Typography variant="body1">No gangs found</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top User */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Top User
                            </Typography>

                            {stats?.topUser ? (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        {stats.topUser.avatar ? (
                                            <Box
                                                component="img"
                                                src={stats.topUser.avatar}
                                                alt={stats.topUser.username}
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: '50%',
                                                    mr: 2
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: '50%',
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem',
                                                    mr: 2
                                                }}
                                            >
                                                {stats.topUser.username.charAt(0).toUpperCase()}
                                            </Box>
                                        )}
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold">
                                                {stats.topUser.username}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {stats.topUser.points} points
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        component={Link}
                                        to={`/users/${stats.topUser.discordId}`}
                                        variant="outlined"
                                        size="small"
                                    >
                                        View Profile
                                    </Button>
                                </Box>
                            ) : (
                                <Typography variant="body1">No users found</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Activity */}
            <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                        Recent Activity
                    </Typography>
                    <Button
                        component={Link}
                        to="/activity"
                        color="primary"
                        sx={{ textTransform: 'none' }}
                    >
                        View All
                    </Button>
                </Box>

                <ActivityList
                    activities={activities}
                    showControls={false}
                    currentFilters={{
                        searchTerm: '',
                        type: '',
                        sortOrder: 'desc'
                    }}
                />
            </Box>

            {/* Quick Links */}
            <Box sx={{ mt: 5 }}>
                <Divider sx={{ mb: 4 }} />

                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    Quick Links
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6} md={3}>
                        <Button
                            component={Link}
                            to="/gangs"
                            variant="contained"
                            fullWidth
                            startIcon={<GroupsIcon />}
                        >
                            All Gangs
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button
                            component={Link}
                            to="/users"
                            variant="contained"
                            fullWidth
                            startIcon={<PeopleAltIcon />}
                        >
                            All Users
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button
                            component={Link}
                            to="/leaderboard"
                            variant="contained"
                            fullWidth
                            startIcon={<EmojiEventsIcon />}
                        >
                            Leaderboard
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button
                            component={Link}
                            to="/activity"
                            variant="contained"
                            fullWidth
                            startIcon={<MessageIcon />}
                        >
                            Activity
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                    Server Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: serverStatus.status === 'ok' ? '#4caf50' : '#f44336',
                            mr: 1
                        }}
                    />
                    <Typography>
                        Server: {serverStatus.status === 'ok' ? 'Online' : 'Offline'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: serverStatus.botEnabled ? '#4caf50' : '#f44336',
                            mr: 1
                        }}
                    />
                    <Typography>
                        Discord Bot: {serverStatus.botEnabled ? 'Enabled' : 'Disabled'}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Home; 