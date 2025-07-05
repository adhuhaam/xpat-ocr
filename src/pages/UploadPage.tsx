import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import FileUpload from '../components/FileUpload';
import PassportPreview from '../components/PassportPreview';
import { passportAPI } from '../services/api';
import { PassportData, ExtractedData } from '../types/passport';
import { useNavigate } from 'react-router-dom';

const steps = ['Upload Document', 'Review & Edit', 'Confirm & Save'];

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const response = await passportAPI.uploadAndExtract(file);
      
      if (response.success) {
        setExtractedData(response.data);
        setActiveStep(1);
      } else {
        setError('Failed to extract passport information');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during processing');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (data: PassportData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await passportAPI.savePassport(data);
      
      if (response.success) {
        setSuccess(true);
        setActiveStep(2);
        setTimeout(() => {
          navigate('/passports');
        }, 2000);
      } else {
        setError('Failed to save passport data');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setExtractedData(null);
    setActiveStep(0);
    setError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Upload Passport Document
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box>
            <Typography variant="body1" color="text.secondary" paragraph align="center">
              Upload a passport document (image or PDF) to extract information automatically using OCR technology.
            </Typography>
            <FileUpload onFileSelect={handleFileSelect} loading={loading} />
          </Box>
        )}

        {activeStep === 1 && extractedData && (
          <Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              Review the extracted information below. You can edit any field before confirming.
            </Typography>
            <PassportPreview
              data={extractedData}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              loading={loading}
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box textAlign="center" py={4}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Passport information has been successfully saved!
            </Alert>
            <Typography variant="body1" color="text.secondary">
              Redirecting to passport list...
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Passport saved successfully!"
      />
    </Container>
  );
};

export default UploadPage;