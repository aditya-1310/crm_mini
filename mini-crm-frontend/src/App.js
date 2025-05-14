import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateSegment from './pages/CreateSegment';
import Segments from './pages/Segments';
import CreateCampaign from './pages/CreateCampaign';
import Campaigns from './pages/Campaigns';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/segments" 
              element={
                <PrivateRoute>
                  <Segments />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/segments/create" 
              element={
                <PrivateRoute>
                  <CreateSegment />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/campaigns" 
              element={
                <PrivateRoute>
                  <Campaigns />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/campaigns/create" 
              element={
                <PrivateRoute>
                  <CreateCampaign />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
