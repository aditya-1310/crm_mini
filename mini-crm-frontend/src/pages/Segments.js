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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { getSegments } from '../services/mockApi';

function Segments() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const data = await getSegments();
        setSegments(data);
      } catch (error) {
        console.error('Error fetching segments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRules = (rules) => {
    if (!rules || !rules.conditions) return '';
    
    const conditionTexts = rules.conditions.map(condition => {
      const operatorText = condition.operator.replace('_', ' ');
      return `${condition.field} ${operatorText} ${condition.value}`;
    });
    
    return conditionTexts.join(` ${rules.operator} `);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Segments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/segments/create')}
        >
          Create Segment
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
                <TableCell>Segment Name</TableCell>
                <TableCell>Rules</TableCell>
                <TableCell align="right">Audience Size</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {segments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell>{segment.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatRules(segment.rules)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{segment.size}</TableCell>
                  <TableCell>{formatDate(segment.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default Segments; 