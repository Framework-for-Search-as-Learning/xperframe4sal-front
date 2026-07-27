/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Typography, Grid, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StepContext from './context/StepContext';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import FormStepContainer from '../../../components/Forms/FormStepContainer';

const ConfirmCreateExperiment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    step,
    setStep,
    handleCreateExperiment,
    ExperimentTitle,
    ExperimentType,
    BtypeExperiment,
    ExperimentDesc,
    ExperimentTasks,
    ExperimentSurveys,
  } = useContext(StepContext);

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);

    const success = await handleCreateExperiment();

    if (success) {
      setTimeout(() => {
        navigate('/experiments');
      }, 2000);
    } else {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  let minimal_tasks = 1;
  if (ExperimentType === 'between-subject') minimal_tasks = 2;

  return (
    <FormStepContainer>
      <Typography variant="h6" align="center" sx={{ mb: 3 }}>
        {t('revis_conc')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <strong>{t('Experiment_title')}:</strong> {ExperimentTitle}
        </Grid>
        <Grid item xs={12}>
          <strong>{t('typeExperiment1')}:</strong> {t(ExperimentType)}
        </Grid>

        {ExperimentType === 'between-subject' && (
          <Grid item xs={12}>
            <strong>{t('Group_Separation_Method')}:</strong> {t(BtypeExperiment)}
          </Grid>
        )}

        <Grid item xs={12}>
          <strong>{t('Experiment_Desc')}:</strong>
          <div
            className="rich-text-preview"
            dangerouslySetInnerHTML={{ __html: ExperimentDesc }}
          />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <strong>{t('selected_task')}:</strong>{' '}
            {ExperimentTasks.length > 0
              ? ExperimentTasks.map((task) => task.title).join(', ')
              : t('non_selected_task')}
          </div>
          {ExperimentTasks.length < minimal_tasks && (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              {t('need_minimal_pt1')} {minimal_tasks} {t('need_minimal_pt2')}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <strong>{t('selected_surveys')}:</strong>{' '}
          {ExperimentSurveys.length > 0
            ? ExperimentSurveys.map((survey) => survey.title).join(', ')
            : t('non_selected_survey')}
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 3,
          pt: 2,
          borderTop: '1px solid #e0e0e0',
          width: '100%',
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          {t('back')}
        </Button>

        <Button
          disabled={loading || ExperimentTasks.length < minimal_tasks}
          variant="contained"
          color="primary"
          onClick={handleCreate}
          startIcon={<CheckCircle />}
        >
          {t('create')}
        </Button>
      </Box>
    </FormStepContainer>
  );
};

export default ConfirmCreateExperiment;