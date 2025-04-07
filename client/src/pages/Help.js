import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Breadcrumbs,
    Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import HelpIcon from '@mui/icons-material/Help';
import HomeIcon from '@mui/icons-material/Home';

const Help = () => {
    return (
        <Box>
            {/* Breadcrumbs Navigation */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <HelpIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Help
                </Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HelpIcon fontSize="large" sx={{ mr: 1 }} color="primary" />
                <Typography variant="h4" component="h1">
                    Help & Documentation
                </Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 4 }}>
                Welcome to the Mongang Dashboard Help Center. Here you'll find information about how to use the dashboard features.
            </Typography>

            <Grid container spacing={3}>
                {/* Dashboard Features Section */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardHeader title="Dashboard Features" />
                        <Divider />
                        <CardContent>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <DashboardIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Dashboard"
                                        secondary="View a summary of all gang and user activities, including total points, weekly points, and top performers."
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <GroupsIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Gangs"
                                        secondary="Browse all gangs, view gang details including member list, total points, and activity history."
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <PeopleIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Users"
                                        secondary="Browse all users, view user profiles with points breakdown and gang association."
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmojiEventsIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Leaderboard"
                                        secondary="View top-ranking gangs and users based on total points and weekly points."
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <HistoryIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Activity"
                                        secondary="Track all system activities including point awards, gang joins/leaves, and other events."
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Using the Dashboard Section */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardHeader title="How Points Work" />
                        <Divider />
                        <CardContent>
                            <Typography variant="body1" paragraph>
                                The Mongang Points System rewards users for active participation in their gang's Discord channels.
                            </Typography>

                            <Typography variant="subtitle2" gutterBottom>Points Earning Rules:</Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText primary="Each valid message in your gang's channel awards 1 point" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="Messages must be at least 5 characters long" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="There's a 5-minute cooldown between point-earning messages" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="Points contribute to both your individual score and your gang's total score" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="Moderators can award additional points for participation in events, contests, etc." />
                                </ListItem>
                            </List>

                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Weekly Points Reset:</Typography>
                            <Typography variant="body2">
                                Weekly points reset every Monday at midnight UTC, while total points accumulate over time.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Dashboard Usage Tips */}
                <Grid item xs={12}>
                    <Card elevation={3}>
                        <CardHeader title="Dashboard Usage Tips" />
                        <Divider />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>Navigating the Dashboard:</Typography>
                                    <Typography variant="body2" paragraph>
                                        Use the sidebar menu to navigate between different sections of the dashboard.
                                        On mobile devices, the menu can be accessed by clicking the hamburger icon in the top-left corner.
                                    </Typography>

                                    <Typography variant="subtitle2" gutterBottom>Viewing Details:</Typography>
                                    <Typography variant="body2" paragraph>
                                        Click on any gang or user name throughout the dashboard to view their detailed profile page.
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>Theme Settings:</Typography>
                                    <Typography variant="body2" paragraph>
                                        Toggle between light and dark mode using the mode switch in the sidebar menu.
                                        Your preference will be saved for future visits.
                                    </Typography>

                                    <Typography variant="subtitle2" gutterBottom>Real-time Updates:</Typography>
                                    <Typography variant="body2">
                                        The dashboard data updates whenever points are awarded in Discord.
                                        Refresh the page to see the latest information.
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Help; 