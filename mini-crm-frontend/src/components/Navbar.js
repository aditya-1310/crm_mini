import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Mini CRM
        </Typography>
        
        {currentUser ? (
          <>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" component={RouterLink} to="/">
                Dashboard
              </Button>
              <Button color="inherit" component={RouterLink} to="/segments">
                Segments
              </Button>
              <Button color="inherit" component={RouterLink} to="/campaigns">
                Campaigns
              </Button>
            </Box>
            
            <Box sx={{ ml: 2 }}>
              <Tooltip title={currentUser.displayName || currentUser.email}>
                <IconButton
                  onClick={handleMenu}
                  color="inherit"
                  size="small"
                  sx={{ ml: 2 }}
                >
                  {currentUser.photoURL ? (
                    <Avatar 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </Avatar>
                  )}
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
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
                <MenuItem disabled>
                  {currentUser.displayName || currentUser.email}
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 