import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Themes
import { lightTheme, darkTheme } from './theme';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import GangList from './pages/gangs/GangList';
import GangDetail from './pages/gangs/GangDetail';
import UserList from './pages/users/UserList';
import UserDetail from './pages/users/UserDetail';
import Leaderboard from './pages/leaderboard/Leaderboard';
import ActivityPage from './pages/activity/ActivityPage';
import Help from './pages/Help';
import NotFound from './pages/NotFound';

function App() {
  // Get theme preference from localStorage or default to 'dark'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'dark';
  });

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Add theme class to body
  useEffect(() => {
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(`${mode}-mode`);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout toggleTheme={toggleTheme} isDarkMode={mode === 'dark'} />}>
            <Route index element={<Home />} />
            <Route path="gangs" element={<GangList />} />
            <Route path="gangs/:id" element={<GangDetail />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
