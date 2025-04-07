import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PropTypes from 'prop-types';

/**
 * StatCard - A reusable component for displaying statistics
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the statistic
 * @param {string|number} props.value - Value to display
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} [props.color='primary.main'] - Color for the icon background
 * @param {number} [props.change] - Percentage change from previous period
 * @param {string} [props.trend='up'] - Trend direction ('up' or 'down')
 * @param {string} [props.timePeriod='vs last week'] - Time period for comparison
 * @param {Object} [props.sx] - Additional MUI sx styles
 */
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary.main', 
  change, 
  trend = 'up',
  timePeriod = 'vs last week',
  sx = {} 
}) => {
  const trendIcon = trend === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />;
  const trendColor = trend === 'up' ? 'success.main' : 'error.main';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Avatar
            sx={{
              backgroundColor: `${color}15`, // Use alpha version of the color
              color: color,
              width: 40,
              height: 40
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {value}
        </Typography>
        
        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: trendColor,
                mr: 1
              }}
            >
              {trendIcon}
              <Typography variant="body2" sx={{ fontWeight: 'medium', ml: 0.5 }}>
                {change}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {timePeriod}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string,
  change: PropTypes.number,
  trend: PropTypes.oneOf(['up', 'down']),
  timePeriod: PropTypes.string,
  sx: PropTypes.object
};

export default StatCard; 