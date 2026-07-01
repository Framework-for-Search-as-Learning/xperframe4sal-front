/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useRef, useState } from 'react';
import * as yaml from 'js-yaml';
import { api } from '../../config/axios';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import ExperimentTask from '../components/ExperimentForms/ExperimentTask';
import ExperimentQuestionnaire from '../components/ExperimentForms/ExperimentQuestionnaire';
import StepContext from '../components/ExperimentForms/context/StepContext';
import ConfirmCreateExperiment from '../components/ExperimentForms/ConfirmCreateExperiment';
import ExperimentICF from '../components/ExperimentForms/ExperimentICF';
import ExperimentMetadataForm from '../components/ExperimentForms/ExperimentMetadataForm';
import StudyDesignForm from '../components/ExperimentForms/StudyDesignForm';
import {
  clearExperimentDraft,
  isExperimentDraftMeaningful,
  loadExperimentDraft,
  useExperimentDraftAutosave,
} from '../../hooks/useExperimentDraftAutosave';

const CreateExperiment = () => {
  const { t } = useTranslation();
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [pendingDraft] = useState(() => loadExperimentDraft(user?.id));
  const [isDraftPromptOpen, setIsDraftPromptOpen] = useState(() =>
    isExperimentDraftMeaningful(pendingDraft),
  );
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
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(true);

  const [saveFailure, setSaveFailure] = useState({ open: false, message: '' });
  const draftFileInputRef = useRef(null);

  const applyDraftValues = (values) => {
    setExperimentTitle(values.ExperimentTitle || '');
    setExperimentTitleICF(values.ExperimentTitleICF || '');
    setExperimentDescICF(values.ExperimentDescICF || '');
    setExperimentType(values.ExperimentType || 'within-subject');
    setBtypeExperiment(values.BtypeExperiment || 'random');
    setExperimentDesc(values.ExperimentDesc || '');
    setExperimentTasks(values.ExperimentTasks || []);
    setExperimentSurveys(values.ExperimentSurveys || []);
    setStep(values.step || 0);
    setMaxStep(values.maxStep || 0);
    setCompletedSteps(new Set(values.completedSteps || []));
    setIsDraftPromptOpen(false);
  };

  const handleResumeDraft = () => applyDraftValues(pendingDraft);

  const handleDiscardDraft = () => {
    clearExperimentDraft(user?.id);
    setIsDraftPromptOpen(false);
  };

  const currentDraftValues = {
    step,
    maxStep,
    completedSteps: [...completedSteps],
    ExperimentTitle,
    ExperimentTitleICF,
    ExperimentDescICF,
    ExperimentType,
    BtypeExperiment,
    ExperimentDesc,
    ExperimentTasks,
    ExperimentSurveys,
  };

  useExperimentDraftAutosave(user?.id, currentDraftValues, { enabled: !isDraftPromptOpen });

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

  const getExperimentErrorMessage = (error) => {
    if (!error?.response) {
      return t('experiment_create_network_error');
    }
    const data = error.response.data;
    if (Array.isArray(data?.message)) {
      return data.message.map((msg) => t(msg, { defaultValue: msg })).join(' ');
    }
    if (typeof data?.message === 'string') {
      return t(data.message, { defaultValue: data.message });
    }
    return t('experiment_create_unknown_error');
  };

  // Backup export/import happens entirely client-side: this is the escape
  // hatch offered when the backend is unreachable, so it must not itself
  // depend on the backend.
  const handleDownloadDraftBackup = () => {
    try {
      const yamlContent = yaml.dump(currentDraftValues);
      const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
      const url = window.URL.createObjectURL(blob);
      const slug =
        (ExperimentTitle || 'experimento').trim().replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 60) ||
        'experimento';

      const link = document.createElement('a');
      link.href = url;
      link.download = `rascunho_${slug}.yaml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar rascunho:', error);
      setFeedback({
        open: true,
        message: t('draft_export_error'),
        severity: 'error',
        isLoading: false,
      });
    }
  };

  const handleDraftFileSelected = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
      setFeedback({
        open: true,
        message: t('import_invalid_file'),
        severity: 'error',
        isLoading: false,
      });
      return;
    }

    try {
      const text = await file.text();
      const parsed = yaml.load(text);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Invalid draft structure');
      }
      applyDraftValues(parsed);
      setFeedback({
        open: true,
        message: t('draft_imported_success'),
        severity: 'success',
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao importar rascunho:', error);
      setFeedback({
        open: true,
        message: t('draft_import_invalid_file'),
        severity: 'error',
        isLoading: false,
      });
    }
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
    if (newStep > step && !isCurrentStepValid) return;
    if (newStep > step) {
      setCompletedSteps((prev) => new Set([...prev, step]));
    }
    setIsCurrentStepValid(true);
    setStep(newStep);
    if (newStep > maxStep) setMaxStep(newStep);
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex > step && !isCurrentStepValid) return;
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

      clearExperimentDraft(user?.id);
      setFeedback({
        open: true,
        message: t('Success') || 'Experimento criado!',
        severity: 'success',
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error('Erro ao criar experimento:', error);
      setFeedback({ open: false, message: '', severity: 'error', isLoading: false });
      setSaveFailure({ open: true, message: getExperimentErrorMessage(error) });
      return false;
    }
  };

  const handleRetryCreateExperiment = () => {
    setSaveFailure({ open: false, message: '' });
    handleCreateExperiment();
  };

  const makeStepIcon =
    (completedSteps) =>
    ({ active, icon }) => {
      const isCompleted = completedSteps.has(icon - 1);

      if (isCompleted) {
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
  const CustomStepIcon = makeStepIcon(completedSteps);

  return (
    <>
      <Dialog open={isDraftPromptOpen} onClose={handleDiscardDraft}>
        <DialogTitle>{t('resume_draft_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('resume_draft_message')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiscardDraft}>{t('resume_draft_discard')}</Button>
          <Button onClick={handleResumeDraft} variant="contained" autoFocus>
            {t('resume_draft_continue')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={saveFailure.open}
        onClose={() => setSaveFailure({ open: false, message: '' })}
      >
        <DialogTitle>{t('experiment_save_failed_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>{saveFailure.message}</DialogContentText>
          <DialogContentText>{t('experiment_save_failed_message')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveFailure({ open: false, message: '' })}>{t('close')}</Button>
          <Button onClick={handleDownloadDraftBackup}>{t('download_draft_backup')}</Button>
          <Button onClick={handleRetryCreateExperiment} variant="contained" autoFocus>
            {t('retry')}
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h4" component="h1" gutterBottom align="center">
        {t('Experiment_create')}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <input
          ref={draftFileInputRef}
          type="file"
          accept=".yaml,.yml"
          style={{ display: 'none' }}
          onChange={handleDraftFileSelected}
        />
        <Button size="small" onClick={() => draftFileInputRef.current?.click()}>
          {t('import_draft')}
        </Button>
      </Box>

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
        {STEPS.filter((s) => s.index >= step - 1 && s.index <= step + 1).map((s) => (
          <Step key={s.index} completed={s.index < step}>
            <StepLabel
              StepIconComponent={CustomStepIcon}
              onClick={() => handleStepClick(s.index)}
              sx={{ cursor: s.index <= maxStep ? 'pointer' : 'default' }}
            >
              {s.title}
            </StepLabel>
          </Step>
        ))}
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
          isCurrentStepValid,
          setIsCurrentStepValid,
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
