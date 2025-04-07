import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Button,
    useMediaQuery,
    useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Gangs', path: '/gangs' },
        { name: 'Users', path: '/users' },
        { name: 'Leaderboard', path: '/leaderboard' },
        { name: 'Activity', path: '/activity' },
    ];

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Mongang Dashboard
                </Typography>

                {isMobile ? (
                    <Box>
                        <IconButton
                            size="large"
                            edge="end"
                            color="inherit"
                            aria-label="menu"
                            onClick={handleMenu}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {navItems.map((item) => (
                                <MenuItem
                                    key={item.path}
                                    component={Link}
                                    to={item.path}
                                    onClick={handleClose}
                                    selected={location.pathname === item.path}
                                >
                                    {item.name}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex' }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.path}
                                component={Link}
                                to={item.path}
                                color="inherit"
                                sx={{
                                    mx: 1,
                                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none'
                                }}
                            >
                                {item.name}
                            </Button>
                        ))}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 