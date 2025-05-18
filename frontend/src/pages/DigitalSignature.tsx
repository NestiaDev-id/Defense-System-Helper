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

const DigitalSignature = () => {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState('');
  const [signature, setSignature] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [result, setResult] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const generateKeyPair = async () => {
    try {
      const response = await axios.post(endpoints.crypto.key.sign);
      const { publicKey, privateKey } = response.data;
      setPublicKey(publicKey);
      setPrivateKey(privateKey);
      setMessage({ type: 'success', text: 'Signature key pair generated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to generate key pair' });
    }
  };

  const handleSign = async () => {
    try {
      const response = await axios.post(endpoints.data.sign, {
        data,
        privateKey,
      });
      setSignature(response.data.signature);
      setResult(JSON.stringify(response.data, null, 2));
      setMessage({ type: 'success', text: 'Data signed successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Signing failed' });
    }
  };

  const handleVerify = async () => {
    try {
      const response = await axios.post(endpoints.data.verifySign, {
        data,
        signature,
        publicKey,
      });
      setResult(JSON.stringify(response.data, null, 2));
      setMessage({ type: 'success', text: 'Signature verified successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Verification failed' });
    }
  };

  const handleCheckIntegrity = async () => {
    try {
      const response = await axios.post(endpoints.data.checkIntegrity, {
        data,
        signature,
      });
      setResult(JSON.stringify(response.data, null, 2));
      setMessage({ type: 'success', text: 'Integrity check completed' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Integrity check failed' });
    }
  };

  const handleChange = (_: unknown, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Tabs value={tab} onChange={handleChange} centered>
        <Tab label="Sign" />
        <Tab label="Verify" />
        <Tab label="Check Integrity" />
      </Tabs>

      <Box sx={{ mb: 2, mt: 2 }}>
        <Button variant="contained" color="secondary" onClick={generateKeyPair}>
          Generate Signature Key Pair
        </Button>
      </Box>

      {(publicKey || privateKey) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Keys Generated:
          </Typography>
          <TextField
            label="Public Key"
            value={publicKey}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 1 }}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Private Key"
            value={privateKey}
            fullWidth
            multiline
            rows={2}
            InputProps={{ readOnly: true }}
          />
        </Box>
      )}

      <TabPanel value={tab} index={0}>
        <Typography variant="h6" gutterBottom>
          Sign Data
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Data to Sign"
            multiline
            rows={4}
            value={data}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setData(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSign}
            disabled={!privateKey}
          >
            Sign Data
          </Button>
        </Box>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Typography variant="h6" gutterBottom>
          Verify Signature
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Original Data"
            multiline
            rows={4}
            value={data}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setData(e.target.value)}
          />
          <TextField
            label="Signature"
            multiline
            rows={2}
            value={signature}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSignature(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleVerify}
            disabled={!publicKey || !signature}
          >
            Verify Signature
          </Button>
        </Box>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Typography variant="h6" gutterBottom>
          Check Data Integrity
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
            label="Signature/Hash"
            multiline
            rows={2}
            value={signature}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSignature(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCheckIntegrity}
            disabled={!data || !signature}
          >
            Check Integrity
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

export default DigitalSignature; 