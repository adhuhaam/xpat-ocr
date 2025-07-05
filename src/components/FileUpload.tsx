import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DocumentIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
  accept?: Record<string, string[]>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  loading = false,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff'],
    'application/pdf': ['.pdf'],
  },
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    disabled: loading,
  });

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <Box>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>Processing passport...</Typography>
          </Box>
        ) : selectedFile ? (
          <Box>
            <DocumentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {selectedFile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              sx={{ mt: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Drop your passport here'
                : 'Drag & drop your passport here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Supported formats: JPEG, PNG, GIF, BMP, TIFF, PDF
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default FileUpload;