import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getPredictionHistory } from '../services/predictionService'; // Import getPredictionHistory
import { useAuth } from './AuthContext'; // Import useAuth to get isAuthenticated state
import { useSnackbar } from './SnackbarContext'; // To show feedback

interface PredictionResult {
  predicted_mean_size_nm: number; // Changed from mean_size_nm
  id: number;
  created_at: string;
  image_url?: string;
}

interface PredictionContextType {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (errorMessage: string | null) => void;
  predictions: PredictionResult[];
  addPrediction: (prediction: PredictionResult) => void;
  loadingHistory: boolean; // New state for history loading
  clearPredictions: () => void; // New function to clear predictions on logout
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true); // Initially true

  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext
  const { showSnackbar } = useSnackbar();

  // Function to add a new prediction (from upload page)
  const addPrediction = (prediction: PredictionResult) => {
    setPredictions((prevPredictions) => [prediction, ...prevPredictions]);
  };

  // Function to clear all predictions (e.g., on logout)
  const clearPredictions = () => {
    setPredictions([]);
  };

  // Effect to fetch history when user authenticates or on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (isAuthenticated) {
        setLoadingHistory(true);
        try {
          const history = await getPredictionHistory();
          setPredictions(history);
        } catch (err: any) {
          console.error('Failed to fetch prediction history:', err);
          showSnackbar('Failed to load prediction history.', 'error');
        } finally {
          setLoadingHistory(false);
        }
      } else {
        // Clear predictions if user is not authenticated
        setPredictions([]);
        setLoadingHistory(false); // No history to load if not authenticated
      }
    };

    fetchHistory();
  }, [isAuthenticated, showSnackbar]); // Re-run when authentication status changes

  return (
    <PredictionContext.Provider
      value={{
        loading,
        setLoading,
        error,
        setError,
        predictions,
        addPrediction,
        loadingHistory,
        clearPredictions,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return context;
};
