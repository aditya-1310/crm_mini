import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getCampaigns } from '../services/mockApi';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSegments: 0,
    totalAudience: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, campaignsData] = await Promise.all([
          getDashboardStats(),
          getCampaigns(),
        ]);
        
        setStats(statsData);
        setRecentCampaigns(campaignsData.slice(0, 2)); // Get only 2 most recent campaigns
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Campaigns
                </Typography>
                <Typography variant="h4">{stats.totalCampaigns}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Campaigns
                </Typography>
                <Typography variant="h4">{stats.activeCampaigns}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Segments
                </Typography>
                <Typography variant="h4">{stats.totalSegments}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Audience
                </Typography>
                <Typography variant="h4">{stats.totalAudience}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Campaigns */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Campaigns
              </Typography>
              <Grid container spacing={2}>
                {recentCampaigns.map((campaign) => (
                  <Grid item xs={12} sm={6} key={campaign.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{campaign.name}</Typography>
                        <Typography color="textSecondary">
                          Status: {campaign.status}
                        </Typography>
                        <Typography>
                          Sent: {campaign.sent} | Failed: {campaign.failed}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default Dashboard; 