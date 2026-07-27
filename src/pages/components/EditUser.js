/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Container,
  Paper,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { People, Person } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import EditUserArea from '../../components/EditUser/EditUsersArea';
import EditGroupArea from '../../components/EditUser/EditGroupArea';
import { useExperimentAuth } from '../../hooks/useExperimentAuth';

const EditUser = () => {
  const { experimentId } = useParams();
  const { t } = useTranslation();

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [actualStep, setActualStep] = useState(0);

  const { isLoading, isAuthorized, data: experimentData } = useExperimentAuth(experimentId, user);

  const isBetweenManual =
    experimentData?.typeExperiment === 'between-subject' &&
    experimentData?.betweenExperimentType === 'manual';

  useEffect(() => {
    if (isAuthorized && experimentData) {
      if (!isBetweenManual) {
        setActualStep(0);
      }
    }
  }, [isAuthorized, experimentData, isBetweenManual]);

  const handleTabChange = (_event, newValue) => {
    setActualStep(newValue);
  };

  const renderCurrentStep = () => {
    if (actualStep === 1 && isBetweenManual) {
      return <EditGroupArea ExperimentId={{ experimentId }} experimentId={experimentId} />;
    }
    return <EditUserArea ExperimentId={{ experimentId }} experimentId={experimentId} />;
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          {t('loading')}
        </Typography>
      </Box>
    );
  }

  if (!isAuthorized) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" align="center" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
        {t('edit_participants')}
      </Typography>

      {isBetweenManual && (
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={actualStep}
            onChange={handleTabChange}
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              icon={<Person />}
              iconPosition="start"
              label={t('edit_participants')}
            />
            <Tab
              icon={<People />}
              iconPosition="start"
              label={t('edit_groups')}
            />
          </Tabs>
        </Paper>
      )}

      <Box sx={{ mt: 2 }}>{renderCurrentStep()}</Box>
    </Container>
  );
};

export default EditUser;