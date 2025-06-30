import React, { useState } from 'react';
import { api } from "../config/axios.js";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Box,
} from '@mui/material';

import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingIndicator } from '../components/LoadIndicator';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); 

  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setIsValid(isValidEmail(inputEmail));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await api.post(`users/forgot-password`, { email: email });
      setIsLoading(false);
      setMessageType('success');
      setAlertMessage(t('reset_success_message')); 
    } catch (error) {
      setIsLoading(false);
      setMessageType('fail');
      if (error?.response?.data) {
        setAlertMessage(error?.response?.data.message);
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      height: '100vh',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <Paper elevation={3} sx={{
        padding: '48px 40px 36px',
        minWidth: 500,
        width: '100%',
        overflowY: 'hidden',
        margin: '0 auto'
      }}>
        <Typography variant="h4" align="center"
          sx={{ fontSize: { xs: '1.8rem', sm: '2rem' } }}
          style={{
            fontFamily: '"Google Sans","Noto Sans Myanmar UI", arial,sans-serif',
            fontWeight: 500,
            color: 'rgb(103,99,99)'
          }}>
          {t('forgot_password_title')} 
        </Typography>
        {isLoading && <LoadingIndicator size={50} />}
        {alertMessage && <ErrorMessage
          message={alertMessage}
          messageType={messageType}
          onClose={() => setAlertMessage(null)}
        />}
        <Divider style={{ margin: '16px 0' }} />
        <Box component="form">
          <TextField
            label={t('email_label')} 
            variant="outlined"
            type="email"
            autoComplete="email"
            fullWidth
            value={email}
            required
            onChange={handleEmailChange}
            error={!isValid && (email.length > 0)}
            helperText={!isValid && email ? t('invalid_email') : ''} 
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            style={{ margin: '16px 0' }}
            disabled={!isValid}
          >
            {t('recover_button')} 
          </Button>
          <Button onClick={() => navigate('/')} style={{
            cursor: 'pointer',
            fontWeight: 700,
            backgroundColor: 'transparent',
            textAlign: 'right',
            padding: '2px 3px',
          }}
            sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
          >
            {t('login_link')} 
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export { ForgotPassword };
