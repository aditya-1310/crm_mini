import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { createSegment, previewSegmentSize } from '../services/mockApi';

const OPERATORS = {
  spend: ['greater_than', 'less_than', 'equals'],
  visits: ['greater_than', 'less_than', 'equals'],
  inactive: ['greater_than', 'less_than', 'equals'],
};

const INITIAL_RULE = {
  field: 'spend',
  operator: 'greater_than',
  value: '',
};

function CreateSegment() {
  const navigate = useNavigate();
  const [segmentName, setSegmentName] = useState('');
  const [rules, setRules] = useState([{ ...INITIAL_RULE }]);
  const [logicOperator, setLogicOperator] = useState('AND');
  const [previewSize, setPreviewSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddRule = () => {
    setRules([...rules, { ...INITIAL_RULE }]);
  };

  const handleRemoveRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await previewSegmentSize({
        rules: {
          operator: logicOperator,
          conditions: rules
        }
      });
      setPreviewSize(response.data.audienceSize);
    } catch (err) {
      setError(err.message || 'Failed to preview segment size');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!segmentName.trim()) {
      setError('Please enter a segment name');
      return;
    }

    if (rules.some(rule => !rule.value)) {
      setError('Please fill in all rule values');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createSegment({
        name: segmentName,
        rules: {
          operator: logicOperator,
          conditions: rules
        }
      });
      setSuccess('Segment created successfully!');
      setTimeout(() => {
        navigate('/segments');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create segment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Segment
        </Typography>
        
        <TextField
          fullWidth
          label="Segment Name"
          value={segmentName}
          onChange={(e) => setSegmentName(e.target.value)}
          margin="normal"
          error={!segmentName.trim()}
          helperText={!segmentName.trim() ? 'Segment name is required' : ''}
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Rules
          </Typography>
          
          <FormControl sx={{ mb: 2 }}>
            <InputLabel>Logic Operator</InputLabel>
            <Select
              value={logicOperator}
              onChange={(e) => setLogicOperator(e.target.value)}
              label="Logic Operator"
            >
              <MenuItem value="AND">AND</MenuItem>
              <MenuItem value="OR">OR</MenuItem>
            </Select>
          </FormControl>

          {rules.map((rule, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select
                    value={rule.field}
                    onChange={(e) => handleRuleChange(index, 'field', e.target.value)}
                    label="Field"
                  >
                    <MenuItem value="spend">Spend</MenuItem>
                    <MenuItem value="visits">Visits</MenuItem>
                    <MenuItem value="inactive">Inactive Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel>Operator</InputLabel>
                  <Select
                    value={rule.operator}
                    onChange={(e) => handleRuleChange(index, 'operator', e.target.value)}
                    label="Operator"
                  >
                    {OPERATORS[rule.field].map((op) => (
                      <MenuItem key={op} value={op}>
                        {op.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Value"
                  value={rule.value}
                  onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
                  error={!rule.value}
                  helperText={!rule.value ? 'Value is required' : ''}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveRule(index)}
                  disabled={rules.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddRule}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Add Rule
          </Button>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            onClick={handlePreview}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Preview Size'}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={loading || !segmentName.trim() || rules.some(rule => !rule.value)}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Segment'}
          </Button>
        </Box>

        {previewSize > 0 && (
          <Typography sx={{ mt: 2 }} color="primary">
            Estimated audience size: {previewSize} users
          </Typography>
        )}

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

export default CreateSegment; 