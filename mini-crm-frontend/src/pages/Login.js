import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  CircularProgress 
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { currentUser, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/" />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mini CRM
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom color="textSecondary">
          Sign in to continue
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', my: 2 }}>{error}</Alert>}
        
        <Box sx={{ mt: 3, width: '100%' }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign in with Google'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login; 