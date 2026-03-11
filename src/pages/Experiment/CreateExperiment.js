/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState } from 'react';
import { api } from '../../config/axios';
import {
  Typography,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import ExperimentTask from '../components/ExperimentForms/ExperimentTask';
import ExperimentQuestionnaire from '../components/ExperimentForms/ExperimentQuestionnaire';
import StepContext from '../components/ExperimentForms/context/StepContext';
import ConfirmCreateExperiment from '../components/ExperimentForms/ConfirmCreateExperiment';
import ExperimentICF from '../components/ExperimentForms/ExperimentICF';
import ExperimentMetadataForm from '../components/ExperimentForms/ExperimentMetadataForm';
import StudyDesignForm from '../components/ExperimentForms/StudyDesignForm';

const CreateExperiment = () => {
  const { t } = useTranslation();
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [ExperimentTitle, setExperimentTitle] = useState('');
  const [ExperimentTitleICF, setExperimentTitleICF] = useState('');
  const [ExperimentDescICF, setExperimentDescICF] = useState('');
  const [ExperimentType, setExperimentType] = useState('within-subject');
  const [BtypeExperiment, setBtypeExperiment] = useState('random');
  const [ExperimentDesc, setExperimentDesc] = useState('');
  const [ExperimentTasks, setExperimentTasks] = useState([]);
  const [ExperimentSurveys, setExperimentSurveys] = useState([]);

  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);

  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'success',
    isLoading: false,
  });
  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback({ ...feedback, open: false });
  };

  const STEPS = [
    { index: 0, title: t('step_metadata') },
    { index: 1, title: t('ICF') },
    { index: 2, title: t('step_questionnaires') },
    { index: 3, title: t('step_design') },
    { index: 4, title: t('step_tasks') },
    { index: 5, title: t('step_review') },
  ];

  const handleSetStep = (newStep) => {
    setStep(newStep);
    if (newStep > maxStep) setMaxStep(newStep);
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= maxStep) setStep(stepIndex);
  };

  const handleCreateExperiment = async () => {
    setFeedback({
      open: true,
      message: t('Creating experiment...'),
      severity: 'info',
      isLoading: true,
    });

    try {
      const experimentIcf = {
        title: ExperimentTitleICF,
        description: ExperimentDescICF,
      };

      await api.post(
        `/experiment`,
        {
          ownerId: user.id,
          name: ExperimentTitle,
          summary: ExperimentDesc,
          typeExperiment: ExperimentType,
          betweenExperimentType: BtypeExperiment,
          surveysProps: ExperimentSurveys,
          tasksProps: ExperimentTasks,
          icf: experimentIcf,
        },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );

      setFeedback({
        open: true,
        message: t('Success') || 'Experimento criado!',
        severity: 'success',
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error(t('Error creating experiment'), error);
      setFeedback({
        open: true,
        message: t('Error') || 'Falha ao criar o experimento.',
        severity: 'error',
        isLoading: false,
      });
      return false;
    }
  };

  const CustomStepIcon = ({ active, completed, icon }) => {
    if (completed) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: '#1976d2',
            color: '#fff',
            fontSize: 16,
          }}
        >
          ✓
        </div>
      );
    }
    if (active) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: '#f2912d',
            color: '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            boxShadow: '0 0 0 4px rgba(242, 145, 45, 0.25)',
          }}
        >
          {icon}
        </div>
      );
    }
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: '50%',
          backgroundColor: '#e0e0e0',
          color: '#9e9e9e',
          fontSize: 14,
        }}
      >
        {icon}
      </div>
    );
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {t('Experiment_create')}
      </Typography>

      <Stepper sx={{ display: { xs: 'none', sm: 'flex' } }} activeStep={step} alternativeLabel>
        {STEPS.map((s) => (
          <Step key={s.index} completed={s.index < step}>
            <StepLabel
              StepIconComponent={CustomStepIcon}
              onClick={() => handleStepClick(s.index)}
              sx={{
                cursor: s.index <= maxStep ? 'pointer' : 'default',
                opacity: s.index <= maxStep ? 1 : 0.5,
              }}
            >
              {s.title}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Stepper
        sx={{ display: { xs: 'flex', sm: 'none' } }}
        activeStep={step}
        alternativeLabel
        nonLinear
      >
        {STEPS.map((s) => {
          if (s.index >= step - 1 && s.index <= step + 1) {
            return (
              <Step key={s.index} completed={s.index < step}>
                <StepLabel
                  StepIconComponent={CustomStepIcon}
                  onClick={() => handleStepClick(s.index)}
                  sx={{ cursor: s.index <= maxStep ? 'pointer' : 'default' }}
                >
                  {s.title}
                </StepLabel>
              </Step>
            );
          }
        })}
      </Stepper>

      <StepContext.Provider
        value={{
          step,
          setStep: handleSetStep,
          handleCreateExperiment,
          ExperimentTitle,
          setExperimentTitle,
          ExperimentType,
          setExperimentType,
          BtypeExperiment,
          setBtypeExperiment,
          ExperimentDesc,
          setExperimentDesc,
          ExperimentTasks,
          setExperimentTasks,
          ExperimentSurveys,
          setExperimentSurveys,
          ExperimentTitleICF,
          setExperimentTitleICF,
          ExperimentDescICF,
          setExperimentDescICF,
        }}
      >
        {step === 0 && <ExperimentMetadataForm />}
        {step === 1 && <ExperimentICF />}
        {step === 2 && <ExperimentQuestionnaire />}
        {step === 3 && <StudyDesignForm />}
        {step === 4 && <ExperimentTask />}
        {step === 5 && <ConfirmCreateExperiment />}
      </StepContext.Provider>

      <Snackbar
        open={feedback.open}
        autoHideDuration={feedback.isLoading ? null : 4000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
          icon={feedback.isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateExperiment;
