import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/auth">
            Auth
          </Button>
          <Button color="inherit" component={RouterLink} to="/crypto">
            Crypto
          </Button>
          <Button color="inherit" component={RouterLink} to="/hybrid">
            Hybrid Encryption
          </Button>
          <Button color="inherit" component={RouterLink} to="/signature">
            Digital Signature
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 