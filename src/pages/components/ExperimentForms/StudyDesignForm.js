/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useContext } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import StepContext from './context/StepContext';
import FormStepContainer from '../../../components/Forms/FormStepContainer';
import { RULES_EXPERIMENT_TYPES } from './constants/experimentConstants';

const StudyDesignForm = () => {
  const { t } = useTranslation();
  const {
    step,
    setStep,
    ExperimentType,
    setExperimentType,
    BtypeExperiment,
    setBtypeExperiment,
    isEditMode,
    handleSaveExperiment,
    ExperimentTasks,
    ExperimentSurveys,
    BalancedRuleType,
    setBalancedRuleType,
    BalancedSurveyId,
    setBalancedSurveyId,
    BalancedQuestionIds,
    setBalancedQuestionIds,
  } = useContext(StepContext);

  const balancedSurvey = ExperimentSurveys?.find(
    (survey) => (survey._id || survey.uuid || survey.id) === BalancedSurveyId,
  );

  const handleBalancedSurveyChange = (event) => {
    setBalancedSurveyId(event.target.value);
    setBalancedQuestionIds([]);
  };

  const getMethodExplanation = () => {
    switch (BtypeExperiment) {
      case 'random':
        return t('explanation_random');
      case 'rules_based':
        return t('explanation_rules');
      case 'manual':
        return t('explanation_manual');
      case 'balanced':
        return t('explanation_balanced');
      default:
        return '';
    }
  };

  const isBetweenSubject = ExperimentType === 'between-subject';
  const minimumTasksRequired = isBetweenSubject ? 2 : 1;
  const hasEnoughTasks = ExperimentTasks && ExperimentTasks.length >= minimumTasksRequired;
  const isSaveDisabled = isEditMode && !hasEnoughTasks;

  return (
    <FormStepContainer>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        {t('step_design')}
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="type-label">{t('Experiment_Type')}</InputLabel>
        <Select
          labelId="type-label"
          label={t('Experiment_Type')}
          value={ExperimentType}
          onChange={(e) => setExperimentType(e.target.value)}
        >
          <MenuItem value="between-subject">{t('between-subject')}</MenuItem>
          <MenuItem value="within-subject">{t('within-subject')}</MenuItem>
        </Select>
      </FormControl>

      {ExperimentType === 'within-subject' && (
        <Alert severity="info" variant="outlined" sx={{ mt: 1, width: '100%' }}>
          {t('explanation_within')}
        </Alert>
      )}

      {ExperimentType === 'between-subject' && (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel id="method-label">{t('Group_Separation_Method')}</InputLabel>
            <Select
              labelId="method-label"
              label={t('Group_Separation_Method')}
              value={BtypeExperiment}
              onChange={(e) => setBtypeExperiment(e.target.value)}
            >
              <MenuItem value="random">{t('random')}</MenuItem>
              <MenuItem value="rules_based">{t('rules_based')}</MenuItem>
              <MenuItem value="manual">{t('manual')}</MenuItem>
              <MenuItem value="balanced">{t('balanced')}</MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info" variant="outlined" sx={{ mt: 1, width: '100%' }}>
            {getMethodExplanation()}
          </Alert>

          {BtypeExperiment === 'balanced' && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel id="balanced-survey-label">{t('select_survey')}</InputLabel>
                <Select
                  labelId="balanced-survey-label"
                  label={t('select_survey')}
                  value={BalancedSurveyId || ''}
                  onChange={handleBalancedSurveyChange}
                >
                  {ExperimentSurveys?.length > 0 ? (
                    ExperimentSurveys.map((survey) => (
                      <MenuItem
                        key={survey._id || survey.uuid || survey.id}
                        value={survey._id || survey.uuid || survey.id}
                      >
                        {survey.title}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>{t('no_survey_available')}</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="balanced-rule-label">{t('Separation_rule')}</InputLabel>
                <Select
                  labelId="balanced-rule-label"
                  label={t('Separation_rule')}
                  value={BalancedRuleType || 'score'}
                  onChange={(e) => setBalancedRuleType(e.target.value)}
                >
                  {RULES_EXPERIMENT_TYPES.map((stype) => (
                    <MenuItem key={stype.value} value={stype.value}>
                      {stype.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {BalancedRuleType === 'question' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="balanced-question-label">{t('select_question')}</InputLabel>
                  <Select
                    labelId="balanced-question-label"
                    label={t('select_question')}
                    value={BalancedQuestionIds || []}
                    onChange={(e) => setBalancedQuestionIds(e.target.value)}
                    multiple
                    renderValue={(selectedIds) =>
                      balancedSurvey?.questions
                        ?.filter((q) => selectedIds.includes(q.id))
                        .map((q) => q.statement || 'Sem enunciado')
                        .join(', ') || ''
                    }
                  >
                    {balancedSurvey?.questions && balancedSurvey.questions.length > 0 ? (
                      balancedSurvey.questions
                        .filter(
                          (q) =>
                            (q.type === 'multiple-selection' || q.type === 'multiple-choices') &&
                            q.hasscore,
                        )
                        .map((question) => (
                          <MenuItem key={question.id} value={question.id}>
                            <Checkbox
                              checked={(BalancedQuestionIds || []).includes(question.id)}
                            />
                            {question.statement || 'Sem enunciado'}
                          </MenuItem>
                        ))
                    ) : (
                      <MenuItem disabled>{t('no_questions_available')}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
            </>
          )}
        </>
      )}

      {isSaveDisabled && (
        <Alert severity="warning" variant="filled" sx={{ mt: 3, width: '100%' }}>
          {isBetweenSubject
            ? t('needs_at_least_2_tasks_to_save') ||
              "Para salvar como 'Between-subject', é necessário ter pelo menos 2 tarefas cadastradas. Por favor, crie as tarefas na aba 'Tarefas' primeiro."
            : t('needs_at_least_1_task_to_save') ||
              'Você precisa ter pelo menos 1 tarefa cadastrada para salvar o design.'}
        </Alert>
      )}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          justifyContent: isEditMode ? 'flex-end' : 'space-between',
          marginTop: 2,
          width: '100%',
        }}
      >
        {!isEditMode && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setStep(step - 1)}
            sx={{ maxWidth: '150px' }}
          >
            {t('back')}
          </Button>
        )}

        <Button
          variant="contained"
          color={isEditMode ? 'success' : 'primary'}
          onClick={isEditMode ? handleSaveExperiment : () => setStep(step + 1)}
          sx={{ maxWidth: '150px' }}
          disabled={isSaveDisabled}
        >
          {isEditMode ? t('save') : t('next')}
        </Button>
      </Box>

      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          justifyContent: isEditMode ? 'flex-end' : 'space-between',
          marginTop: 2,
          width: '100%',
        }}
      >
        {!isEditMode && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setStep(step - 1)}
            sx={{ maxWidth: '150px' }}
          >
            <ArrowBack />
          </Button>
        )}

        <Button
          variant="contained"
          color={isEditMode ? 'success' : 'primary'}
          onClick={isEditMode ? handleSaveExperiment : () => setStep(step + 1)}
          sx={{ maxWidth: '150px' }}
          disabled={isSaveDisabled}
        >
          {isEditMode ? t('save') : <ArrowForward />}
        </Button>
      </Box>
    </FormStepContainer>
  );
};

export default StudyDesignForm;
