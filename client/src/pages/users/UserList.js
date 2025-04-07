import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Typography,
    TextField,
    InputAdornment,
    Avatar,
    Pagination,
    Stack,
    Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import debounce from 'lodash/debounce';

import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

import { userService } from '../../services';

// Format date function
const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    return 'Recently';
};

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const usersPerPage = 12;

    // Debounce the API call to prevent too many requests
    const debouncedFetchUsers = useCallback(
        debounce(async (currentPage, currentSearchTerm) => {
            try {
                setLoading(true);
                const trimmedSearchTerm = (currentSearchTerm || '').trim();
                console.log('Fetching users with params:', {
                    page: currentPage,
                    searchTerm: trimmedSearchTerm,
                    originalSearchTerm: currentSearchTerm
                });

                const response = await userService.getUsers({
                    page: currentPage,
                    limit: usersPerPage,
                    searchTerm: trimmedSearchTerm || undefined
                });

                console.log('API response:', {
                    users: response.users?.map(u => u.username),
                    total: response.totalUsers,
                    pages: response.totalPages,
                    searchTerm: trimmedSearchTerm
                });

                if (!response.users) {
                    throw new Error('No users data received from API');
                }

                setUsers(response.users);
                setTotalPages(response.totalPages || 1);
                setTotalUsers(response.totalUsers || 0);
                setError(null);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users. Please try again later.');
                setUsers([]);
                setTotalUsers(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    // Fetch users when page or search term changes
    useEffect(() => {
        debouncedFetchUsers(page, searchTerm);
        return () => debouncedFetchUsers.cancel();
    }, [page, searchTerm, debouncedFetchUsers]);

    const handleSearchChange = (event) => {
        const newSearchTerm = event.target.value;
        console.log('Search term changed:', newSearchTerm);
        setSearchTerm(newSearchTerm);
        setPage(1); // Reset to first page when searching
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return <LoadingState fullPage />;
    }

    if (error) {
        return <ErrorState message={error} retry={() => window.location.reload()} />;
    }

    return (
        <Box sx={{ pl: 3, pr: 3 }}>
            <PageHeader
                title="Users"
                description="View all users and their points"
                icon={PeopleAltIcon}
                breadcrumbs={[{ label: 'Users', href: '/users' }]}
            />

            {/* Search */}
            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="Search users by username..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Search info */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm ? (
                    `Found ${totalUsers} user${totalUsers !== 1 ? 's' : ''} matching "${searchTerm}"`
                ) : (
                    `Showing ${users.length} of ${totalUsers} total users`
                )}
            </Typography>

            {/* Users grid */}
            {users.length === 0 ? (
                <Box sx={{ textAlign: 'center', my: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No users found
                    </Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {users
                            .filter(user =>
                                !searchTerm ||
                                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (user.currentGangName && user.currentGangName.toLowerCase().includes(searchTerm.toLowerCase()))
                            )
                            .map((user) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={user.id || user.discordId}>
                                    <Card sx={{
                                        height: '100%',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                        }
                                    }}>
                                        <CardActionArea
                                            component={Link}
                                            to={`/users/${user.id || user.discordId}`}
                                            sx={{ height: '100%' }}
                                        >
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    {user.avatar ? (
                                                        <Avatar
                                                            src={user.avatar}
                                                            alt={user.username}
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
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                    )}
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {user.username}
                                                        </Typography>
                                                        {user.currentGangName && (
                                                            <Chip
                                                                label={user.currentGangName}
                                                                size="small"
                                                                color="primary"
                                                                sx={{ mt: 0.5 }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>

                                                <Box sx={{ mt: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Total Points:
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {user.points}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Weekly Points:
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {user.weeklyPoints}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                    </Grid>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                showFirstButton
                                showLastButton
                            />
                        </Stack>
                    )}
                </>
            )}
        </Box>
    );
};

export default UserList; 