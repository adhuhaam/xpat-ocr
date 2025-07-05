import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import {
  Upload as UploadIcon,
  List as ListIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import UploadPage from './pages/UploadPage';
import PassportsPage from './pages/PassportsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Passport OCR System
              </Typography>
              <Button
                color="inherit"
                component={Link}
                to="/"
                startIcon={<UploadIcon />}
              >
                Upload
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/passports"
                startIcon={<ListIcon />}
              >
                Passports
              </Button>
            </Toolbar>
          </AppBar>

          <Box component="main" sx={{ minHeight: 'calc(100vh - 64px)', py: 3 }}>
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/passports" element={<PassportsPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;