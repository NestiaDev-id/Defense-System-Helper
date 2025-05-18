import { useState } from 'react';
import { Paper, Tabs, Tab, Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import type { ChangeEvent, FormEvent } from 'react';
import { endpoints } from '../config';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Auth = () => {
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const endpoint = tab === 0 ? endpoints.auth.login : endpoints.auth.register;
      const response = await axios.post(endpoint, {
        username,
        password,
      });
      setMessage({ type: 'success', text: response.data.message || 'Operation successful' });
      setUsername('');
      setPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'An error occurred' });
    }
  };

  const handleChange = (_: unknown, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Tabs value={tab} onChange={handleChange} centered>
        <Tab label="Login" />
        <Tab label="Register" />
      </Tabs>

      <form onSubmit={handleSubmit}>
        <TabPanel value={tab} index={0}>
          <Typography variant="h6" gutterBottom>
            Login
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Typography variant="h6" gutterBottom>
            Register
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary">
              Register
            </Button>
          </Box>
        </TabPanel>
      </form>

      {message && (
        <Box sx={{ mt: 2 }}>
          <Alert severity={message.type}>{message.text}</Alert>
        </Box>
      )}
    </Paper>
  );
};

export default Auth;
 