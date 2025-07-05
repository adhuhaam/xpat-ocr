import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Check as CheckIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { PassportData } from '../types/passport';
import { formatDate, getConfidenceColor } from '../utils/formatters';

interface PassportPreviewProps {
  data: PassportData;
  onConfirm: (data: PassportData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PassportPreview: React.FC<PassportPreviewProps> = ({
  data,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const [editMode, setEditMode] = React.useState(false);
  const [formData, setFormData] = React.useState<PassportData>(data);

  const handleFieldChange = (field: keyof PassportData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleConfirm = () => {
    onConfirm(formData);
  };

  const confidenceColor = getConfidenceColor(data.confidence);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Extracted Passport Information</Typography>
        <Box>
          {data.confidence && (
            <Chip
              icon={
                data.confidence >= 90 ? (
                  <CheckIcon />
                ) : (
                  <WarningIcon />
                )
              }
              label={`${data.confidence.toFixed(0)}% Confidence`}
              color={
                confidenceColor === 'green'
                  ? 'success'
                  : confidenceColor === 'orange'
                  ? 'warning'
                  : 'error'
              }
              sx={{ mr: 2 }}
            />
          )}
          <Button
            startIcon={<EditIcon />}
            onClick={() => setEditMode(!editMode)}
            variant="outlined"
            size="small"
          >
            {editMode ? 'View Mode' : 'Edit Mode'}
          </Button>
        </Box>
      </Box>

      {data.confidence && data.confidence < 70 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Low confidence score. Please verify all extracted information carefully.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Passport Number"
            value={formData.passportNumber || ''}
            onChange={(e) => handleFieldChange('passportNumber', e.target.value)}
            disabled={!editMode}
            required
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nationality"
            value={formData.nationality || ''}
            onChange={(e) => handleFieldChange('nationality', e.target.value)}
            disabled={!editMode}
            required
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName || ''}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            disabled={!editMode}
            required
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName || ''}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            disabled={!editMode}
            required
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={
              formData.dateOfBirth
                ? new Date(formData.dateOfBirth).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
            disabled={!editMode}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Place of Birth"
            value={formData.placeOfBirth || ''}
            onChange={(e) => handleFieldChange('placeOfBirth', e.target.value)}
            disabled={!editMode}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Gender"
            value={formData.gender || ''}
            onChange={(e) => handleFieldChange('gender', e.target.value)}
            disabled={!editMode}
            required
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Date of Issue"
            type="date"
            value={
              formData.dateOfIssue
                ? new Date(formData.dateOfIssue).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => handleFieldChange('dateOfIssue', e.target.value)}
            disabled={!editMode}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Date of Expiry"
            type="date"
            value={
              formData.dateOfExpiry
                ? new Date(formData.dateOfExpiry).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => handleFieldChange('dateOfExpiry', e.target.value)}
            disabled={!editMode}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Place of Issue"
            value={formData.placeOfIssue || ''}
            onChange={(e) => handleFieldChange('placeOfIssue', e.target.value)}
            disabled={!editMode}
            margin="normal"
          />
        </Grid>

        {(formData.mrzLine1 || formData.mrzLine2) && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption">MRZ Data</Typography>
              </Divider>
            </Grid>
            {formData.mrzLine1 && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="MRZ Line 1"
                  value={formData.mrzLine1}
                  disabled
                  margin="normal"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Grid>
            )}
            {formData.mrzLine2 && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="MRZ Line 2"
                  value={formData.mrzLine2}
                  disabled
                  margin="normal"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Grid>
            )}
          </>
        )}
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button
          onClick={onCancel}
          variant="outlined"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          startIcon={<CheckIcon />}
        >
          Confirm & Save
        </Button>
      </Box>
    </Paper>
  );
};

export default PassportPreview;