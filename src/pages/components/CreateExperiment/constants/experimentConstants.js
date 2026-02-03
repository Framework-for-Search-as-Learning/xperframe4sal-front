export const SCORE_TYPES = [
  { value: "unic", label: "unic" },
  { value: "min_max", label: "min_max" },
];

export const LLM_TYPES = [
  { value: "gemini", label: "Gemini (Google)" },
  //{ value: 'chat-gpt', label: 'ChatGPT (OpenAI)' },
];

export const SEARCH_ENGINES = [
  { value: "google", label: "Google" },
  //{ value: 'bing', label: 'Bing' },
];

export const RULES_EXPERIMENT_TYPES = [
  { value: "score", label: "score" },
  { value: "question", label: "question" },
];

export const INITIAL_FORM_STATE = {
  taskTitle: "",
  taskSummary: "",
  taskDescription: "",
  origin: "",
  llm: "gemini",
  searchEngine: "google",
  geminiApiKey: "",
  googleApiKey: "",
  googleCx: "",
  RulesExperiment: "score",
  SelectedSurvey: [],
  selectedQuestionIds: [],
  ScoreThreshold: "",
  ScoreThresholdmx: "0",
  isValidTitleTask: true,
  isValidSumaryTask: true,
  selectedQuestion: null,
  scoreType: "",
};
