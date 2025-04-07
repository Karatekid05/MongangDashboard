import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import PropTypes from 'prop-types';

/**
 * ErrorState - A reusable component for displaying error states
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message='Something went wrong. Please try again later.'] - Error message to display
 * @param {string|number} [props.height='400px'] - Height of the error container
 * @param {Function} [props.retry] - Callback function for retry button
 * @param {string} [props.retryText='Try Again'] - Text for the retry button
 * @param {boolean} [props.showIcon=true] - Whether to show the error icon
 * @param {boolean} [props.fullPage=false] - Whether to display as full page error
 * @param {Object} [props.sx] - Additional MUI sx styles
 */
const ErrorState = ({
    message = 'Something went wrong. Please try again later.',
    height = '400px',
    retry,
    retryText = 'Try Again',
    showIcon = true,
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
                textAlign: 'center',
                height: fullPage ? '100vh' : height,
                width: '100%',
                p: 3,
                ...sx
            }}
        >
            {showIcon && (
                <ErrorOutlineIcon
                    color="error"
                    sx={{ fontSize: 60, mb: 2 }}
                />
            )}

            <Typography
                variant="h5"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 'medium' }}
            >
                Error
            </Typography>

            <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                    maxWidth: 500,
                    mb: retry ? 3 : 0
                }}
            >
                {message}
            </Typography>

            {retry && (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={retry}
                    sx={{ mt: 2 }}
                >
                    {retryText}
                </Button>
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
                <Paper
                    elevation={3}
                    sx={{
                        maxWidth: 600,
                        width: '90%',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    {content}
                </Paper>
            </Box>
        );
    }

    return content;
};

ErrorState.propTypes = {
    message: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    retry: PropTypes.func,
    retryText: PropTypes.string,
    showIcon: PropTypes.bool,
    fullPage: PropTypes.bool,
    sx: PropTypes.object
};

export default ErrorState; 