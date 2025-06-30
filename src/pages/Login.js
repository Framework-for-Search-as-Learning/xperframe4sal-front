import { useNavigate } from 'react-router-dom'
import { api } from "../config/axios.js"
import { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';

import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingIndicator } from '../components/LoadIndicator';

import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!(user && user.expirationTime && new Date().getTime() < user.expirationTime);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/experiments");
    }
  }, [isAuthenticated, navigate]);

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setIsValid(isValidEmail(inputEmail));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e) => setPassword(e.target.value);

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleEmailLogin = async () => {
    setIsLoading(true);
    try {
      let response = await api.post("/login", { username: email, password: password });
      setIsLoading(false);
      if (response.data) {
        let user = response.data;
        user.email = email;
        const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem('user', JSON.stringify({ ...user, expirationTime }));
        setUser(user);
        navigate("/experiments");
      } else {
        setAlertMessage(t('data_retrieval_error'));
        setMessageType('fail');
      }
    } catch (e) {
      setIsLoading(false);
      setAlertMessage(t('login_error'));
      setMessageType('fail');
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    navigate("/register");
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const isValidForm = isValid && email && password;

  return (
    <Container maxWidth="xs" style={{
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      height: '100vh',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <Paper
        elevation={3}
        sx={{
          padding: '48px 40px 36px',
          minHeight: 350,
          width: '100%',
          overflowY: 'hidden',
          margin: '0 auto'
        }}
      >
        <Box component="form" disabled={isLoading}>
          <Typography variant="h4" align="center"
            sx={{ fontSize: { xs: '1.8rem', sm: '2rem' } }}
            style={{
              fontFamily: '"Google Sans","Noto Sans Myanmar UI", arial,sans-serif',
              fontWeight: 500,
              color: 'rgb(103,99,99)'
            }}>
            {t('sign_in_title')}
          </Typography>
          {isLoading && <LoadingIndicator size={25} />}
          {alertMessage && (
            <ErrorMessage
              message={alertMessage}
              messageType={messageType}
              onClose={() => setAlertMessage(null)}
            />
          )}
          <Divider style={{ margin: '16px 0' }} />

          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            error={!isValid && (email.length > 0)}
            helperText={!isValid && email ? t('invalid_email') : ''}
            margin='normal'
          />
          <TextField
            label={t('password_label')}
            fullWidth
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            autoComplete="current-password"
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            margin="normal"
          />
          <div>
            <Button onClick={handleForgotPassword} style={{
              cursor: 'pointer',
              fontWeight: 700,
              backgroundColor: 'transparent',
              textAlign: 'left',
              padding: '2px 3px',
              fontSize: 11,
            }}>
              {t('forgot_password')}
            </Button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            marginTop: 50,
            width: '100%',
          }}>
            <Button
              onClick={handleEmailLogin}
              variant="contained"
              color="primary"
              style={{
                boxSizing: 'inherit',
                display: 'inline-block'
              }}
              disabled={!isValidForm || isLoading}
            >
              {t('sign_in_label')}
            </Button>
            <Button
              onClick={handleRegister}
              style={{
                textAlign: 'left',
                fontWeight: 500,
                backgroundColor: 'transparent',
                flexGrow: 1,
                padding: '2px 3px',
                display: 'inline-block'
              }}>
              {t('sign_up_label')}
            </Button>
          </div>
        </Box>
      </Paper>
    </Container>
  )
};

export { Login }
