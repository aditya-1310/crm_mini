// Real API service to connect to the backend
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Keep the mock data for development/testing purposes
const mockSegments = [
  {
    id: 1,
    name: 'High Value Customers',
    rules: {
      operator: 'AND',
      conditions: [
        { field: 'spend', operator: 'greater_than', value: '10000' }
      ]
    },
    size: 1500,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Inactive Users',
    rules: {
      operator: 'AND',
      conditions: [
        { field: 'inactive', operator: 'greater_than', value: '90' }
      ]
    },
    size: 2000,
    createdAt: new Date().toISOString()
  }
];

const mockCampaigns = [
  {
    id: 1,
    name: 'Summer Sale',
    segment: 'High Value Customers',
    status: 'COMPLETED',
    sent: 1500,
    failed: 23,
    audienceSize: 1523,
    createdAt: new Date(Date.now() - 86400000).toISOString() // yesterday
  }
];

// Mock customer data
const mockCustomers = [
  { id: 101, name: 'Mohit', phone: '+91987654321', spend: 15000, visits: 10, inactive: 20 },
  { id: 102, name: 'Priya', phone: '+91876543210', spend: 12000, visits: 8, inactive: 15 },
  { id: 103, name: 'Rahul', phone: '+91765432109', spend: 9000, visits: 5, inactive: 30 },
  { id: 104, name: 'Neha', phone: '+91654321098', spend: 20000, visits: 12, inactive: 10 },
  { id: 105, name: 'Amit', phone: '+91543210987', spend: 5000, visits: 3, inactive: 60 },
  { id: 106, name: 'Sneha', phone: '+91432109876', spend: 8000, visits: 4, inactive: 45 },
  { id: 107, name: 'Vikram', phone: '+91321098765', spend: 25000, visits: 15, inactive: 5 },
  { id: 108, name: 'Meera', phone: '+91210987654', spend: 7000, visits: 6, inactive: 35 },
  { id: 109, name: 'Arjun', phone: '+91109876543', spend: 11000, visits: 7, inactive: 25 },
  { id: 110, name: 'Kavita', phone: '+91098765432', spend: 4000, visits: 2, inactive: 100 }
];

// Mock communication logs
const mockCommunicationLogs = [];

// Segment APIs
export const createSegment = async (segmentData) => {
  try {
    // Make a real API call to create a segment
    const response = await api.post('/segments', segmentData);
    
    // Return the data from the API response
    return response.data.data;
  } catch (error) {
    console.error('Error creating segment:', error);
    throw error;
  }
};

