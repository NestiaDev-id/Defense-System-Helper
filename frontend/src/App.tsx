import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Crypto from './pages/Crypto';
import HybridCrypto from './pages/HybridCrypto';
import DigitalSignature from './pages/DigitalSignature';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/crypto" element={<Crypto />} />
            <Route path="/hybrid" element={<HybridCrypto />} />
            <Route path="/signature" element={<DigitalSignature />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
