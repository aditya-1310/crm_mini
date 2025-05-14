import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItem,
  ListItemText,
  List,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import { getCampaigns, getCampaignLogs } from '../services/mockApi';

function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignLogs, setCampaignLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();

    // Auto-refresh every 5 seconds if there are processing campaigns
    const interval = setInterval(() => {
      if (campaigns.some(c => c.status === 'PROCESSING')) {
        setRefreshCount(prev => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshCount, campaigns.some(c => c.status === 'PROCESSING')]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewLogs = async (campaign) => {
    try {
      setSelectedCampaign(campaign);
      setOpenDialog(true);
      setLogsLoading(true);
      const logs = await getCampaignLogs(campaign.id);
      setCampaignLogs(logs);
    } catch (error) {
      console.error('Error fetching campaign logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const getDeliveryProgress = (campaign) => {
    if (campaign.audienceSize === 0) return 0;
    return Math.round(((campaign.sent + campaign.failed) / campaign.audienceSize) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PROCESSING':
        return 'info';
      case 'ERROR':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Campaigns</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/campaigns/create')}
        >
          Create Campaign
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Segment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Sent</TableCell>
                <TableCell align="right">Failed</TableCell>
                <TableCell align="right">Audience Size</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.segment}</TableCell>
                  <TableCell>
                    <Chip
                      label={campaign.status}
                      color={getStatusColor(campaign.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{campaign.sent}</TableCell>
                  <TableCell align="right">{campaign.failed}</TableCell>
                  <TableCell align="right">{campaign.audienceSize}</TableCell>
                  <TableCell>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getDeliveryProgress(campaign)} 
                        color={campaign.status === 'ERROR' ? 'error' : 'primary'}
                      />
                      <Typography variant="body2" color="text.secondary" align="center">
                        {getDeliveryProgress(campaign)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleViewLogs(campaign)}
                    >
                      <InfoIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delivery Logs Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Communication Logs: {selectedCampaign?.name}
        </DialogTitle>
        <DialogContent dividers>
          {logsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : campaignLogs.length === 0 ? (
            <Typography>No logs available for this campaign.</Typography>
          ) : (
            <List>
              {campaignLogs.map((log) => (
                <ListItem key={log.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1">{log.message}</Typography>
                        <Chip 
                          label={log.status} 
                          color={log.status === 'SENT' ? 'success' : 'error'} 
                          size="small" 
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          Customer ID: {log.customerId}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {log.status === 'SENT' 
                            ? `Delivered at: ${formatDate(log.sentAt)}` 
                            : `Failed at: ${formatDate(log.failedAt)} - Reason: ${log.failureReason}`}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Campaigns; 