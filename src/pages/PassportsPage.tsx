import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PassportList from '../components/PassportList';
import { passportAPI } from '../services/api';
import { PassportData } from '../types/passport';

const PassportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [passports, setPassports] = useState<PassportData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPassports = async (searchQuery?: string, searchField?: string) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (searchQuery) {
        response = await passportAPI.searchPassports(
          searchQuery,
          searchField,
          page + 1,
          rowsPerPage
        );
      } else {
        response = await passportAPI.getAllPassports(page + 1, rowsPerPage);
      }

      if (response.success) {
        setPassports(response.data);
        setTotalCount(response.pagination.totalItems);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch passports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassports();
  }, [page, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleEdit = async (id: string, data: PassportData) => {
    try {
      const response = await passportAPI.updatePassport(id, data);
      if (response.success) {
        setSuccess('Passport updated successfully');
        fetchPassports();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update passport');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await passportAPI.deletePassport(id);
      if (response.success) {
        setSuccess('Passport deleted successfully');
        fetchPassports();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete passport');
    }
  };

  const handleSearch = (query: string, field?: string) => {
    setPage(0);
    fetchPassports(query, field);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Passport Records</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/')}
        >
          Upload New Passport
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <PassportList
        passports={passports}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={handleSearch}
        loading={loading}
      />

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        message={success}
      />
    </Container>
  );
};

export default PassportsPage;