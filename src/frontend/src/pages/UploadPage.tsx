import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import { Box, Button, CircularProgress, Typography, Card, CardContent, Skeleton, Grid } from '@mui/material';
import { predictMeanSize } from '../services/predictionService';
import { usePrediction } from '../context/PredictionContext';
import { useSnackbar } from '../context/SnackbarContext';

interface PredictionResult {
  predicted_mean_size_nm: number; // Changed from mean_size_nm
  id: number;
  created_at: string;
}

const UploadPage: React.FC = () => {
  const { setLoading, setError, addPrediction, loading } = usePrediction();
  const { showSnackbar } = useSnackbar();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentPredictionResult, setCurrentPredictionResult] = useState<PredictionResult | null>(null);

  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file);
    setCurrentPredictionResult(null);
    setError(null);
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      showSnackbar('Please select an image first.', 'warning');
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentPredictionResult(null);

    try {
      const result = await predictMeanSize(selectedImage);
      setCurrentPredictionResult(result);
      addPrediction(result);
      showSnackbar('Prediction successful!', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred during prediction.';
      showSnackbar(errorMessage, 'error');
      setError(errorMessage);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box>
      <Grid container spacing={3} justifyContent="center" alignItems="center"> {/* Simplified Grid for single column */}
        <Grid xs={12} md={8} lg={6}> {/* Adjusted size for a single main column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ImageUpload onImageSelect={handleImageSelect} />
            <Button
              variant="contained"
              color="primary"
              onClick={handlePredict}
              disabled={!selectedImage || loading}
              size="large"
              sx={{ mt: 3, width: '200px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Predict Mean Size'}
            </Button>

            {/* Prediction Result / Skeleton now directly below the button */}
            {(loading && !currentPredictionResult) && (
              <Card sx={{ mt: 3, p: 2, width: '100%' }}>
                <CardContent>
                  <Skeleton variant="text" sx={{ fontSize: '2rem' }} width="60%" />
                  <Skeleton variant="text" sx={{ fontSize: '1.2rem' }} width="80%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="50%" />
                </CardContent>
              </Card>
            )}

            {currentPredictionResult && (
              <Card sx={{ mt: 3, p: 2, width: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    Prediction Result
                  </Typography>
                  <Typography variant="body1">
                    <strong>Predicted Mean Size:</strong> {currentPredictionResult.predicted_mean_size_nm.toFixed(2)} nm
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prediction ID: {currentPredictionResult.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Timestamp: {new Date(currentPredictionResult.created_at).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UploadPage;