import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Segment APIs
export const createSegment = async (segmentData) => {
  try {
    const response = await api.post('/segments', segmentData);
    return response.data;
  } catch (error) {
    console.error('Create segment error:', error);
    throw error.response?.data || error.message;
  }
};

export const getSegments = async () => {
  try {
    const response = await api.get('/segments');
    return response.data;
  } catch (error) {
    console.error('Get segments error:', error);
    throw error.response?.data || error.message;
  }
};

export const previewSegmentSize = async (rules) => {
  try {
    const response = await api.post('/segments/preview', { rules });
    return response.data;
  } catch (error) {
    console.error('Preview segment error:', error);
    throw error.response?.data || error.message;
  }
};

// Campaign APIs
export const createCampaign = async (campaignData) => {
  try {
    const response = await api.post('/campaigns', campaignData);
    return response.data;
  } catch (error) {
    console.error('Create campaign error:', error);
    throw error.response?.data || error.message;
  }
};

export const getCampaigns = async () => {
  try {
    const response = await api.get('/campaigns');
    return response.data;
  } catch (error) {
    console.error('Get campaigns error:', error);
    throw error.response?.data || error.message;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    throw error.response?.data || error.message;
  }
}; 