/**
 * Utility functions for CreateExperimentTask
 */

/**
 * Handle survey change for both create and edit modes
 */
export const handleSurveyChange = (
  event,
  setSelectedSurvey,
  setSelectedQuestionIds,
  setSelectedQuestion = null
) => {
  const newSurvey = event.target.value;
  setSelectedSurvey(newSurvey);
  setSelectedQuestionIds([]);
  if (setSelectedQuestion) {
    setSelectedQuestion(null);
  }
};

/**
 * Handle question selection change
 */
export const handleQuestionChange = (
  event,
  selectedSurvey,
  setSelectedQuestionIds,
  setSelectedQuestion = null
) => {
  const selectedIds = event.target.value;
  setSelectedQuestionIds(selectedIds);

  if (setSelectedQuestion && selectedSurvey?.questions) {
    const selectedQuestions = selectedSurvey.questions.filter((q) =>
      selectedIds.includes(q.statement)
    );
    setSelectedQuestion(selectedQuestions);
  }
};

/**
 * Generic text field change handler with validation
 */
export const handleTextChange = (event, setValue, setValid = null) => {
  const value = event.target.value;
  setValue(value);
  if (setValid) {
    setValid(value.trim().length > 0);
  }
};

/**
 * Get form configuration for create or edit mode
 */
export const getFormConfig = (
  mode,
  createHandlers,
  editHandlers,
  createState,
  editState
) => {
  const isEditMode = mode === "edit";

  return {
    isEditMode,
    taskTitle: isEditMode ? editState.taskTitle : createState.taskTitle,
    taskSummary: isEditMode ? editState.taskSummary : createState.taskSummary,
    taskDescription: isEditMode
      ? editState.taskDescription
      : createState.taskDescription,
    origin: isEditMode ? editState.origin : createState.origin,
    llm: isEditMode ? editState.llm : createState.llm,
    searchEngine: isEditMode
      ? editState.searchEngine
      : createState.searchEngine,
    geminiApiKey: isEditMode
      ? editState.geminiApiKey
      : createState.geminiApiKey,
    googleApiKey: isEditMode
      ? editState.googleApiKey
      : createState.googleApiKey,
    googleCx: isEditMode ? editState.googleCx : createState.googleCx,
    RulesExperiment: isEditMode
      ? editState.RulesExperiment
      : createState.RulesExperiment,
    SelectedSurvey: isEditMode
      ? editState.SelectedSurvey
      : createState.SelectedSurvey,
    selectedQuestionIds: isEditMode
      ? editState.selectedQuestionIds
      : createState.selectedQuestionIds,
    ScoreThreshold: isEditMode
      ? editState.ScoreThreshold
      : createState.ScoreThreshold,
    ScoreThresholdmx: isEditMode
      ? editState.ScoreThresholdmx
      : createState.ScoreThresholdmx,
    isValidTitleTask: isEditMode
      ? editState.isValidTitleTask
      : createState.isValidTitleTask,
    isValidSumaryTask: isEditMode
      ? editState.isValidSumaryTask
      : createState.isValidSumaryTask,
    scoreType: isEditMode ? editState.scoreType : createState.scoreType,
    handlers: isEditMode ? editHandlers : createHandlers,
  };
};

/**
 * Filter tasks based on search term
 */
export const filterTasks = (tasks, searchTerm) => {
  if (!searchTerm.trim()) return tasks;
  
  return tasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
