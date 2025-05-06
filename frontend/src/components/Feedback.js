import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  Rating, 
  Typography, 
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Container
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSmile, faMeh, faSadTear } from '@fortawesome/free-solid-svg-icons';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [satisfaction, setSatisfaction] = useState('');
  const [feedback, setFeedback] = useState('');
  const [improvements, setImprovements] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle the feedback submission
    console.log({ rating, satisfaction, feedback, improvements });
    
    // Reset form
    setRating(0);
    setSatisfaction('');
    setFeedback('');
    setImprovements('');
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
      <Container 
        maxWidth="md" 
        sx={{ 
          mb: 4,
          minHeight: 'min-content'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, md: 4 },
            borderRadius: 2,
            backgroundColor: '#fff'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              borderBottom: '2px solid #007bff',
              pb: 2,
              mb: 4,
              color: '#2c3e50',
              fontWeight: 600
            }}
          >
            Share Your Feedback
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <Box mb={4}>
              <Typography 
                component="legend" 
                gutterBottom 
                variant="h6"
                sx={{ color: '#34495e' }}
              >
                How would you rate your experience with RAE?
              </Typography>
              <Rating
                size="large"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                icon={<FontAwesomeIcon icon={faStar} style={{ fontSize: '32px', color: '#ffd700' }} />}
                emptyIcon={<FontAwesomeIcon icon={faStar} style={{ fontSize: '32px', color: '#e0e0e0' }} />}
              />
            </Box>

            {/* Satisfaction Level */}
            <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
              <FormLabel 
                component="legend"
                sx={{ 
                  color: '#34495e',
                  fontSize: '1.1rem',
                  mb: 2
                }}
              >
                How satisfied are you with RAE's responses?
              </FormLabel>
              <RadioGroup
                value={satisfaction}
                onChange={(e) => setSatisfaction(e.target.value)}
                sx={{ gap: 1 }}
              >
                <FormControlLabel 
                  value="very_satisfied" 
                  control={<Radio size="large" />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FontAwesomeIcon icon={faSmile} style={{ color: '#4caf50', marginRight: '8px', fontSize: '24px' }} />
                      Very Satisfied
                    </Box>
                  }
                  sx={{ 
                    backgroundColor: satisfaction === 'very_satisfied' ? '#4caf5010' : 'transparent',
                    borderRadius: 1,
                    p: 1,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#4caf5008'
                    }
                  }}
                />
                <FormControlLabel 
                  value="neutral" 
                  control={<Radio size="large" />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FontAwesomeIcon icon={faMeh} style={{ color: '#ff9800', marginRight: '8px', fontSize: '24px' }} />
                      Neutral
                    </Box>
                  }
                  sx={{ 
                    backgroundColor: satisfaction === 'neutral' ? '#ff980010' : 'transparent',
                    borderRadius: 1,
                    p: 1,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#ff980008'
                    }
                  }}
                />
                <FormControlLabel 
                  value="not_satisfied" 
                  control={<Radio size="large" />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FontAwesomeIcon icon={faSadTear} style={{ color: '#f44336', marginRight: '8px', fontSize: '24px' }} />
                      Not Satisfied
                    </Box>
                  }
                  sx={{ 
                    backgroundColor: satisfaction === 'not_satisfied' ? '#f4433610' : 'transparent',
                    borderRadius: 1,
                    p: 1,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#f4433608'
                    }
                  }}
                />
              </RadioGroup>
            </FormControl>

            {/* Feedback Text */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="What did you like about RAE?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{ mb: 3 }}
            />

            {/* Improvements Text */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="What could be improved?"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{ mb: 4 }}
            />

            <Button 
              type="submit"
              variant="contained" 
              size="large"
              fullWidth
              sx={{
                bgcolor: '#007bff',
                '&:hover': {
                  bgcolor: '#0056b3'
                },
                py: 1.5,
                fontSize: '1.1rem',
                mb: 2
              }}
            >
              Submit Feedback
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Feedback; 