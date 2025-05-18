import { Typography, Paper, Box } from '@mui/material';

const Home = () => {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Defense System Helper
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" paragraph>
          This application provides secure cryptographic operations and authentication services.
        </Typography>
        <Typography variant="body1" paragraph>
          Features:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1">Secure Authentication and Authorization</Typography>
          </li>
          <li>
            <Typography variant="body1">Password Hashing and Verification</Typography>
          </li>
          <li>
            <Typography variant="body1">Data Encryption and Decryption</Typography>
          </li>
          <li>
            <Typography variant="body1">Digital Signatures</Typography>
          </li>
          <li>
            <Typography variant="body1">Key Generation</Typography>
          </li>
        </ul>
      </Box>
    </Paper>
  );
};

export default Home; 