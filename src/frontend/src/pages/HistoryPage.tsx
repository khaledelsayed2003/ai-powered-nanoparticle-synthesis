import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, Divider, CircularProgress } from '@mui/material'; // Import CircularProgress
import { usePrediction } from '../context/PredictionContext'; // Import usePrediction hook

const HistoryPage: React.FC = () => {
  const { predictions, loadingHistory } = usePrediction(); // Get predictions and loadingHistory from context

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Prediction History
      </Typography>
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
              {predictions.map((prediction, index) => (
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
                            ID: {prediction.id}
                          </Typography>
                          {' — '}
                          {new Date(prediction.created_at).toLocaleString()}
                        </>
                      }
                    />
                  </ListItem>
                  {index < predictions.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )
        )}
      </Paper>
    </Box>
  );
};
export default HistoryPage;