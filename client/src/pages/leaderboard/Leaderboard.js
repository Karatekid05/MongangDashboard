import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tab,
    Tabs,
    Card,
    CardContent,
    Grid,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    FormControlLabel,
    Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import StatCard from '../../components/common/StatCard';

import { leaderboardService } from '../../services';

// Format number with commas
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// TabPanel component for tab content
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`leaderboard-tabpanel-${index}`}
            aria-labelledby={`leaderboard-tab-${index}`}
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

const Leaderboard = () => {
    const [tabValue, setTabValue] = useState(0);
    const [weeklyToggle, setWeeklyToggle] = useState(false);
    const [stats, setStats] = useState(null);
    const [gangLeaderboard, setGangLeaderboard] = useState([]);
    const [userLeaderboard, setUserLeaderboard] = useState({
        users: [],
        totalPages: 1
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                setLoading(true);

                // Get leaderboard stats
                const statsData = await leaderboardService.getLeaderboardStats();
                setStats(statsData);

                // Get initial leaderboards
                const gangsData = await leaderboardService.getGangLeaderboard();
                const usersData = await leaderboardService.getUserLeaderboard(1, 20);

                setGangLeaderboard(gangsData);
                setUserLeaderboard(usersData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching leaderboard data:', err);
                setError('Failed to load leaderboard data. Please try again later.');
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, []);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);

                if (tabValue === 0) {
                    // Fetch gang leaderboard
                    const gangsData = weeklyToggle
                        ? await leaderboardService.getWeeklyGangLeaderboard()
                        : await leaderboardService.getGangLeaderboard();
                    setGangLeaderboard(gangsData);
                } else {
                    // Fetch user leaderboard
                    const usersData = weeklyToggle
                        ? await leaderboardService.getWeeklyUserLeaderboard(1, 20)
                        : await leaderboardService.getUserLeaderboard(1, 20);
                    setUserLeaderboard(usersData);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching leaderboard data:', err);
                setError('Failed to load leaderboard data. Please try again later.');
                setLoading(false);
            }
        };

        if (stats) { // Only fetch if stats are loaded
            fetchLeaderboard();
        }
    }, [tabValue, weeklyToggle]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleWeeklyToggle = (event) => {
        setWeeklyToggle(event.target.checked);
    };

    if (loading && !stats) {
        return <LoadingState fullPage />;
    }

    if (error) {
        return <ErrorState message={error} retry={() => window.location.reload()} />;
    }

    return (
        <Box sx={{ pl: 3, pr: 3 }}>
            <PageHeader
                title="Leaderboard"
                description="Rankings of gangs and users by points"
                icon={EmojiEventsIcon}
                breadcrumbs={[{ label: 'Leaderboard', href: '/leaderboard' }]}
            />

            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Points"
                        value={formatNumber(stats?.totalPoints || 0)}
                        icon={<EmojiEventsIcon />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Weekly Points"
                        value={formatNumber(stats?.totalWeeklyPoints || 0)}
                        icon={<EmojiEventsIcon />}
                        color="secondary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Users"
                        value={stats?.activeUsers || 0}
                        icon={<PeopleAltIcon />}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Gangs"
                        value={stats?.totalGangs || 0}
                        icon={<GroupsIcon />}
                        color="info.main"
                    />
                </Grid>
            </Grid>

            {/* Top Performers */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Top Performers
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        {/* Top Gang */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body1" color="text.secondary" gutterBottom>
                                    Top Gang
                                </Typography>

                                {stats?.topGang ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        {stats.topGang.icon ? (
                                            <Avatar
                                                src={stats.topGang.icon}
                                                alt={stats.topGang.name}
                                                sx={{ width: 80, height: 80, mb: 1 }}
                                            />
                                        ) : (
                                            <Avatar
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    mb: 1,
                                                    bgcolor: 'primary.main',
                                                    fontSize: '2rem'
                                                }}
                                            >
                                                {stats.topGang.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                        )}
                                        <Typography
                                            variant="h5"
                                            component={Link}
                                            to={`/gangs/${stats.topGang.id}`}
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'primary.main',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {stats.topGang.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatNumber(stats.topGang.totalMemberPoints)} points
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body1">No gangs found</Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Top User */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body1" color="text.secondary" gutterBottom>
                                    Top User
                                </Typography>

                                {stats?.topUser ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        {stats.topUser.avatar ? (
                                            <Avatar
                                                src={stats.topUser.avatar}
                                                alt={stats.topUser.username}
                                                sx={{ width: 80, height: 80, mb: 1 }}
                                            />
                                        ) : (
                                            <Avatar
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    mb: 1,
                                                    bgcolor: 'primary.main',
                                                    fontSize: '2rem'
                                                }}
                                            >
                                                {stats.topUser.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                        )}
                                        <Typography
                                            variant="h5"
                                            component={Link}
                                            to={`/users/${stats.topUser.discordId}`}
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'primary.main',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {stats.topUser.username}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatNumber(stats.topUser.points)} points
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body1">No users found</Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Leaderboard Tabs */}
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="leaderboard tabs"
                    >
                        <Tab icon={<GroupsIcon />} label="Gangs" />
                        <Tab icon={<PeopleAltIcon />} label="Users" />
                    </Tabs>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={weeklyToggle}
                                onChange={handleWeeklyToggle}
                                color="primary"
                            />
                        }
                        label={weeklyToggle ? "Weekly" : "All-Time"}
                        labelPlacement="start"
                    />
                </Box>

                {/* Gang Leaderboard Tab */}
                <TabPanel value={tabValue} index={0}>
                    {loading ? (
                        <LoadingState height="200px" message="Loading gang leaderboard..." />
                    ) : gangLeaderboard.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                            No gangs found
                        </Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="gang leaderboard table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>Gang</TableCell>
                                        <TableCell align="right">Members</TableCell>
                                        <TableCell align="right">{weeklyToggle ? 'Weekly Points' : 'Total Points'}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {gangLeaderboard.map((gang, index) => (
                                        <TableRow
                                            key={gang.id}
                                            sx={{
                                                backgroundColor: index < 3 ? `rgba(255, 215, ${200 - (index * 50)}, 0.1)` : 'inherit',
                                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {index + 1}
                                                </Typography>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {gang.icon ? (
                                                        <Avatar
                                                            src={gang.icon}
                                                            alt={gang.name}
                                                            sx={{ width: 40, height: 40, mr: 2 }}
                                                        />
                                                    ) : (
                                                        <Avatar
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                mr: 2,
                                                                bgcolor: 'primary.main'
                                                            }}
                                                        >
                                                            {gang.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                    )}
                                                    <Link
                                                        to={`/gangs/${gang.id}`}
                                                        style={{ textDecoration: 'none' }}
                                                    >
                                                        <Typography color="primary.main" fontWeight="medium">
                                                            {gang.name}
                                                        </Typography>
                                                    </Link>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{gang.memberCount}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {formatNumber(weeklyToggle ? gang.weeklyMemberPoints : gang.totalMemberPoints)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>

                {/* User Leaderboard Tab */}
                <TabPanel value={tabValue} index={1}>
                    {loading ? (
                        <LoadingState height="200px" message="Loading user leaderboard..." />
                    ) : userLeaderboard.users.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                            No users found
                        </Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="user leaderboard table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell>Gang</TableCell>
                                        <TableCell align="right">{weeklyToggle ? 'Weekly Points' : 'Total Points'}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userLeaderboard.users.map((user, index) => (
                                        <TableRow
                                            key={user.discordId}
                                            sx={{
                                                backgroundColor: index < 3 ? `rgba(255, 215, ${200 - (index * 50)}, 0.1)` : 'inherit',
                                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {index + 1}
                                                </Typography>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {user.avatar ? (
                                                        <Avatar
                                                            src={user.avatar}
                                                            alt={user.username}
                                                            sx={{ width: 40, height: 40, mr: 2 }}
                                                        />
                                                    ) : (
                                                        <Avatar
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                mr: 2,
                                                                bgcolor: 'primary.main'
                                                            }}
                                                        >
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                    )}
                                                    <Link
                                                        to={`/users/${user.discordId}`}
                                                        style={{ textDecoration: 'none' }}
                                                    >
                                                        <Typography color="primary.main" fontWeight="medium">
                                                            {user.username}
                                                        </Typography>
                                                    </Link>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {user.currentGangName ? (
                                                    <Link
                                                        to={`/gangs/${user.currentGangId}`}
                                                        style={{ textDecoration: 'none' }}
                                                    >
                                                        <Typography color="primary.main">
                                                            {user.currentGangName}
                                                        </Typography>
                                                    </Link>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        None
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {formatNumber(weeklyToggle ? user.weeklyPoints : user.points)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>
            </Box>
        </Box>
    );
};

export default Leaderboard; 