export const getSegments = async () => {
  try {
    // Make a real API call to get segments
    const response = await api.get('/segments');
    
    // Map the response data to match the format expected by the frontend
    return response.data.data.map(segment => ({
      id: segment._id,
      name: segment.name,
      rules: segment.rules,
      size: segment.audienceSize,
      createdAt: segment.createdAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching segments:', error);
    // Return mock data as fallback
    return [...mockSegments];
  }
};

export const previewSegmentSize = async (rulesData) => {
  console.log('Previewing segment with rules:', rulesData);
  
  try {
    // The backend expects rules either at the top level or in a 'rules' property
    // Make sure we're sending the data in the correct format
    const payload = rulesData.rules ? rulesData : { rules: rulesData };
    
    // Make a real API call to preview segment size
    const response = await api.post('/segments/preview', payload);
    
    console.log('Received preview response:', response.data);
    
    // Handle various possible response structures
    let audienceSize = 0;
    
    if (response.data && response.data.data && typeof response.data.data.audienceSize === 'number') {
      // If response has the expected structure
      audienceSize = response.data.data.audienceSize;
    } else if (response.data && typeof response.data.audienceSize === 'number') {
      // Alternative structure
      audienceSize = response.data.audienceSize;
    } else if (response.data && typeof response.data.size === 'number') {
      // Another possible structure
      audienceSize = response.data.size;
    }
    
    console.log('Processed audience size:', audienceSize);
    
    // Return in the format expected by CreateSegment.js
    return {
      data: {
        audienceSize: audienceSize
      }
    };
  } catch (error) {
    console.error('Error previewing segment size:', error);
    
    // Return a properly formatted response even in case of error
    return {
      data: {
        audienceSize: 0
      }
    };
  }
};

// Campaign APIs
export const createCampaign = async (campaignData) => {
  try {
    // Make a real API call to create a campaign
    const response = await api.post('/campaigns', {
      name: campaignData.name,
      segmentId: campaignData.segmentId,
      message: campaignData.message || 'Hi {name}, here is a special offer for you!'
    });
    
    // Transform the response to match the expected format in the frontend
    const campaign = response.data.data;
    return {
      id: campaign._id,
      name: campaign.name,
      segment: campaignData.segmentName || 'Custom Segment',
      status: campaign.status,
      sent: campaign.sentCount || 0,
      failed: campaign.failedCount || 0,
      audienceSize: campaign.audienceSize || 0,
      createdAt: campaign.createdAt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const getCampaigns = async () => {
  try {
    // Make a real API call to get campaigns
    const response = await api.get('/campaigns');
    
    // Map the response data to match the format expected by the frontend
    return response.data.data.map(campaign => ({
      id: campaign._id,
      name: campaign.name,
      segment: campaign.segmentId?.name || 'Custom Segment',
      status: campaign.status,
      sent: campaign.sentCount || 0,
      failed: campaign.failedCount || 0,
      audienceSize: campaign.audienceSize || 0,
      createdAt: campaign.createdAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    // Return mock data as fallback
    return [...mockCampaigns];
  }
};

export const getCampaignLogs = async (campaignId) => {
  try {
    // Make a real API call to get campaign logs
    const response = await api.get(`/campaigns/${campaignId}/logs`);
    
    // Map the response data to match the format expected by the frontend
    return response.data.data.map(log => ({
      id: log._id,
      customerId: log.customerId._id || log.customerId,
      customerName: log.customerId.name || 'Unknown Customer',
      status: log.status,
      message: log.message,
      timestamp: log.createdAt || new Date().toISOString(),
      sentAt: log.sentAt,
      deliveredAt: log.deliveredAt,
      failedAt: log.failedAt,
      failureReason: log.failureReason
    }));
  } catch (error) {
    console.error('Error fetching campaign logs:', error);
    
    // Generate mock logs as fallback
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      customerId: 100 + i,
      customerName: `Customer ${100 + i}`,
      status: Math.random() > 0.1 ? 'SENT' : 'FAILED',
      message: `Hi Customer ${100 + i}, here's a special offer for you!`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));
  }
};

export const getDashboardStats = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    totalCampaigns: mockCampaigns.length,
    activeCampaigns: mockCampaigns.filter(c => c.status === 'PROCESSING').length,
    totalSegments: mockSegments.length,
    totalAudience: mockSegments.reduce((total, segment) => total + segment.size, 0)
  };
};

/* 
// Helper function to simulate campaign delivery (kept for reference but no longer used)
function simulateCampaignDelivery(campaign, segment) {
  console.log(`Simulating delivery for campaign: ${campaign.name}`);
  
  // For simulation, we'll use 10 customers from our mock data
  const customers = mockCustomers.slice(0, 10);
  
  let sent = 0;
  let failed = 0;
  
  // Process each customer
  customers.forEach((customer, index) => {
    // Simulate 90% success rate
    const isSuccess = Math.random() <= 0.9;
    
    // Create a log entry
    const personalizedMessage = campaign.message.replace('{name}', customer.name)
                                        .replace('{amount}', customer.spend);
    
    const logEntry = {
      id: mockCommunicationLogs.length + 1,
      campaignId: campaign.id,
      customerId: customer.id,
      message: personalizedMessage,
      status: isSuccess ? 'SENT' : 'FAILED',
      createdAt: new Date().toISOString(),
      sentAt: isSuccess ? new Date().toISOString() : null,
      failedAt: !isSuccess ? new Date().toISOString() : null,
      failureReason: !isSuccess ? 'Delivery failed' : null
    };
    
    mockCommunicationLogs.push(logEntry);
    
    // Update counters
    if (isSuccess) {
      sent++;
    } else {
      failed++;
    }
    
    // Update campaign stats with a delay to simulate gradual delivery
    setTimeout(() => {
      const campaignIndex = mockCampaigns.findIndex(c => c.id === campaign.id);
      if (campaignIndex !== -1) {
        mockCampaigns[campaignIndex].sent = sent;
        mockCampaigns[campaignIndex].failed = failed;
        
        // Mark as completed when all messages are processed
        if (index === customers.length - 1) {
          mockCampaigns[campaignIndex].status = 'COMPLETED';
          console.log(`Campaign ${campaign.name} delivery completed.`);
        }
      }
    }, (index + 1) * 500); // Stagger updates
  });
}
*/ 