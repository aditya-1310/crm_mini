import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createCampaign, getSegments } from '../services/mockApi';
import HelpIcon from '@mui/icons-material/Help';

function CreateCampaign() {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [message, setMessage] = useState('');
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Template variables that can be used in messages
  const templateVariables = [
    { name: '{name}', description: 'Customer name' },
    { name: '{amount}', description: 'Customer spent amount' }
  ];

  // Insert template variable at cursor position
  const insertVariable = (variable) => {
    setMessage((prev) => prev + variable);
  };

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const data = await getSegments();
        setSegments(data);
      } catch (err) {
        setError('Failed to load segments');
      }
    };
    fetchSegments();
  }, []);

  const handleSave = async () => {
    if (!campaignName.trim()) {
      setError('Please enter a campaign name');
      return;
    }

    if (!selectedSegment) {
      setError('Please select a segment');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a campaign message');
      return;
    }

    if (!message.includes('{name}')) {
      setError('Your message must include at least the {name} variable');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createCampaign({
        name: campaignName,
        segmentId: selectedSegment,
        message: message.trim(),
      });
      setSuccess('Campaign created successfully!');
      setTimeout(() => {
        navigate('/campaigns');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Campaign
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Campaign Name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
              error={!campaignName.trim()}
              helperText={!campaignName.trim() ? 'Campaign name is required' : ''}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required error={!selectedSegment}>
              <InputLabel>Select Segment</InputLabel>
              <Select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                label="Select Segment"
              >
                {segments.map((segment) => (
                  <MenuItem key={segment.id} value={segment.id}>
                    {segment.name} ({segment.size} users)
                  </MenuItem>
                ))}
              </Select>
              {!selectedSegment && (
                <Typography color="error" variant="caption">
                  Please select a segment
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Typography variant="body2">Template Variables:</Typography>
              <Tooltip title="Insert these variables into your message. They'll be replaced with actual customer data.">
                <HelpIcon fontSize="small" color="info" />
              </Tooltip>
            </Stack>
            <Box sx={{ mb: 2 }}>
              {templateVariables.map((variable) => (
                <Chip
                  key={variable.name}
                  label={variable.name}
                  onClick={() => insertVariable(variable.name)}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  clickable
                />
              ))}
            </Box>

            <TextField
              fullWidth
              label="Campaign Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              required
              error={!message.trim() || !message.includes('{name}')}
              helperText={
                !message.trim()
                  ? 'Campaign message is required'
                  : !message.includes('{name}')
                  ? 'Message must include the {name} variable'
                  : 'Enter your message with personalization variables'
              }
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Example: "Hi {'{name}'}, here's 10% off on your next order!"
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/campaigns')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || !campaignName.trim() || !selectedSegment || !message.trim() || !message.includes('{name}')}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Campaign'}
          </Button>
        </Box>

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar 
          open={!!success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess('')}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default CreateCampaign; 