import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Paper,
  Divider,
  Box,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';

// Icons
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MessageIcon from '@mui/icons-material/Message';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import StarIcon from '@mui/icons-material/Star';
import ChatIcon from '@mui/icons-material/Chat';

/**
 * Activity type constants - these must match exactly what the backend sends
 */
const ACTIVITY_TYPES = {
  GAMES: 'games',
  ACTIVITY: 'activity',
  ART_AND_MEMES: 'artAndMemes',
  GANG_ACTIVITY: 'gangActivity',
  AWARD: 'award',
  OTHER: 'other'
};

// Helper function to format timestamps
const formatDate = (timestamp) => {
  if (!timestamp) return "Recently";

  // If timestamp is already formatted (e.g., "2 minutes ago")
  if (typeof timestamp === 'string' && timestamp.includes('ago')) {
    return timestamp;
  }

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (isNaN(diffInSeconds)) return "Recently";

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Recently";
  }
};

/**
 * Get icon based on activity type
 */
const getActivityIcon = (type) => {
  switch (type?.toLowerCase()) {
    case ACTIVITY_TYPES.AWARD.toLowerCase():
      return <StarIcon />;
    case ACTIVITY_TYPES.ACTIVITY.toLowerCase():
      return <ChatIcon />;
    case ACTIVITY_TYPES.GAMES.toLowerCase():
      return <EmojiEventsIcon />;
    case ACTIVITY_TYPES.GANG_ACTIVITY.toLowerCase():
      return <GroupsIcon />;
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
    case ACTIVITY_TYPES.AWARD.toLowerCase():
      return '#ffd700';
    case ACTIVITY_TYPES.ACTIVITY.toLowerCase():
      return '#4caf50';
    case ACTIVITY_TYPES.GAMES.toLowerCase():
      return '#2196f3';
    case ACTIVITY_TYPES.GANG_ACTIVITY.toLowerCase():
      return '#9c27b0';
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
    case ACTIVITY_TYPES.AWARD.toLowerCase():
      return 'Points Award';
    case ACTIVITY_TYPES.ACTIVITY.toLowerCase():
      return 'Chat Activity';
    case ACTIVITY_TYPES.GAMES.toLowerCase():
      return 'Games';
    case ACTIVITY_TYPES.GANG_ACTIVITY.toLowerCase():
      return 'Gang Activity';
    case ACTIVITY_TYPES.ART_AND_MEMES.toLowerCase():
      return 'Art & Memes';
    default:
      return 'Other';
  }
};

const ActivityList = ({ activities, emptyMessage = "No activities yet" }) => {
  if (!activities || activities.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 1
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} variant="outlined">
      <List sx={{ width: '100%' }}>
        {activities.map((activity, index) => (
          <React.Fragment key={activity._id || activity.id || index}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" variant="subtitle1" color="text.primary">
                      {activity.targetName || 'Unknown User'}
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
                      {activity.reason || `Received points from ${activity.awardedByUsername || 'System'}`}
                    </Typography>
                    <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {getActivityLabel(activity.source)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < activities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default ActivityList; 