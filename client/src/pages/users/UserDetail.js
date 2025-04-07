import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Tabs,
    Tab,
    Divider,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import MessageIcon from '@mui/icons-material/Message';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import ActivityList from '../../components/common/ActivityList';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

import { userService } from '../../services';

// Format date function
const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
};

// Custom TabPanel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`user-tabpanel-${index}`}
            aria-labelledby={`user-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const UserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setLoading(true);

                // Fetch user data in parallel
                const [userData, activitiesData, statsData] = await Promise.all([
                    userService.getUserById(id),
                    userService.getUserActivity(id, 20),
                    userService.getUserStats(id)
                ]);

                setUser(userData);
                setActivities(activitiesData);
                setStats(statsData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Failed to load user details. Please try again later.');
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return <LoadingState fullPage message="Loading user details..." />;
    }

    if (error) {
        return <ErrorState message={error} retry={() => window.location.reload()} />;
    }

    return (
        <Box sx={{ pl: 3, pr: 3 }}>
            <PageHeader
                title={user?.username || 'User Profile'}
                icon={PeopleAltIcon}
                breadcrumbs={[
                    { label: 'Users', href: '/users' },
                    { label: user?.username || 'Profile', href: `/users/${id}` }
                ]}
            />

            {/* User Profile Header */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {user?.avatar ? (
                                    <Avatar
                                        src={user.avatar}
                                        alt={user.username}
                                        sx={{ width: 80, height: 80, mr: 3 }}
                                    />
                                ) : (
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mr: 3,
                                            bgcolor: 'primary.main',
                                            fontSize: '2rem'
                                        }}
                                    >
                                        {user?.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                )}
                                <Box>
                                    <Typography variant="h4" component="h1" fontWeight="bold">
                                        {user?.username}
                                    </Typography>

                                    {user?.currentGangName && (
                                        <Chip
                                            component={Link}
                                            to={`/gangs/${user.currentGangId}`}
                                            label={user.currentGangName}
                                            icon={<GroupsIcon />}
                                            color="primary"
                                            clickable
                                            sx={{ mt: 1 }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Member Since
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {formatDate(user?.createdAt)}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* User Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Points"
                        value={user?.points || 0}
                        icon={<EmojiEventsIcon />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Weekly Points"
                        value={user?.weeklyPoints || 0}
                        icon={<EmojiEventsIcon />}
                        color="secondary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Message Points"
                        value={stats?.messagePoints || 0}
                        icon={<MessageIcon />}
                        color="info.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Awards Received"
                        value={stats?.awardCount || 0}
                        icon={<EmojiEventsIcon />}
                        color="success.main"
                    />
                </Grid>
            </Grid>

            {/* Weekly Progress */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Weekly Progress
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {stats?.weeklyPoints || 0} of {stats?.totalPoints || 0} points ({Math.round(stats?.weeklyProgress || 0)}%)
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(stats?.weeklyProgress || 0, 100)}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="user details tabs"
                    >
                        <Tab label="Activity" />
                        <Tab label="Gang History" />
                        <Tab label="Statistics" />
                    </Tabs>
                </Box>

                {/* Activity Tab */}
                <TabPanel value={tabValue} index={0}>
                    <ActivityList
                        activities={activities}
                        emptyMessage="No recent activity for this user"
                    />
                </TabPanel>

                {/* Gang History Tab */}
                <TabPanel value={tabValue} index={1}>
                    {stats?.gangHistory && stats.gangHistory.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="gang history table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Gang</TableCell>
                                        <TableCell align="right">Points</TableCell>
                                        <TableCell align="right">Weekly Points</TableCell>
                                        <TableCell align="right">Joined</TableCell>
                                        <TableCell align="right">Left</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.gangHistory.map((gang, index) => (
                                        <TableRow key={index}>
                                            <TableCell component="th" scope="row">
                                                <Link
                                                    to={`/gangs/${gang.gangId}`}
                                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                                >
                                                    <Typography color="primary.main" fontWeight="medium">
                                                        {gang.gangName}
                                                    </Typography>
                                                </Link>
                                            </TableCell>
                                            <TableCell align="right">{gang.points}</TableCell>
                                            <TableCell align="right">{gang.weeklyPoints}</TableCell>
                                            <TableCell align="right">{formatDate(gang.joinedAt)}</TableCell>
                                            <TableCell align="right">{gang.leftAt ? formatDate(gang.leftAt) : 'Current'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                            No gang history available
                        </Typography>
                    )}
                </TabPanel>

                {/* Statistics Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Points Breakdown
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Message Activity</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {stats?.pointsBreakdown?.messageActivity || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Gamer</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {stats?.pointsBreakdown?.gamer || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Art & Memes</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {stats?.pointsBreakdown?.artAndMemes || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Other</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {stats?.pointsBreakdown?.other || 0}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body1" fontWeight="bold">Total</Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {user?.points || 0}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Weekly Points Breakdown
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Message Activity</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {stats?.weeklyPointsBreakdown?.messageActivity || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Gamer</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {stats?.weeklyPointsBreakdown?.gamer || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Art & Memes</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {stats?.weeklyPointsBreakdown?.artAndMemes || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Other</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {stats?.weeklyPointsBreakdown?.other || 0}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body1" fontWeight="bold">Total</Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {user?.weeklyPoints || 0}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Box>
        </Box>
    );
};

export default UserDetail; 