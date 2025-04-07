import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    LinearProgress
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MessageIcon from '@mui/icons-material/Message';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

import { gangService } from '../../services';

// Custom TabPanel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`gang-tabpanel-${index}`}
            aria-labelledby={`gang-tab-${index}`}
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

const GangDetail = () => {
    const { id } = useParams();
    const [gang, setGang] = useState(null);
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchGangDetails = async () => {
            try {
                setLoading(true);
                console.log('Fetching gang details for ID:', id);

                // Fetch gang data in parallel
                const gangData = await gangService.getGangById(id);
                console.log('Gang data:', gangData);

                // Verificar se o gangData tem erro (404 ou outro)
                if (gangData.error) {
                    console.error('Error fetching gang details:', gangData.error);
                    setError(gangData.error);
                    setLoading(false);
                    return;
                }

                // Só continua buscando os outros dados se o gang foi encontrado
                const [membersData, statsData] = await Promise.all([
                    gangService.getGangMembers(id),
                    gangService.getGangStats(id)
                ]);

                console.log('Members data:', membersData);
                console.log('Stats data:', statsData);

                // Verificar se algum dos outros objetos retornados contém um erro
                if (membersData.error || statsData.error) {
                    const errorMessage = membersData.error || statsData.error;
                    console.error('Error fetching gang details:', errorMessage);
                    setError(errorMessage);
                    setLoading(false);
                    return;
                }

                setGang(gangData);
                setMembers(membersData?.members || membersData || []);
                setStats(statsData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching gang details:', err);
                setError('Failed to load gang details. Please try again later.');
                setLoading(false);
            }
        };

        fetchGangDetails();
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return <LoadingState fullPage message="Loading gang details..." />;
    }

    if (error) {
        return <ErrorState message={error} retry={() => window.location.reload()} />;
    }

    return (
        <Box sx={{ pl: 3, pr: 3 }}>
            <PageHeader
                title={gang?.name || 'Gang Details'}
                description={gang?.description || ''}
                icon={GroupsIcon}
                breadcrumbs={[
                    { label: 'Gangs', href: '/gangs' },
                    { label: gang?.name || 'Details', href: `/gangs/${id}` }
                ]}
            />

            {/* Gang Header */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {gang?.icon ? (
                            <Avatar
                                src={gang.icon}
                                alt={gang.name}
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
                                {gang?.name.charAt(0)}
                            </Avatar>
                        )}
                        <Box>
                            <Typography variant="h4" component="h1" fontWeight="bold">
                                {gang?.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                {gang?.description || 'No description available'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Points"
                        value={stats?.totalPoints || 0}
                        icon={<EmojiEventsIcon />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Weekly Points"
                        value={stats?.weeklyPoints || 0}
                        icon={<EmojiEventsIcon />}
                        color="secondary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Members"
                        value={stats?.memberCount || 0}
                        icon={<PeopleAltIcon />}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Messages"
                        value={stats?.messageCount || 0}
                        icon={<MessageIcon />}
                        color="info.main"
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

            {/* Tabs for Members, Activity, etc. */}
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="gang details tabs"
                    >
                        <Tab label="Members" />
                        <Tab label="Statistics" />
                    </Tabs>
                </Box>

                {/* Members Tab */}
                <TabPanel value={tabValue} index={0}>
                    {members.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                            No members found
                        </Typography>
                    ) : (
                        <Grid container spacing={2}>
                            {members.map((member) => (
                                <Grid item xs={12} sm={6} md={4} key={member.discordId}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {member.avatar ? (
                                                    <Avatar
                                                        src={member.avatar}
                                                        alt={member.username}
                                                        sx={{ width: 50, height: 50, mr: 2 }}
                                                    />
                                                ) : (
                                                    <Avatar sx={{ width: 50, height: 50, mr: 2 }}>
                                                        {member.username.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                )}
                                                <Box>
                                                    <Typography variant="h6">
                                                        {member.username}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {member.points} points
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>

                {/* Statistics Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        {/* Points Breakdown */}
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
                                                {gang?.pointsBreakdown?.messageActivity || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Gamer</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {gang?.pointsBreakdown?.gamer || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Art & Memes</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {gang?.pointsBreakdown?.artAndMemes || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Others</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {gang?.pointsBreakdown?.other || 0}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body1" fontWeight="bold">Total Member Points</Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {(gang?.pointsBreakdown?.messageActivity || 0) +
                                                    (gang?.pointsBreakdown?.gamer || 0) +
                                                    (gang?.pointsBreakdown?.artAndMemes || 0) +
                                                    (gang?.pointsBreakdown?.other || 0)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Top Member */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Top Member
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    {stats?.topMember ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                                                {stats.topMember.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h5">
                                                    {stats.topMember.username}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {stats.topMember.points} points
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Typography variant="body1" color="text.secondary">
                                            No top member found
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Box>
        </Box>
    );
};

export default GangDetail; 