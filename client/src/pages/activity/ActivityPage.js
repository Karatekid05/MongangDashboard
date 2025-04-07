import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Divider,
    Pagination,
    Stack
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import debounce from 'lodash/debounce';

import PageHeader from '../../components/common/PageHeader';
import ActivityList from '../../components/activity/ActivityList';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

import { getActivities } from '../../services/activityService';

const ActivityPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        searchTerm: '',
        type: '',
        sortOrder: 'desc'
    });

    const itemsPerPage = 20;

    // Debounce the API call to prevent too many requests
    const debouncedFetchActivities = useCallback(
        debounce(async (currentPage, currentFilters) => {
            try {
                setLoading(true);
                console.log('Fetching activities with filters:', { page: currentPage, ...currentFilters });

                const { activities: activityData, totalCount } = await getActivities({
                    page: currentPage,
                    limit: itemsPerPage,
                    ...currentFilters
                });

                if (!Array.isArray(activityData)) {
                    console.error('Invalid activity data received:', activityData);
                    setError('Invalid data received from server');
                    setActivities([]);
                    setTotalPages(1);
                    return;
                }

                console.log('Received activities:', activityData.length);
                setActivities(activityData);
                setTotalPages(Math.max(1, Math.ceil(totalCount / itemsPerPage)));
                setError(null);
            } catch (err) {
                console.error('Error fetching activities:', err);
                setError('Failed to load activity data. Please try again later.');
                setActivities([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    // Fetch activities when page or filters change
    useEffect(() => {
        debouncedFetchActivities(page, filters);
        return () => debouncedFetchActivities.cancel();
    }, [page, filters, debouncedFetchActivities]);

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo(0, 0);
    };

    const handleFilterChange = (newFilters) => {
        console.log('Filter change:', newFilters);
        setFilters(prev => {
            // Only update if filters actually changed
            if (JSON.stringify(prev) === JSON.stringify(newFilters)) {
                return prev;
            }
            setPage(1); // Reset to first page when filters change
            return newFilters;
        });
    };

    if (error) {
        return (
            <Box sx={{ pl: 3, pr: 3 }}>
                <PageHeader
                    title="Activity Feed"
                    description="See all recent activities in the Mongang community"
                    icon={HistoryIcon}
                    breadcrumbs={[{ label: 'Activity', href: '/activity' }]}
                />
                <ErrorState
                    message={error}
                    retry={() => {
                        setError(null);
                        setLoading(true);
                        debouncedFetchActivities(page, filters);
                    }}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ pl: 3, pr: 3 }}>
            <PageHeader
                title="Activity Feed"
                description="See all recent activities in the Mongang community"
                icon={HistoryIcon}
                breadcrumbs={[{ label: 'Activity', href: '/activity' }]}
            />

            {/* Activity List */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {filters.searchTerm || filters.type ? 'Filtered Activities' : 'Recent Activities'}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {loading ? (
                        <LoadingState height="300px" message="Loading activities..." />
                    ) : activities.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No activities found. Try adjusting your filters.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <ActivityList
                                activities={activities}
                                onFilterChange={handleFilterChange}
                                currentFilters={filters}
                                showControls={true}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={handlePageChange}
                                        color="primary"
                                        showFirstButton
                                        showLastButton
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Page {page} of {totalPages}
                                    </Typography>
                                </Stack>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default ActivityPage; 