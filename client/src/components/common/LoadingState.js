import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * LoadingState - A reusable component for displaying loading states
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message='Loading...'] - Message to display
 * @param {string|number} [props.height='400px'] - Height of the loading container
 * @param {boolean} [props.fullPage=false] - Whether to display as full page loading
 * @param {Object} [props.sx] - Additional MUI sx styles
 */
const LoadingState = ({
    message = 'Loading...',
    height = '400px',
    fullPage = false,
    sx = {}
}) => {
    const content = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: fullPage ? '100vh' : height,
                width: '100%',
                ...sx
            }}
        >
            <CircularProgress size={40} thickness={4} />
            {message && (
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );

    if (fullPage) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'background.default',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {content}
            </Box>
        );
    }

    return content;
};

LoadingState.propTypes = {
    message: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fullPage: PropTypes.bool,
    sx: PropTypes.object
};

export default LoadingState; 