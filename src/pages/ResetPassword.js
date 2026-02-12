/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';  

import { api } from "../config/axios.js";
import { Container, Paper, TextField, Button, InputAdornment, IconButton, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ErrorMessage } from '../components/ErrorMessage.js';
import { LoadingIndicator } from '../components/LoadIndicator.js';

const ResetPassword = () => {
  const { t } = useTranslation();  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [email, setEmail] = useState(searchParams.get('email') || null);
  const [token, setToken] = useState(searchParams.get('token') || null);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [differentPasswords, setDifferentPasswords] = useState(false);
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\]*@#$%^<>'";|}{:,./?~()`&\-_+=![]).{6,}$/;
    setIsValidPassword(passwordRegex.test(inputPassword));
  };

  const handleRepeatPasswordChange = (e) => {
    const inputPassword = e.target.value;
    setRepeatPassword(inputPassword);
    setDifferentPasswords(password !== inputPassword);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEdit = async () => {
    if (!isValidPassword) {
      setAlertMessage(t('invalid_password_message'));  
      setMessageType('fail');
      return;
    }

    if (differentPasswords) {
      setAlertMessage(t('passwords_dont_match'));  
      setMessageType('fail');
    }

    let userData = { email, token, password };

    setIsLoading(true);
    try {
      await api.post(`/users/reset-password`, userData);
      setIsLoading(false);
      setAlertMessage(t('loading_message'));  
      setMessageType('success');
    } catch (error) {
      setIsLoading(false);
      setAlertMessage(`${t('error_message')} ${error.response.data.message}`);
      setMessageType('fail');
    }
  };

  return (
    <>
      <Container maxWidth="xs" style={{
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        height: '80vh',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <Paper elevation={3} sx={{ padding: 2 }}>
          {isLoading && <LoadingIndicator size={50} />}
          {alertMessage && <ErrorMessage message={alertMessage} messageType={messageType} onClose={() => setAlertMessage(null)} />}
          <Box component="form" disabled={isLoading}>
            <TextField
              label={t('password')}  
              error={!isValidPassword}
              helperText={!isValidPassword ? t('password_helper') : ''}  
              fullWidth
              margin="normal"
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={t('repeat_password')}  
              error={differentPasswords}
              helperText={differentPasswords ? t('different_passwords') : ''}  
              fullWidth
              margin="normal"
              type="password"
              value={repeatPassword}
              onChange={handleRepeatPasswordChange}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleEdit}
              style={{ margin: '16px 0' }}
              disabled={isLoading || !isValidPassword || differentPasswords || (password.length === 0 && repeatPassword.length === 0)}
            >
              {t('change_password')}
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
              {t('login_with_account')}  
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export { ResetPassword };
