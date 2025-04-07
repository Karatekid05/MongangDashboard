import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <ErrorOutlineIcon
          color="primary"
          sx={{ fontSize: 100, mb: 2 }}
        />
        
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: 480 }}
        >
          Sorry, we couldn't find the page you're looking for. Perhaps you've mistyped the URL or the page has been moved.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 