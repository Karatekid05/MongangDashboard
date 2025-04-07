import React, { useState, useEffect, useMemo } from 'react';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Box,
    Chip,
    Divider,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    IconButton,
    Tooltip,
    InputAdornment
} from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatDistanceToNow, parseISO } from 'date-fns';

// Icons
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MessageIcon from '@mui/icons-material/Message';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import UpdateIcon from '@mui/icons-material/Update';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';

/**
 * Activity type constants - these must match exactly what the backend sends
 */
const ACTIVITY_TYPES = {
    GAMER: 'gamer',
    MESSAGE_ACTIVITY: 'messageActivity',
    ART_AND_MEMES: 'artAndMemes',
    OTHER: 'other'
};

/**
 * Get icon based on activity type
 */
const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
        case ACTIVITY_TYPES.MESSAGE_ACTIVITY.toLowerCase():
            return <ChatIcon />;
        case ACTIVITY_TYPES.GAMER.toLowerCase():
            return <EmojiEventsIcon />;
        case ACTIVITY_TYPES.ART_AND_MEMES.toLowerCase():
            return <StarIcon />;
        default:
            return <ArrowRightAltIcon />;
    }
};

/**
 * Get color based on activity type
 */
const getActivityColor = (type) => {
    switch (type?.toLowerCase()) {
        case ACTIVITY_TYPES.MESSAGE_ACTIVITY.toLowerCase():
            return '#4caf50';
        case ACTIVITY_TYPES.GAMER.toLowerCase():
            return '#2196f3';
        case ACTIVITY_TYPES.ART_AND_MEMES.toLowerCase():
            return '#ff9800';
        default:
            return '#9e9e9e';
    }
};

/**
 * Get label based on activity type
 */
const getActivityLabel = (type) => {
    switch (type?.toLowerCase()) {
        case ACTIVITY_TYPES.MESSAGE_ACTIVITY.toLowerCase():
            return 'Message Activity';
        case ACTIVITY_TYPES.GAMER.toLowerCase():
            return 'Gamer';
        case ACTIVITY_TYPES.ART_AND_MEMES.toLowerCase():
            return 'Art & Memes';
        default:
            return 'Other';
    }
};

const formatDate = (dateString) => {
    try {
        // Handle relative time strings (e.g., "3 minutes ago")
        if (dateString.includes('ago')) {
            return dateString;
        }
        // Handle ISO dates
        return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
        console.warn('Error formatting date:', error);
        return dateString;
    }
};

// Activity processing helper
const normalizeActivity = (activity) => {
    if (!activity) {
        console.warn('Invalid activity data:', activity);
        return null;
    }

    // Log the complete raw activity object
    console.log('Raw activity data:', JSON.stringify(activity, null, 2));

    // Get the raw source type from any possible field
    const rawType = activity.source || activity.type || activity.activityType;

    // Log all possible type fields
    console.table({
        'Type Fields': {
            source: activity.source,
            type: activity.type,
            activityType: activity.activityType,
            action: activity.action,
            reason: activity.reason,
            finalRawType: rawType
        }
    });

    // Map the source to our activity types
    let type = ACTIVITY_TYPES.OTHER;

    // First check exact matches
    if (rawType === ACTIVITY_TYPES.GAMER || rawType === 'gamer') {
        type = ACTIVITY_TYPES.GAMER;
    } else if (rawType === ACTIVITY_TYPES.MESSAGE_ACTIVITY || rawType === 'messageActivity') {
        type = ACTIVITY_TYPES.MESSAGE_ACTIVITY;
    } else if (rawType === ACTIVITY_TYPES.ART_AND_MEMES || rawType === 'artAndMemes') {
        type = ACTIVITY_TYPES.ART_AND_MEMES;
    }
    // Then check the reason field if no exact match
    else if (activity.reason) {
        const reason = activity.reason.toLowerCase();
        if (reason.includes('gamer') || reason.includes('game') || reason.includes('sea kings')) {
            type = ACTIVITY_TYPES.GAMER;
        } else if (reason.includes('art') || reason.includes('meme')) {
            type = ACTIVITY_TYPES.ART_AND_MEMES;
        } else if (reason.includes('message') || reason.includes('activity')) {
            type = ACTIVITY_TYPES.MESSAGE_ACTIVITY;
        }
    }

    // Log the type mapping decision
    console.table({
        'Type Mapping Decision': {
            rawType: rawType,
            reason: activity.reason,
            finalType: type,
            isGamer: type === ACTIVITY_TYPES.GAMER,
            isMessageActivity: type === ACTIVITY_TYPES.MESSAGE_ACTIVITY,
            isArtAndMemes: type === ACTIVITY_TYPES.ART_AND_MEMES,
            isOther: type === ACTIVITY_TYPES.OTHER
        }
    });

    // Get the user name from all possible sources
    let userName;
    if (activity.user?.username) {
        userName = activity.user.username;
    } else if (activity.username) {
        userName = activity.username;
    } else if (activity.targetName) {
        userName = activity.targetName;
    } else if (activity.user?.name) {
        userName = activity.user.name;
    } else {
        userName = 'Unknown User';
    }

    // Get user ID from all possible sources
    let userId;
    if (activity.user?.id) {
        userId = activity.user.id;
    } else if (activity.userId) {
        userId = activity.userId;
    } else if (activity.targetId) {
        userId = activity.targetId;
    }

    // Construct a descriptive message
    let message = activity.reason || '';
    if (activity.points > 0) {
        message = `Awarded ${activity.points} points`;
    } else if (activity.points < 0) {
        message = `Deducted ${Math.abs(activity.points)} points`;
    }

    const normalizedActivity = {
        id: activity.id || activity._id,
        type: type,
        source: rawType,
        points: activity.points || 0,
        message: message,
        user: {
            id: userId,
            name: userName
        },
        createdAt: activity.createdAt
    };

    // Log the final normalized activity
    console.log('Final normalized activity:', {
        id: normalizedActivity.id,
        type: normalizedActivity.type,
        source: normalizedActivity.source,
        message: normalizedActivity.message,
        allFields: activity
    });

    return normalizedActivity;
};

