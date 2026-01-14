import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, Divider, CircularProgress, Button, Collapse, TextField, Grid, IconButton, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { usePrediction } from '../context/PredictionContext';
import type { HistoryFilters } from '../services/predictionService';

const HistoryPage: React.FC = () => {
  const { predictions, loadingHistory, setFilters } = usePrediction();
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<HistoryFilters>({});

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Allow empty string to clear the filter
    setFilterValues(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
  };

  const handleDateFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Allow empty string to clear the filter, otherwise keep as string for date input
    setFilterValues(prev => ({ ...prev, [name]: value === '' ? undefined : value }));
  };

  const handleSizeIncrement = (name: 'min_size' | 'max_size') => {
    setFilterValues(prev => {
      const currentValue = prev[name] ? parseFloat(String(prev[name])) : 0;
      return { ...prev, [name]: (currentValue + 0.1).toFixed(1) };
    });
  };

  const handleSizeDecrement = (name: 'min_size' | 'max_size') => {
    setFilterValues(prev => {
      const currentValue = prev[name] ? parseFloat(String(prev[name])) : 0;
      const newValue = currentValue - 0.1;
      return { ...prev, [name]: (newValue < 0 ? 0 : newValue).toFixed(1) };
    });
  };

  const applyFilters = () => {
    setFilters(filterValues);
  };

  const clearFilters = () => {
    setFilterValues({});
    setFilters({});
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Prediction History
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>

      <Collapse in={showFilters}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Min Size (nm)"
                name="min_size"
                type="text" // Use text to hide default number spinners
                value={filterValues.min_size === undefined ? '' : filterValues.min_size}
                onChange={handleFilterChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        onClick={() => handleSizeDecrement('min_size')}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleSizeIncrement('min_size')}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Max Size (nm)"
                name="max_size"
                type="text" // Use text to hide default number spinners
                value={filterValues.max_size === undefined ? '' : filterValues.max_size}
                onChange={handleFilterChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        onClick={() => handleSizeDecrement('max_size')}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleSizeIncrement('max_size')}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Start Date"
                name="start_date"
                type="date"
                value={filterValues.start_date || ''}
                onChange={handleDateFilterChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="End Date"
                name="end_date"
                type="date"
                value={filterValues.end_date || ''}
                onChange={handleDateFilterChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} container spacing={2} justifyContent="flex-end">
              <Grid item>
                <Button variant="outlined" onClick={clearFilters}>
                  Clear
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={applyFilters}>
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      <Paper elevation={3} sx={{ p: 3 }}>
        {loadingHistory ? ( // Display loading indicator if history is loading
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          predictions.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No past predictions available. Make a prediction on the Upload page.
            </Typography>
          ) : (
            <List>
              {predictions.map((prediction, index) => {
                // Use user_prediction_id from the backend, fallback to id if not available (shouldn't happen with updated backend)
                const displayId = prediction.user_prediction_id ?? prediction.id;
                return (
                  <React.Fragment key={prediction.id}>
                    <ListItem alignItems="flex-start">
                      {prediction.image_url && (
                        <Box
                          component="img"
                          src={prediction.image_url}
                          alt="Prediction"
                          sx={{ width: 50, height: 50, mr: 2, borderRadius: 1, objectFit: 'cover' }}
                        />
                      )}
                      <ListItemText
                        primary={`Predicted Mean Size: ${prediction.predicted_mean_size_nm.toFixed(2)} nm`}
                        secondary={
                          <>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              ID: {displayId}
                            </Typography>
                            {' — '}
                            {new Date(prediction.created_at).toLocaleString()}
                          </>
                        }
                      />
                    </ListItem>
                    {index < predictions.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          )
        )}
      </Paper>
    </Box>
  );
};
export default HistoryPage;