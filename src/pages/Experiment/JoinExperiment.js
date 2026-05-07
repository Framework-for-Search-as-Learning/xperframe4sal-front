/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../config/axios';
import { Container, Paper, Typography, CircularProgress, Button, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';

const REDIRECT_DELAY_MS = 3000;

const JoinExperiment = () => {
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [status, setStatus] = useState('loading');

  const isAuthenticated = !!(
    user &&
    user.expirationTime &&
    new Date().getTime() < user.expirationTime
  );

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingJoinExperimentId', experimentId);
      navigate('/login');
      return;
    }

    const joinExperiment = async () => {
      try {
        const { data } = await api.get(
          `user-experiment?userId=${user.id}&experimentId=${experimentId}`,
          { headers: { Authorization: `Bearer ${user.accessToken}` } },
        );
        if (data && data._id) {
          setStatus('already');
          setTimeout(() => navigate('/experiments'), REDIRECT_DELAY_MS);
          return;
        }
      } catch (_) {
        // 404 means not enrolled yet — proceed to enroll
      }

      try {
        await api.post(
          'user-experiment',
          { userId: user.id, experimentId },
          { headers: { Authorization: `Bearer ${user.accessToken}` } },
        );
        setStatus('success');
        setTimeout(() => navigate('/experiments'), REDIRECT_DELAY_MS);
      } catch (_) {
        setStatus('error');
      }
    };

    joinExperiment();
  }, [experimentId, isAuthenticated, navigate, user]);

  const statusConfig = {
    loading: {
      icon: <CircularProgress size={48} />,
      message: t('join_experiment_loading'),
      color: 'text.secondary',
    },
    success: {
      icon: <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />,
      message: t('join_experiment_success'),
      color: 'success.main',
    },
    already: {
      icon: <InfoIcon sx={{ fontSize: 48, color: 'info.main' }} />,
      message: t('join_experiment_already'),
      color: 'info.main',
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />,
      message: t('join_experiment_error'),
      color: 'error.main',
    },
  };

  const current = statusConfig[status];

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {t('join_experiment_title')}
        </Typography>
        <Box sx={{ my: 3 }}>{current.icon}</Box>
        <Typography variant="body1" sx={{ color: current.color, mb: 3 }}>
          {current.message}
        </Typography>
        {(status === 'success' || status === 'already') && (
          <Typography variant="body2" color="text.secondary">
            {t('join_experiment_redirect')}
          </Typography>
        )}
        {status === 'error' && (
          <Button variant="contained" onClick={() => navigate('/experiments')} sx={{ mt: 1 }}>
            {t('back_home_button')}
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default JoinExperiment;