/**
 * ActivityList - A component for displaying a list of activities with filtering and sorting
 */
const ActivityList = ({
    activities,
    showType = true,
    disableDividers = false,
    compact = false,
    onFilterChange,
    showControls = true,
    currentFilters = {
        searchTerm: '',
        type: '',
        sortOrder: 'desc'
    },
    gangId = null
}) => {
    const [searchTerm, setSearchTerm] = useState(currentFilters.searchTerm);
    const [selectedType, setSelectedType] = useState(currentFilters.type);
    const [sortOrder, setSortOrder] = useState(currentFilters.sortOrder);

    // Filter activities by gang members if gangId is provided
    const filteredActivities = useMemo(() => {
        let filtered = [...activities];

        // Filter by gang if gangId is provided
        if (gangId) {
            filtered = filtered.filter(activity => {
                const userId = activity.user?.id || activity.userId || activity.targetId;
                // Check if the user belongs to the gang
                return activity.gangId === gangId ||
                    (activity.user?.currentGangId === gangId) ||
                    (activity.targetType === 'gang' && activity.targetId === gangId);
            });
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(activity => {
                const userName = activity.user?.username || activity.username || activity.targetName || '';
                const reason = activity.reason || '';
                const searchLower = searchTerm.toLowerCase();
                return userName.toLowerCase().includes(searchLower) ||
                    reason.toLowerCase().includes(searchLower);
            });
        }

        // Apply type filter
        if (selectedType) {
            filtered = filtered.filter(activity => {
                const activityType = activity.source || activity.type || activity.activityType;
                return activityType?.toLowerCase() === selectedType.toLowerCase();
            });
        }

        // Apply sort
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [activities, searchTerm, selectedType, sortOrder, gangId]);

    const handleSearchChange = (e) => {
        if (onFilterChange) {
            onFilterChange({
                ...currentFilters,
                searchTerm: e.target.value
            });
        }
    };

    const handleTypeChange = (e) => {
        console.log('Type change:', e.target.value);
        if (onFilterChange) {
            onFilterChange({
                ...currentFilters,
                type: e.target.value
            });
        }
    };

    const handleSortChange = (e) => {
        if (onFilterChange) {
            onFilterChange({
                ...currentFilters,
                sortOrder: e.target.value
            });
        }
    };

    if (!Array.isArray(activities)) {
        console.error('Invalid activities prop:', activities);
        return (
            <Typography color="error">
                Error: Invalid activity data received
            </Typography>
        );
    }

    return (
        <Box>
            {showControls && (
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search activities..."
                        value={currentFilters.searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Activity Type</InputLabel>
                        <Select
                            value={currentFilters.type}
                            onChange={handleTypeChange}
                            label="Activity Type"
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value={ACTIVITY_TYPES.GAMER}>Gamer</MenuItem>
                            <MenuItem value={ACTIVITY_TYPES.MESSAGE_ACTIVITY}>Message Activity</MenuItem>
                            <MenuItem value={ACTIVITY_TYPES.ART_AND_MEMES}>Art & Memes</MenuItem>
                            <MenuItem value={ACTIVITY_TYPES.OTHER}>Other</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Sort Order</InputLabel>
                        <Select
                            value={currentFilters.sortOrder}
                            onChange={handleSortChange}
                            label="Sort Order"
                        >
                            <MenuItem value="desc">Newest First</MenuItem>
                            <MenuItem value="asc">Oldest First</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            )}

            {filteredActivities.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No activities found
                </Typography>
            ) : (
                <List>
                    {filteredActivities.map((activity) => (
                        <ListItem
                            key={activity.id}
                            alignItems="flex-start"
                            sx={{
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:last-child': { borderBottom: 'none' }
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                                    {getActivityIcon(activity.type)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography component="span" variant="subtitle1" color="text.primary">
                                            {activity.user.name}
                                        </Typography>
                                        <Chip
                                            label={`${activity.points > 0 ? '+' : ''}${activity.points} points`}
                                            size="small"
                                            color={activity.points >= 0 ? "success" : "error"}
                                            sx={{ ml: 1 }}
                                        />
                                        <Typography component="span" variant="body2" color="text.secondary">
                                            • {formatDate(activity.createdAt)}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            {activity.message}
                                        </Typography>
                                        <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {getActivityLabel(activity.type)}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

ActivityList.propTypes = {
    activities: PropTypes.array.isRequired,
    showType: PropTypes.bool,
    disableDividers: PropTypes.bool,
    compact: PropTypes.bool,
    onFilterChange: PropTypes.func,
    showControls: PropTypes.bool,
    gangId: PropTypes.string
};

export default ActivityList; 