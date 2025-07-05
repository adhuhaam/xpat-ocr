import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { PassportData } from '../types/passport';
import { formatDate, getExpiryStatus } from '../utils/formatters';
import PassportPreview from './PassportPreview';

interface PassportListProps {
  passports: PassportData[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (id: string, data: PassportData) => void;
  onDelete: (id: string) => void;
  onSearch: (query: string, field?: string) => void;
  loading?: boolean;
}

const PassportList: React.FC<PassportListProps> = ({
  passports,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onSearch,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [selectedPassport, setSelectedPassport] = useState<PassportData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passportToDelete, setPassportToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery, searchField === 'all' ? undefined : searchField);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleView = (passport: PassportData) => {
    setSelectedPassport(passport);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setPassportToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (passportToDelete) {
      onDelete(passportToDelete);
    }
    setDeleteDialogOpen(false);
    setPassportToDelete(null);
  };

  const handleEditSave = (data: PassportData) => {
    if (selectedPassport?._id) {
      onEdit(selectedPassport._id, data);
      setViewDialogOpen(false);
    }
  };

  const getExpiryChip = (expiryDate: Date | string | undefined) => {
    const status = getExpiryStatus(expiryDate);
    
    if (status === 'expired') {
      return (
        <Chip
          icon={<ErrorIcon />}
          label="Expired"
          color="error"
          size="small"
        />
      );
    } else if (status === 'expiring') {
      return (
        <Chip
          icon={<WarningIcon />}
          label="Expiring Soon"
          color="warning"
          size="small"
        />
      );
    }
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label="Valid"
        color="success"
        size="small"
      />
    );
  };

  return (
    <Box>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Search passports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Search Field</InputLabel>
            <Select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              label="Search Field"
            >
              <MenuItem value="all">All Fields</MenuItem>
              <MenuItem value="passportNumber">Passport Number</MenuItem>
              <MenuItem value="firstName">First Name</MenuItem>
              <MenuItem value="lastName">Last Name</MenuItem>
              <MenuItem value="nationality">Nationality</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Passport Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Nationality</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {passports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">No passports found</Alert>
                </TableCell>
              </TableRow>
            ) : (
              passports.map((passport) => (
                <TableRow key={passport._id}>
                  <TableCell>{passport.passportNumber}</TableCell>
                  <TableCell>
                    {passport.firstName} {passport.lastName}
                  </TableCell>
                  <TableCell>{passport.nationality}</TableCell>
                  <TableCell>{formatDate(passport.dateOfBirth)}</TableCell>
                  <TableCell>{formatDate(passport.dateOfExpiry)}</TableCell>
                  <TableCell>{getExpiryChip(passport.dateOfExpiry)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => handleView(passport)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(passport._id!)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) =>
            onRowsPerPageChange(parseInt(e.target.value, 10))
          }
        />
      </TableContainer>

      {/* View/Edit Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Passport Details</DialogTitle>
        <DialogContent>
          {selectedPassport && (
            <PassportPreview
              data={selectedPassport}
              onConfirm={handleEditSave}
              onCancel={() => setViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this passport record? This action cannot
          be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PassportList;