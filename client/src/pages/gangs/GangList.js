import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Box,
    Divider,
    Avatar
} from '@mui/material';
import { Link } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

import { gangService } from '../../services';

const GangList = () => {
    const [gangs, setGangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGangs = async () => {
            try {
                setLoading(true);
                console.log('Fetching gangs...');
                const response = await gangService.getGangs();

                console.log('API response:', response);

                if (response.error) {
                    console.error('Error returned from service:', response.error);
                    setError(`Failed to load gangs: ${response.error}`);
                    setLoading(false);
                    return;
                }

                // Use gangs from response or empty array as fallback
                const gangsList = response?.gangs || [];
                console.log('Found gangs:', gangsList.length, gangsList);

                // Process gangs to ensure they have all required fields
                const processedGangs = gangsList.map(gang => ({
                    id: gang.id || gang.gangId || gang._id || `unknown-${Math.random().toString(36).substr(2, 9)}`,
                    name: gang.name || 'Unknown Gang',
                    description: gang.description || null,
                    totalMemberPoints: gang.totalMemberPoints || gang.points || 0,
                    memberCount: gang.memberCount || gang.members || 0,
                    weeklyMemberPoints: gang.weeklyMemberPoints || gang.weeklyPoints || 0,
                    icon: gang.icon || null
                }));

                setGangs(processedGangs);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching gangs:', err);
                setError(`Failed to load gangs: ${err.message}`);
                setLoading(false);
            }
        };

        fetchGangs();
    }, []);

    if (loading) {
        return <LoadingState fullPage />;
    }

    if (error) {
        return <ErrorState message={error} retry={() => window.location.reload()} />;
    }

    return (
        <Box sx={{ pl: 3, pr: 3 }}>
            <PageHeader
                title="Gangs"
                description="View all gangs and their stats"
                icon={GroupsIcon}
                breadcrumbs={[{ label: 'Gangs', href: '/gangs' }]}
            />

            {/* Gangs grid */}
            {gangs.length === 0 ? (
                <Box sx={{ textAlign: 'center', my: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No gangs found
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {gangs.map((gang) => (
                        <Grid item xs={12} sm={6} md={4} key={gang.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                    }
                                }}
                            >
                                <CardActionArea
                                    component={Link}
                                    to={`/gangs/${gang.id}`}
                                    sx={{ height: '100%' }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            {gang.icon ? (
                                                <Avatar
                                                    src={gang.icon}
                                                    alt={gang.name}
                                                    sx={{ width: 60, height: 60, mr: 2 }}
                                                />
                                            ) : (
                                                <Avatar
                                                    sx={{
                                                        width: 60,
                                                        height: 60,
                                                        mr: 2,
                                                        bgcolor: 'primary.main'
                                                    }}
                                                >
                                                    {gang.name.charAt(0)}
                                                </Avatar>
                                            )}
                                            <Box>
                                                <Typography variant="h5" component="h2" fontWeight="bold">
                                                    {gang.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {gang.description || 'No description'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <EmojiEventsIcon color="primary" />
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {gang.totalMemberPoints}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Points
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <PeopleAltIcon color="primary" />
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {gang.memberCount}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Members
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <EmojiEventsIcon color="secondary" />
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {gang.weeklyMemberPoints}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Weekly
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default GangList; 