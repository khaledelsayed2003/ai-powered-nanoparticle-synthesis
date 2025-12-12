import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Assuming Django backend runs on port 8000

interface PredictionResult {
  predicted_mean_size_nm: number; // Changed from mean_size_nm
  id: number;
  created_at: string;
  image_url?: string; // Add this line
}

export const predictMeanSize = async (imageFile: File): Promise<PredictionResult> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post<PredictionResult>(
      `${API_BASE_URL}/predict/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Prediction API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to get prediction from API.');
    } else {
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred during prediction.');
    }
  }
};

export const getPredictionImageUrl = (predictionId: number): string => {
  return `${API_BASE_URL}/images/${predictionId}/`;
};

export const getPredictionHistory = async (): Promise<PredictionResult[]> => {
  try {
    const response = await axios.get<PredictionResult[]>(`${API_BASE_URL}/history/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Prediction History API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to fetch prediction history.');
    } else {
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred while fetching prediction history.');
    }
  }
};
