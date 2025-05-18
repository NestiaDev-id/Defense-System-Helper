import { useState } from 'react';
import { Paper, Tabs, Tab, Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import type { ChangeEvent } from 'react';
import { endpoints } from '../config';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Crypto = () => {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEncrypt = async () => {
    try {
      const response = await axios.post(endpoints.data.encrypt, {
        data,
        key,
      });
      setResult(JSON.stringify(response.data, null, 2));
      setMessage({ type: 'success', text: 'Data encrypted successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Encryption failed' });
    }
  };

  const handleSign = async () => {
    try {
      const response = await axios.post(endpoints.data.sign, {
        data,
        key,
      });
      setResult(JSON.stringify(response.data, null, 2));
      setMessage({ type: 'success', text: 'Data signed successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Signing failed' });
    }
  };

  const handleChange = (_: unknown, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Tabs value={tab} onChange={handleChange} centered>
        <Tab label="Encrypt" />
        <Tab label="Sign" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Typography variant="h6" gutterBottom>
          Encrypt Data
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Data"
            multiline
            rows={4}
            value={data}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setData(e.target.value)}
          />
          <TextField
            label="Key"
            value={key}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleEncrypt}>
            Encrypt
          </Button>
        </Box>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Typography variant="h6" gutterBottom>
          Sign Data
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Data"
            multiline
            rows={4}
            value={data}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setData(e.target.value)}
          />
          <TextField
            label="Key"
            value={key}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSign}>
            Sign
          </Button>
        </Box>
      </TabPanel>

      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Result:
          </Typography>
          <TextField
            multiline
            rows={4}
            value={result}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Box>
      )}

      {message && (
        <Box sx={{ mt: 2 }}>
          <Alert severity={message.type}>{message.text}</Alert>
        </Box>
      )}
    </Paper>
  );
};

export default Crypto;
