/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, CancelOutlined, Done } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { api } from '../../config/axios';
import useQuestionnaireForm from '../Questionnaire/useQuestionnaireForm';
import QuestionCard from '../Questionnaire/QuestionCard';
import { useState } from 'react';

const SURVEY_TYPES = (t) => [
  { value: 'pre', label: t('pre') },
  { value: 'post', label: t('post') },
];

const QUESTION_TYPES = (t) => [
  { value: 'multiple-choices', label: t('multiple_choices') },
  { value: 'multiple-selection', label: t('multiple_selection') },
  { value: 'open', label: t('open') },
];

const CreateQuestionnaire = ({
  isCreateQuestOpen,
  toggleCreateQuest,
  setExperimentSurveys,
  fetch = false,
}) => {
  const { t } = useTranslation();
  const { experimentId } = useParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [user] = useState(JSON.parse(localStorage.getItem('user')));

  const {
    title,
    setTitle,
    description,
    setDescription,
    type,
    setType,
    uniqueAnswer,
    setUniqueAnswer,
    questions,
    addQuestion,
    removeQuestion,
    updateQuestion,
    isValid,
    buildPayload,
    reset,
    hasEmptyStatement,
  } = useQuestionnaireForm();

  const surveyTypes = SURVEY_TYPES(t);
  const questionTypes = QUESTION_TYPES(t);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    const payload = buildPayload();

    if (fetch) {
      try {
        payload.experimentId = experimentId;

        const response = await api.post('/survey', payload, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        payload._id = response.data._id || response.data.id;
        setExperimentSurveys((prev) => [...prev, payload]);
      } catch (error) {
        console.error('Erro ao criar questionário:', error);
        setSnackbar({ open: true, message: t('error_creating_survey'), severity: 'error' });
        setIsLoading(false);
        return;
      }
    } else {
      setExperimentSurveys((prev) => [...prev, payload]);
    }

    setIsLoading(false);
    reset();
    toggleCreateQuest();
  };

  return (
    <Dialog
      open={isCreateQuestOpen}
      onClose={toggleCreateQuest}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: 0, sm: 4 },
          height: { xs: '100vh', sm: 'auto' },
          maxHeight: '90vh',
          maxWidth: { xs: '100vw', sm: '900px' },
          width: '100%',
        },
      }}
    >
      <DialogContent sx={{ backgroundColor: '#f9f9f9', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          {t('create_survey')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: 2,
              p: 2,
              mb: 3,
              borderTop: '7px solid #0d5086',
              boxShadow: 1,
            }}
          >
            <FormControl fullWidth margin="normal" variant="filled">
              <InputLabel>{t('surveyType')}</InputLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {surveyTypes.map((st) => (
                  <MenuItem key={st.value} value={st.value}>
                    {st.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('surveyTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              margin="normal"
              variant="filled"
              sx={{ backgroundColor: '#fff' }}
            />
            <TextField
              label={t('surveyDescription')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              multiline
              rows={3}
              margin="normal"
              variant="filled"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(uniqueAnswer)}
                  onChange={(e) => setUniqueAnswer(e.target.checked)}
                />
              }
              label={<Typography variant="body2">{t('unique_answer')}</Typography>}
              sx={{ mt: 1 }}
            />
          </Box>

          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            {t('questions')}
          </Typography>

          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={idx}
              questionTypes={questionTypes}
              t={t}
              onUpdate={updateQuestion}
              onRemove={removeQuestion}
            />
          ))}

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addQuestion}
            fullWidth
            sx={{ mb: 3, borderStyle: 'dashed' }}
          >
            {t('addQuestion')}
          </Button>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={toggleCreateQuest}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isValid || hasEmptyStatement || isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : t('create_survey')}
            </Button>
          </Box>
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'space-between', mt: 2 }}>
            <Button variant="contained" color="primary" onClick={toggleCreateQuest}>
              <CancelOutlined />
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isValid || isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : <Done />}
            </Button>
          </Box>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestionnaire;
