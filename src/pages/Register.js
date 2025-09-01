import React, { useState } from 'react';
import { api } from "../config/axios.js";
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Box,
  FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingIndicator } from '../components/LoadIndicator';
import { useTranslation } from 'react-i18next';
import { Switch } from '@mui/material';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [researcher, setResearcher] = useState(false);
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidName, setIsValidName] = useState(true);
  const [isValidLastName, setIsValidLastName] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    setIsValidEmail(emailRegex.test(inputEmail));
  };

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\]*@#$%^<>'";|}{:,./?~()`&\-_+=![]).{6,}$/;
    setIsValidPassword(passwordRegex.test(inputPassword));
  };

  const handleNameChange = (e) => {
    const inputName = e.target.value;
    setName(inputName);
    setIsValidName(inputName ? true : false);
  };

  const handleLastNameChange = (e) => {
    const inputName = e.target.value;
    setLastName(inputName);
    setIsValidLastName(inputName ? true : false);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async () => {
    if (!isValidEmail || !isValidName || !isValidLastName || !isValidPassword) {
      setAlertMessage(t("form_invalid_message"));
      setMessageType('fail');
      return;
    }

    setName(name.trim());
    setLastName(lastName.trim());
    setEmail(email.trim());

    const userData = { name, lastName, email, password, researcher };
    setIsLoading(true);
    try {
      let response = await api.post("/users2", userData);
      if (response.data) {
        setAlertMessage(t("success_message"));
        setMessageType('success');
        const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem('user', JSON.stringify({ ...userData, expirationTime }));
        navigate("/experiments");
      }
    } catch (e) {
      setAlertMessage(t("register_fail_message"));
      setMessageType('fail');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidForm = isValidEmail && email && isValidPassword && password && isValidName && name && isValidLastName && lastName;

  return (
    <Container maxWidth="xs" style={{
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      height: '100vh',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <Paper elevation={3} style={{ padding: '16px' }}>
        <Box component='form' disabled={isLoading}>
          <Typography variant="h4" align="center"
            style={{
              fontFamily: '"Google Sans","Noto Sans Myanmar UI", arial,sans-serif',
              fontWeight: 500,
              color: 'rgb(103,99,99)'
            }}
            sx={{ fontSize: { xs: '2.2rem', sm: '2.4rem' } }}
          >
            {t('sign_up_label')}
          </Typography>
          {isLoading ? <LoadingIndicator size={50} /> : ""}
          {alertMessage && <ErrorMessage message={alertMessage} messageType={messageType} onClose={() => setAlertMessage(null)} />}

          <TextField
            label={t('name_label')}
            error={!isValidName}
            helperText={!isValidName ? t('invalid_name_message') : ''}
            fullWidth
            margin="normal"
            variant="outlined"
            value={name}
            onChange={handleNameChange}
          />
          <TextField
            label={t('last_name_label')}
            error={!isValidLastName}
            helperText={!isValidLastName ? t('invalid_last_name_message') : ''}
            fullWidth
            margin="normal"
            variant="outlined"
            value={lastName}
            onChange={handleLastNameChange}
          />
          <TextField
            label="E-mail"
            type="email"
            error={!isValidEmail}
            helperText={!isValidEmail ? t('invalid_email_message') : ''}
            fullWidth
            autoComplete="email"
            margin="normal"
            variant="outlined"
            value={email}
            onChange={handleEmailChange}
          />
          <TextField
            label={t('password_label')}
            error={!isValidPassword}
            helperText={!isValidPassword ? t('invalid_password_message') : ''}
            fullWidth
            autoComplete="current-password"
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    title={showPassword ? t('hide_password') : t('show_password')}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={researcher}
                onChange={(e) => setResearcher(e.target.checked)}
                color="primary"
              />
            }
            label={t('researcher_label')}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleRegister}
            style={{ margin: '16px 0' }}
            disabled={!isValidForm || isLoading}
          >
            {t('sign_up_label')}
          </Button>
          <Typography variant="body2" align="center" fontSize={15}>
            {t('have_an_account_already')}{' '}
            <Button onClick={() => navigate('/')} style={{
              cursor: 'pointer',
              fontWeight: 700,
              backgroundColor: 'transparent',
              textAlign: 'right',
              padding: '2px 3px',
            }}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            >
              {t('sign_in_title')}
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export { Register };
