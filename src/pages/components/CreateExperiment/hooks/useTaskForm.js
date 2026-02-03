import { useState } from "react";
import { INITIAL_FORM_STATE } from "../constants/experimentConstants";

/**
 * Custom hook to manage task form state (both create and edit modes)
 * @param {string} mode - 'create' or 'edit'
 * @param {object} initialData - Initial data for edit mode
 */
export const useTaskForm = (mode = "create", initialData = null) => {
  const [formState, setFormState] = useState(
    initialData || INITIAL_FORM_STATE
  );

  // Individual setters for backward compatibility
  const setTaskTitle = (value) =>
    setFormState((prev) => ({ ...prev, taskTitle: value }));
  const setTaskSummary = (value) =>
    setFormState((prev) => ({ ...prev, taskSummary: value }));
  const setTaskDescription = (value) =>
    setFormState((prev) => ({ ...prev, taskDescription: value }));
  const setOrigin = (value) =>
    setFormState((prev) => ({ ...prev, origin: value }));
  const setLlm = (value) => setFormState((prev) => ({ ...prev, llm: value }));
  const setSearchEngine = (value) =>
    setFormState((prev) => ({ ...prev, searchEngine: value }));
  const setGeminiApiKey = (value) =>
    setFormState((prev) => ({ ...prev, geminiApiKey: value }));
  const setGoogleApikey = (value) =>
    setFormState((prev) => ({ ...prev, googleApiKey: value }));
  const setGoogleCx = (value) =>
    setFormState((prev) => ({ ...prev, googleCx: value }));
  const setRulesExperiment = (value) =>
    setFormState((prev) => ({ ...prev, RulesExperiment: value }));
  const setSelectedSurvey = (value) =>
    setFormState((prev) => ({ ...prev, SelectedSurvey: value }));
  const setSelectedQuestionIds = (value) =>
    setFormState((prev) => ({ ...prev, selectedQuestionIds: value }));
  const setScoreThreshold = (value) =>
    setFormState((prev) => ({ ...prev, ScoreThreshold: value }));
  const setScoreThresholdmx = (value) =>
    setFormState((prev) => ({ ...prev, ScoreThresholdmx: value }));
  const setIsValidTitleTask = (value) =>
    setFormState((prev) => ({ ...prev, isValidTitleTask: value }));
  const setIsValidSumaryTask = (value) =>
    setFormState((prev) => ({ ...prev, isValidSumaryTask: value }));
  const setSelectedQuestion = (value) =>
    setFormState((prev) => ({ ...prev, selectedQuestion: value }));
  const setscoreType = (value) =>
    setFormState((prev) => ({ ...prev, scoreType: value }));

  // Reset form to initial state
  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
  };

  // Load data for editing
  const loadTaskData = (task) => {
    setFormState({
      taskTitle: task.title,
      taskSummary: task.summary,
      taskDescription: task.description,
      origin: task.search_source,
      llm: task.search_model,
      searchEngine: task.search_model,
      geminiApiKey: task.geminiApiKey || "",
      googleApiKey: task.googleApiKey || "",
      googleCx: task.googleCx || "",
      RulesExperiment: task.RulesExperiment,
      SelectedSurvey: task.SelectedSurvey,
      selectedQuestionIds: task.selectedQuestionIds || [],
      ScoreThreshold: task.ScoreThreshold,
      ScoreThresholdmx: task.ScoreThresholdmx,
      isValidTitleTask: true,
      isValidSumaryTask: true,
      selectedQuestion: null,
      scoreType:
        task.ScoreThreshold !== "" && task.ScoreThresholdmx !== "0"
          ? "min_max"
          : "unic",
    });
  };

  // Build task object from form state
  const buildTaskObject = () => {
    const questionIds =
      formState.RulesExperiment === "score"
        ? null
        : formState.selectedQuestionIds?.map((q) => q.id) || [];

    return {
      title: formState.taskTitle,
      summary: formState.taskSummary,
      description: formState.taskDescription,
      RulesExperiment: formState.RulesExperiment,
      SelectedSurvey: formState.SelectedSurvey?.uuid || null,
      selectedQuestionIds: questionIds,
      ScoreThreshold: formState.ScoreThreshold,
      ScoreThresholdmx: formState.ScoreThresholdmx,
      search_source: formState.origin,
      search_model:
        formState.origin === "llm" ? formState.llm : formState.searchEngine,
      geminiApiKey: formState.origin === "llm" ? formState.geminiApiKey : null,
      googleApiKey:
        formState.origin === "search-engine" ? formState.googleApiKey : null,
      googleCx: formState.origin === "search-engine" ? formState.googleCx : null,
    };
  };

  return {
    formState,
    setFormState,
    // Individual setters
    setTaskTitle,
    setTaskSummary,
    setTaskDescription,
    setOrigin,
    setLlm,
    setSearchEngine,
    setGeminiApiKey,
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
    // Utility functions
    resetForm,
    loadTaskData,
    buildTaskObject,
  };
};
