/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  ListItemText,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { api } from '../../../config/axios';
import StepContext from './context/StepContext';
import CreateQuestionnaire from '../../../components/Modals/CreateQuestionnaire';
import EditQuestionnaireDialog from '../../../components/Modals/EditQuestionnaireDialog';
import NotFound from '../../../components/NotFound';

const ExperimentQuestionnaire = () => {
  const {
    step,
    setStep,
    ExperimentSurveys,
    setExperimentSurveys,
    isEditMode,
    setIsCurrentStepValid,
  } = useContext(StepContext);
  const { t } = useTranslation();
  const [user] = useState(JSON.parse(localStorage.getItem('user')));

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openDescIds, setOpenDescIds] = useState([]);

  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseFeedback = () => setFeedback({ ...feedback, open: false });

  const toggleDesc = (id) =>
    setOpenDescIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSaveEdit = async (updatedSurvey) => {
    if (isEditMode) {
      try {
        const surveyId = updatedSurvey._id || updatedSurvey.id || updatedSurvey.uuid;

        if (!surveyId) {
          throw new Error('ID do questionário está ausente.');
        }

        const { uuid, _id, id, ...surveyToSend } = updatedSurvey;
        await api.patch(`/survey/${surveyId}`, surveyToSend, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        setFeedback({
          open: true,
          message: t('success_edit') || 'Questionário salvo com sucesso!',
          severity: 'success',
        });
      } catch (error) {
        console.error('Erro ao atualizar o questionário:', error);
        setFeedback({
          open: true,
          message: t('error') || 'Erro ao salvar o questionário.',
          severity: 'error',
        });
        return;
      }
    }
    setExperimentSurveys((prev) => {
      const next = [...prev];
      next[editTarget.index] = updatedSurvey;
      return next;
    });
    setEditTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (isEditMode) {
      try {
        const surveyToDelete = ExperimentSurveys[deleteTarget];
        const surveyId = surveyToDelete._id || surveyToDelete.id || surveyToDelete.uuid;

        await api.delete(`/survey/${surveyId}`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setFeedback({
          open: true,
          message: t('success_delete') || 'Questionário excluído!',
          severity: 'success',
        });
      } catch (error) {
        console.error('Erro ao deletar do banco:', error);
        setFeedback({ open: true, message: t('error') || 'Erro ao excluir.', severity: 'error' });
        return;
      }
    }

    setExperimentSurveys((prev) => prev.filter((_, i) => i !== deleteTarget));
    setDeleteTarget(null);
  };

  useEffect(() => {
    setIsCurrentStepValid(Array.isArray(ExperimentSurveys) && ExperimentSurveys.length > 0);
  }, [ExperimentSurveys, setIsCurrentStepValid]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        marginTop: 5,
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', sm: '60%' },
          padding: { xs: 1, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: 4,
          mx: 'auto',
        }}
      >
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          {t('step_questionnaires')}
        </Typography>
        {Array.isArray(ExperimentSurveys) && ExperimentSurveys.length > 0 ? (
          <FormControl fullWidth sx={{ minHeight: 300, maxHeight: 300, overflowY: 'auto' }}>
            {ExperimentSurveys.map((survey, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  mb: 1,
                  p: 1,
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  boxShadow: 1,
                  wordBreak: 'break-word',
                  '&:hover': { backgroundColor: '#e6f7ff' },
                }}
              >
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <ListItemText primary={survey.title} sx={{ ml: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton color="error" onClick={() => setDeleteTarget(index)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => setEditTarget({ index, survey })}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => toggleDesc(index)}>
                      {openDescIds.includes(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>
                {openDescIds.includes(index) && (
                  <Box
                    sx={{
                      p: 1,
                      backgroundColor: '#E8E8E8',
                      borderRadius: '4px',
                      maxHeight: 150,
                      overflowY: 'auto',
                    }}
                    dangerouslySetInnerHTML={{ __html: survey.description }}
                  />
                )}
              </Box>
            ))}
          </FormControl>
        ) : (
          <NotFound title={t('NSurveysFound')} subTitle={t('Nosurveyscreated')} />
        )}

        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            justifyContent: isEditMode ? 'flex-end' : 'space-between',
            mt: 2,
          }}
        >
          {!isEditMode && (
            <Button variant="contained" onClick={() => setStep(step - 1)}>
              {t('back')}
            </Button>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
              {t('create_survey')}
            </Button>
            {!isEditMode && (
              <Button
                variant="contained"
                onClick={() => setStep(step + 1)}
                disabled={!Array.isArray(ExperimentSurveys) || ExperimentSurveys.length === 0}
              >
                {t('next')}
              </Button>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            justifyContent: isEditMode ? 'center' : 'space-between',
            mt: 2,
          }}
        >
          {!isEditMode && (
            <Button variant="contained" onClick={() => setStep(step - 1)}>
              <ArrowBack />
            </Button>
          )}
          <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
            {t('create_survey')}
          </Button>
          {!isEditMode && (
            <Button variant="contained" onClick={() => setStep(step + 1)}>
              <ArrowForward />
            </Button>
          )}
        </Box>
      </Box>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px', p: 4 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {t('confirm_delete')}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', color: '#6b7280' }}>
          <p style={{ margin: '0 0 24px', lineHeight: 1.5 }}>{t('delete_confirmation_message')}</p>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button variant="outlined" onClick={() => setDeleteTarget(null)}>
              {t('cancel')}
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirmDelete}>
              {t('delete')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <CreateQuestionnaire
        isCreateQuestOpen={isCreateOpen}
        toggleCreateQuest={() => setIsCreateOpen(false)}
        setExperimentSurveys={setExperimentSurveys}
        fetch={isEditMode}
      />

      {editTarget && (
        <EditQuestionnaireDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          survey={editTarget.survey}
          onSave={handleSaveEdit}
        />
      )}

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
  );
};

export default ExperimentQuestionnaire;
