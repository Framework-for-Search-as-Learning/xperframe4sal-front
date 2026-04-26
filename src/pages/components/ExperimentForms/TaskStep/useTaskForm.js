/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useState } from 'react';
import { INITIAL_FORM_STATE } from '../constants/experimentConstants';

export const useTaskForm = (mode = 'create', initialData = null) => {
  const [formState, setFormState] = useState(initialData || { ...INITIAL_FORM_STATE });

  const setTaskTitle = (value) => setFormState((prev) => ({ ...prev, taskTitle: value }));
  const setTaskSummary = (value) => setFormState((prev) => ({ ...prev, taskSummary: value }));
  const setTaskDescription = (value) =>
    setFormState((prev) => ({ ...prev, taskDescription: value }));
  const setOrigin = (value) => setFormState((prev) => ({ ...prev, origin: value }));
  const setLlm = (value) => setFormState((prev) => ({ ...prev, llm: value }));
  const setSearchEngine = (value) => setFormState((prev) => ({ ...prev, searchEngine: value }));
  const setGeminiApiKey = (value) => setFormState((prev) => ({ ...prev, geminiApiKey: value }));
  const setSystemInstruction = (value) =>
    setFormState((prev) => ({ ...prev, systemInstruction: value }));
  const setGoogleApikey = (value) => setFormState((prev) => ({ ...prev, googleApiKey: value }));
  const setGoogleCx = (value) => setFormState((prev) => ({ ...prev, googleCx: value }));
  const setRulesExperiment = (value) =>
    setFormState((prev) => ({ ...prev, RulesExperiment: value }));
  const setSelectedSurvey = (value) => setFormState((prev) => ({ ...prev, SelectedSurvey: value }));
  const setSelectedQuestionIds = (value) =>
    setFormState((prev) => ({ ...prev, selectedQuestionIds: value }));
  const setScoreThreshold = (value) => setFormState((prev) => ({ ...prev, ScoreThreshold: value }));
  const setScoreThresholdmx = (value) =>
    setFormState((prev) => ({ ...prev, ScoreThresholdmx: value }));
  const setIsValidTitleTask = (value) =>
    setFormState((prev) => ({ ...prev, isValidTitleTask: value }));
  const setIsValidSumaryTask = (value) =>
    setFormState((prev) => ({ ...prev, isValidSumaryTask: value }));
  const setSelectedQuestion = (value) =>
    setFormState((prev) => ({ ...prev, selectedQuestion: value }));
  const setscoreType = (value) => setFormState((prev) => ({ ...prev, scoreType: value }));
  const setLlmProvider = (value) => setFormState((prev) => ({ ...prev, llmProvider: value }));
  const setLinkedSurveyRefs = (value) =>
    setFormState((prev) => ({ ...prev, linkedSurveyRefs: value }));

  const resetForm = () => {
    setFormState({ ...INITIAL_FORM_STATE });
  };

  const loadTaskData = (task) => {
    setFormState({
      taskTitle: task.title,
      taskSummary: task.summary,
      taskDescription: task.description,
      origin: task.search_source,
      llm: task.search_model,
      llmProvider: task.llmProvider || '',
      searchEngine: task.search_model,
      geminiApiKey: task.geminiApiKey || '',
      systemInstruction: task.systemInstruction || '',
      googleApiKey: task.googleApiKey || '',
      googleCx: task.googleCx || '',
      RulesExperiment: task.RulesExperiment,
      SelectedSurvey: task.SelectedSurvey,
      selectedQuestionIds: task.selectedQuestionIds || [],
      ScoreThreshold: task.ScoreThreshold,
      ScoreThresholdmx: task.ScoreThresholdmx,
      isValidTitleTask: true,
      isValidSumaryTask: true,
      selectedQuestion: null,
      scoreType: task.ScoreThreshold !== '' && task.ScoreThresholdmx !== '0' ? 'min_max' : 'unic',
    });
  };

  const buildTaskObject = () => {
    const providerConfig = {};

    if (formState.origin === 'llm') {
      providerConfig.modelProvider = formState.llmProvider;
      providerConfig.model = formState.llm;
      if (formState.geminiApiKey?.trim()) {
        providerConfig.apiKey = formState.geminiApiKey;
      }
      if (formState.systemInstruction?.trim()) {
        providerConfig.systemInstruction = formState.systemInstruction;
      }
    } else if (formState.origin === 'search-engine') {
      providerConfig.searchProvider = formState.searchEngine;
      if (formState.googleApiKey?.trim()) {
        providerConfig.apiKey = formState.googleApiKey;
      }
      providerConfig.cx = formState.googleCx;
    }

    const questionIds =
      formState.RulesExperiment === 'score'
        ? null
        : formState.selectedQuestionIds?.map((q) => q.id) || [];

    const surveyId =
      formState.SelectedSurvey?._id ||
      formState.SelectedSurvey?.uuid ||
      formState.SelectedSurvey?.id ||
      null;

    return {
      title: formState.taskTitle,
      summary: formState.taskSummary,
      description: formState.taskDescription,
      rule_type: formState.RulesExperiment,
      survey_id: surveyId,
      questionsId: questionIds,
      min_score: Number(formState.ScoreThreshold) || 0,
      max_score: Number(formState.ScoreThresholdmx) || 0,
      search_source: formState.origin,
      provider_config: providerConfig,
      linkedSurveyRefs: formState.linkedSurveyRefs || [],
      RulesExperiment: formState.RulesExperiment,
      SelectedSurvey: surveyId,
      selectedQuestionIds: questionIds,
      ScoreThreshold: formState.ScoreThreshold,
      ScoreThresholdmx: formState.ScoreThresholdmx,
    };
  };

  return {
    formState,
    setFormState,
    setTaskTitle,
    setTaskSummary,
    setTaskDescription,
    setOrigin,
    setLlm,
    setLlmProvider,
    setSearchEngine,
    setGeminiApiKey,
    setSystemInstruction,
    setGoogleApikey,
    setGoogleCx,
    setRulesExperiment,
    setSelectedSurvey,
    setSelectedQuestionIds,
    setScoreThreshold,
    setScoreThresholdmx,
    setIsValidTitleTask,
    setIsValidSumaryTask,
    setSelectedQuestion,
    setscoreType,
    setLinkedSurveyRefs,
    resetForm,
    loadTaskData,
    buildTaskObject,
  };
};
