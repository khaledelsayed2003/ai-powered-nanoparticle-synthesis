import React, { useState, type ChangeEvent, type DragEvent } from 'react';
import { Box, Button, Typography, Paper, Grid, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HighlightOffIcon from '@mui/icons-material/HighlightOff'; // Import for remove button

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
}

// Expected image dimensions for the ML model
const EXPECTED_IMAGE_SIZE = { width: 480, height: 480 };

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (e.g., PNG, JPG).');
        setSelectedFile(null);
        setPreviewUrl(null);
        onImageSelect(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelect(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      onImageSelect(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    processFile(file);
    // Clear the input value to allow selecting the same file again after removal
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    processFile(null); // Clear all selection and related states
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files ? event.dataTransfer.files[0] : null;
    processFile(file);
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Upload (SEM or TEM) Image for Prediction
      </Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3} direction="column" alignItems="center">
          {/* Image Preview and Drop Zone */}
          <Grid item>
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={(theme) => ({
                width: EXPECTED_IMAGE_SIZE.width,
                height: EXPECTED_IMAGE_SIZE.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDragOver 
                  ? (theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700])
                  : (theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900]),
                border: isDragOver 
                  ? `2px dashed ${theme.palette.primary.main}` 
                  : `1px dashed ${theme.palette.divider}`,
                borderRadius: '4px',
                overflow: 'hidden',
                transition: 'background-color 0.3s, border 0.3s',
              })}
            >
              {previewUrl ? (
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Image Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  {isDragOver ? 'Drop the image here' : 'Drag & Drop or Click to Upload'}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* File input, button, and remove button */}
          <Grid item>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ height: '56px', width: '200px' }}
              >
                Choose Image
              </Button>
            </label>
            {selectedFile && (
                <IconButton
                    color="error"
                    onClick={handleRemoveImage}
                    aria-label="remove image"
                    sx={{ ml: 1 }}
                >
                    <HighlightOffIcon />
                </IconButton>
            )}
          </Grid>

          {/* Selected file name and error */}
          <Grid item>
            {selectedFile && (
              <Typography variant="body1" align="center" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
            {error && (
              <Typography color="error" align="center" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ImageUpload;