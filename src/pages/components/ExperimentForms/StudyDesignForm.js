/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useContext, useState } from 'react';
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
  Link,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArrowBack, ArrowForward, Save as SaveIcon } from '@mui/icons-material';
import StepContext from './context/StepContext';
import FormStepContainer from '../../../components/Forms/FormStepContainer';
import GroupSeparationInfoModal from '../../../components/Modals/GroupSeparationInfoModal';
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

  const [isSeparationInfoOpen, setIsSeparationInfoOpen] = useState(false);

  const balancedSurvey = ExperimentSurveys?.find(
    (survey) => (survey._id || survey.uuid || survey.id) === BalancedSurveyId,
  );

  const handleBalancedSurveyChange = (event) => {
    setBalancedSurveyId(event.target.value);
    setBalancedQuestionIds([]);
  };

  const getMethodExplanation = () => {
    if (ExperimentType === 'within-subject') {
      return t('explanation_within');
    }
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

  // Suas regras originais de validação de tarefas
  const isBetweenSubject = ExperimentType === 'between-subject';
  const minimumTasksRequired = isBetweenSubject ? 2 : 1;
  const hasEnoughTasks = ExperimentTasks && ExperimentTasks.length >= minimumTasksRequired;
  const isSaveDisabled = isEditMode && !hasEnoughTasks;

  // Regra adicional: Validação para o método Balanceado
  const isBalancedIncomplete =
    isBetweenSubject &&
    BtypeExperiment === 'balanced' &&
    (!BalancedSurveyId || (BalancedRuleType === 'question' && (!BalancedQuestionIds || BalancedQuestionIds.length === 0)));

  const isButtonDisabled = isSaveDisabled || isBalancedIncomplete;

  return (
    <FormStepContainer>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        {t('step_design')}
      </Typography>

      {(ExperimentType === 'within-subject' || (isBetweenSubject && BtypeExperiment)) && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2, width: '100%' }}>
          {getMethodExplanation()}{' '}
          <Link
            component="button"
            type="button"
            onClick={() => setIsSeparationInfoOpen(true)}
            sx={{ fontWeight: 600, verticalAlign: 'baseline' }}
          >
            {t('learn_more')}
          </Link>
        </Alert>
      )}

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
                <FormControl
                  fullWidth
                  margin="normal"
                  sx={{ minWidth: 0, maxWidth: '100%' }}
                >
                  <InputLabel id="balanced-question-label">{t('select_question')}</InputLabel>
                  <Select
                    labelId="balanced-question-label"
                    label={t('select_question')}
                    value={BalancedQuestionIds || []}
                    onChange={(e) => setBalancedQuestionIds(e.target.value)}
                    multiple
                    sx={{
                      minWidth: 0,
                      maxWidth: '100%',
                      '& .MuiSelect-select': {
                        display: 'block',
                        minWidth: 0,
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }}
                    renderValue={(selectedIds) => {
                      const labels =
                        balancedSurvey?.questions
                          ?.filter((q) => selectedIds.includes(q.id))
                          .map((q) => q.statement || 'Sem enunciado') || [];

                      if (labels.length === 0) return '';
                      if (labels.length === 1) return labels[0];
                      return t('questions_selected_count', { count: labels.length });
                    }}
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
          display: 'flex',
          justifyContent: isEditMode ? 'flex-end' : 'space-between',
          alignItems: 'center',
          mt: 3,
          pt: 2,
          borderTop: '1px solid #e0e0e0',
          width: '100%',
        }}
      >
        {!isEditMode && (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => setStep(step - 1)}
          >
            {t('back')}
          </Button>
        )}

        {isEditMode ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveExperiment}
            disabled={isButtonDisabled}
            startIcon={<SaveIcon />}
          >
            {t('save')}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setStep(step + 1)}
            disabled={isButtonDisabled}
            endIcon={<ArrowForward />}
          >
            {t('next')}
          </Button>
        )}
      </Box>

      <GroupSeparationInfoModal
        open={isSeparationInfoOpen}
        onClose={() => setIsSeparationInfoOpen(false)}
      />
    </FormStepContainer>
  );
};

export default StudyDesignForm;