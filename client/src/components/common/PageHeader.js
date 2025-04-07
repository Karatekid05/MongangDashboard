import React from 'react';
import {
    Box,
    Typography,
    Breadcrumbs,
    Link as MuiLink,
    Avatar,
    Paper
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * PageHeader - A reusable component for page headers with breadcrumbs
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the page
 * @param {string} [props.description] - Optional description text
 * @param {Function} [props.icon] - Icon component to display
 * @param {Array} [props.breadcrumbs] - Array of breadcrumb objects { label, href }
 * @param {Object} [props.actions] - Optional actions/buttons to display in header
 * @param {Object} [props.sx] - Additional MUI sx styles
 */
const PageHeader = ({
    title,
    description,
    icon: Icon,
    actions,
    breadcrumbs = [],
    sx = {}
}) => {
    return (
        <Box
            sx={{
                mb: 4,
                ...sx
            }}
        >
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <MuiLink
                        component={RouterLink}
                        to="/"
                        color="inherit"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none'
                        }}
                    >
                        <HomeIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
                        Home
                    </MuiLink>
                    {breadcrumbs.map((crumb, index) => {
                        // Verifique se é o último (atual)
                        const isLast = index === breadcrumbs.length - 1;

                        // Para o último item, apenas exibe o texto sem link
                        if (isLast) {
                            return (
                                <Typography key={index} color="text.primary">
                                    {crumb.label}
                                </Typography>
                            );
                        }

                        // Para os demais, exibe como link
                        return (
                            <MuiLink
                                key={index}
                                component={RouterLink}
                                to={crumb.href || "#"}
                                color="inherit"
                                sx={{ textDecoration: 'none' }}
                            >
                                {crumb.label}
                            </MuiLink>
                        );
                    })}
                </Breadcrumbs>
            )}

            {/* Header Content */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        sm: 'center'
                    },
                    flexDirection: {
                        xs: 'column',
                        sm: 'row'
                    },
                    gap: {
                        xs: 2,
                        sm: 0
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {Icon && (
                        <Avatar
                            sx={{
                                mr: 2,
                                bgcolor: 'primary.main',
                                width: 48,
                                height: 48
                            }}
                        >
                            <Icon fontSize="medium" />
                        </Avatar>
                    )}

                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                            {title}
                        </Typography>

                        {description && (
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                                {description}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {actions && (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            alignSelf: {
                                xs: 'flex-start',
                                sm: 'center'
                            },
                            width: {
                                xs: '100%',
                                sm: 'auto'
                            }
                        }}
                    >
                        {actions}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.elementType,
    breadcrumbs: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            href: PropTypes.string.isRequired
        })
    ),
    actions: PropTypes.node,
    sx: PropTypes.object
};

export default PageHeader; 