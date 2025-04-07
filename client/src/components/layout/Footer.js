import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
    // Use static year instead of Date to avoid any date-related issues
    const currentYear = 2023;

    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'© '}
                        {currentYear}
                        {' Mongang Dashboard. All rights reserved.'}
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            mt: { xs: 2, sm: 0 }
                        }}
                    >
                        <Link
                            color="inherit"
                            href="https://github.com/Karatekid05/MongangDashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </Link>
                        <Link
                            color="inherit"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Back to Top
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer; 