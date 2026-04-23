/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useCallback, useState, useEffect } from 'react';
import { api } from '../../config/axios';
import 'react-quill/dist/quill.snow.css';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  Divider,
  ListItemText,
  Drawer,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ListAltIcon from '@mui/icons-material/ListAlt';
import QuizIcon from '@mui/icons-material/Quiz';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useExperimentAuth } from '../../hooks/useExperimentAuth';

import ExperimentMetadataForm from '../components/ExperimentForms/ExperimentMetadataForm';
import StudyDesignForm from '../components/ExperimentForms/StudyDesignForm';
import ExperimentICF from '../components/ExperimentForms/ExperimentICF';
import ExperimentQuestionnaire from '../components/ExperimentForms/ExperimentQuestionnaire';
import ExperimentTask from '../components/ExperimentForms/ExperimentTask';
import StepContext from '../components/ExperimentForms/context/StepContext';

const drawerWidth = 300;
const appBarHeight = 64;

const EditExperiment = () => {
  const { t } = useTranslation();
  const { experimentId } = useParams();
  const [user] = useState(JSON.parse(localStorage.getItem('user')));

  const { isLoading, isAuthorized, data: experimentData } = useExperimentAuth(experimentId, user);

  const [step, setStep] = useState(0);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(true);
  const [ExperimentTitle, setExperimentTitle] = useState('');
  const [ExperimentType, setExperimentType] = useState('within-subject');
  const [BtypeExperiment, setBtypeExperiment] = useState('random');
  const [ExperimentDesc, setExperimentDesc] = useState('');
  const [Icfid, setIcfid] = useState('');
  const [ExperimentTitleICF, setExperimentTitleICF] = useState('');
  const [ExperimentDescICF, setExperimentDescICF] = useState('');
  const [ExperimentTasks, setExperimentTasks] = useState([]);
  const [ExperimentSurveys, setExperimentSurveys] = useState([]);

  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback({ ...feedback, open: false });
  };

  const steps = [
    { label: t('edit_form'), icon: <EditNoteIcon /> },
    { label: t('edit_icf'), icon: <AssignmentIndIcon /> },
    { label: t('step_questionnaires'), icon: <QuizIcon /> },
    { label: t('step_design'), icon: <SettingsIcon /> },
    { label: t('edit_task'), icon: <ListAltIcon /> },
  ];

  const fetchIcf = useCallback(async () => {
    try {
      const { data } = await api.get(`/icf/experiment/${experimentId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setExperimentTitleICF(data.title || '');
      setExperimentDescICF(data.description || '');
      setIcfid(data._id || '');
    } catch (err) {
      console.error('Error fetching ICF:', err);
    }
  }, [experimentId, user.accessToken]);

  const fetchSurvey = useCallback(async () => {
    try {
      const response = await api.get(`/survey/experiment/${experimentId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setExperimentSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  }, [experimentId, user.accessToken]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get(`/task/experiment/${experimentId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setExperimentTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [experimentId, user.accessToken]);

  useEffect(() => {
    if (isAuthorized && experimentData) {
      setExperimentTitle(experimentData.name || '');
      setExperimentType(experimentData.typeExperiment || 'within-subject');
      setBtypeExperiment(experimentData.betweenExperimentType || 'random');
      setExperimentDesc(experimentData.summary || '');

      fetchIcf();
      fetchSurvey();
      fetchTasks();
    }
  }, [isAuthorized, experimentData, fetchIcf, fetchSurvey, fetchTasks]);

  const handleSaveExperiment = async () => {
    try {
      if (step === 0 || step === 3) {
        const updatedExperiment = {
          name: ExperimentTitle,
          summary: ExperimentDesc,
          typeExperiment: ExperimentType,
          betweenExperimentType: BtypeExperiment,
        };
        await api.patch(`/experiment/${experimentId}`, updatedExperiment, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
      } else if (step === 1) {
        const updatedIcf = {
          title: ExperimentTitleICF,
          description: ExperimentDescICF,
        };
        await api.patch(`/icf/${Icfid}`, updatedIcf, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
      }

      setFeedback({
        open: true,
        message: t('success_edit') || 'Salvo com sucesso!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setFeedback({ open: true, message: t('error') || 'Erro ao salvar.', severity: 'error' });
    }
  };

  if (isLoading) return <CircularProgress />;
  if (!isAuthorized) return null;

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            top: appBarHeight,
            height: `calc(100% - ${appBarHeight}px)`,
            backgroundColor: '#f9f9f9',
          },
        }}
      >
        <List>
          <Typography align="center" variant="h6" sx={{ p: 1 }}>
            {t('edit_experiment')}
          </Typography>
          <Divider />
          {steps.map((s, index) => (
            <ListItemButton
              key={s.label}
              selected={index === step}
              onClick={() => setStep(index)}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                backgroundColor: index === step ? 'primary.light' : 'transparent',
              }}
            >
              <ListItemIcon>{s.icon}</ListItemIcon>
              <ListItemText primary={s.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, position: 'relative' }}>
        <StepContext.Provider
          value={{
            step,
            setStep,
            isCurrentStepValid,
            setIsCurrentStepValid,
            isEditMode: true,
            handleSaveExperiment,
            ExperimentTitle,
            setExperimentTitle,
            ExperimentType,
            setExperimentType,
            BtypeExperiment,
            setBtypeExperiment,
            ExperimentDesc,
            setExperimentDesc,
            ExperimentTitleICF,
            setExperimentTitleICF,
            ExperimentDescICF,
            setExperimentDescICF,
            ExperimentSurveys,
            setExperimentSurveys,
            ExperimentTasks,
            setExperimentTasks,
          }}
        >
          {step === 0 && <ExperimentMetadataForm />}
          {step === 1 && <ExperimentICF />}
          {step === 2 && <ExperimentQuestionnaire />}
          {step === 3 && <StudyDesignForm />}
          {step === 4 && <ExperimentTask />}
        </StepContext.Provider>

        <Snackbar
          open={feedback.open}
          autoHideDuration={4000}
          onClose={handleCloseFeedback}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
            {feedback.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default EditExperiment;
