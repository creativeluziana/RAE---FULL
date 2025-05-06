import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Search,
  Refresh,
  NavigateNext,
  NavigateBefore,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AskRae = () => {
  const [researchPapers, setResearchPapers] = useState([]);
  const [researchField, setResearchField] = useState("");
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedYear, setSelectedYear] = useState("");
  const [openSummary, setOpenSummary] = useState(false);
  const [currentSummary, setCurrentSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  // Load Google Font
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const fetchPapers = useCallback(async () => {
    if (!researchField) return;
    setLoadingPapers(true);
    try {
      let url = `http://localhost:5000/api/research?field=${researchField}&page=${page}&limit=5`;
      if (selectedYear) {
        url += `&year=${selectedYear}`;
      }

      const response = await axios.get(url);
      setResearchPapers(response.data.papers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching research papers:", error);
    }
    setLoadingPapers(false);
  }, [researchField, page, selectedYear]);

  useEffect(() => {
    if (researchField) {
      fetchPapers();
    }
  }, [fetchPapers]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  const fetchPaperSummary = async (paper) => {
    setLoadingSummary(true);
    setSelectedPaper(paper);
    setOpenSummary(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/summarize', {
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        link: paper.link
      });
      setCurrentSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setCurrentSummary("Failed to generate summary. Please try again later.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCloseSummary = () => {
    setOpenSummary(false);
    setCurrentSummary("");
    setSelectedPaper(null);
  };

  return (
    <Box 
      sx={{ 
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#f5f6fa',
        p: { xs: 2, md: 4 }
      }}
    >
      <Container maxWidth="lg">
        {/* Welcome Header */}
        <Typography 
          variant="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            color: "#1f1c2c", 
            fontFamily: "'Rajdhani', sans-serif", 
            textTransform: "uppercase",
            letterSpacing: "2px",
            textAlign: "center",
            mb: 4
          }}
        >
          Welcome to RAE! 🤖
        </Typography>

        {/* Search & Controls */}
        <Paper 
          elevation={4} 
          sx={{ 
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            width: "100%", 
            maxWidth: "800px",
            mx: "auto",
            mb: 4
          }}
        >
          <TextField 
            label="Enter research field" 
            fullWidth 
            variant="outlined"
            value={researchField} 
            onChange={(e) => setResearchField(e.target.value)} 
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value="">All Years</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Search />} 
                fullWidth
                onClick={() => {
                  setPage(1);
                  fetchPapers();
                }}
              >
                Search Papers
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<Refresh />} 
                fullWidth
                onClick={() => {
                  setResearchPapers([]);
                  setResearchField("");
                  setSelectedYear("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Section */}
        {loadingPapers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={50} />
          </Box>
        ) : researchPapers.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {researchPapers.map((paper, index) => (
                <Grid item xs={12} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      elevation={2}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                          transition: 'all 0.3s ease'
                        }
                      }}
                      onClick={() => fetchPaperSummary(paper)}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#1a73e8' }}>
                          {paper.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Authors: {paper.authors}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Year: {paper.year} | Citations: {paper.citations || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                endIcon={<NavigateNext />}
                onClick={handleNextPage}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </Box>
          </>
        ) : researchField && (
          <Typography variant="h6" textAlign="center" sx={{ mt: 4, color: '#666' }}>
            No research papers found. Try a different search term.
          </Typography>
        )}

        {/* Paper Summary Dialog */}
        <Dialog
          open={openSummary}
          onClose={handleCloseSummary}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ pr: 6 }}>
            {selectedPaper?.title}
            <IconButton
              onClick={handleCloseSummary}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {loadingSummary ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography 
                variant="body1" 
                component="div"
                sx={{
                  '& h3': {
                    color: '#1a73e8',
                    mt: 3,
                    mb: 2,
                    fontSize: '1.2rem',
                    fontWeight: 600
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: currentSummary
                    .replace(/📑 OFFICIAL ABSTRACT/g, '<h3>Official Abstract</h3>')
                    .replace(/⚠️ ABSTRACT NOT AVAILABLE/g, '<h3>AI-Generated Analysis</h3>')
                    .replace(/\n/g, '<br>')
                }}
              />
            )}
          </DialogContent>
          <DialogActions>
            {selectedPaper && (
              <Button 
                variant="contained" 
                color="primary" 
                href={selectedPaper.link} 
                target="_blank"
              >
                View Original Paper
              </Button>
            )}
            <Button onClick={handleCloseSummary}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AskRae; 