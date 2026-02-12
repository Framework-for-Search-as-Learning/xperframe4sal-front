export const SCORE_TYPES = [
  { value: "unic", label: "unic" },
  { value: "min_max", label: "min_max" },
];

export const SEARCH_ENGINES = [
    { value: "google", label: "Google" },
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
  llmProvider: "gemini",
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

//TODO: Alterar para buscar estes dados por api
export const LLM_PROVIDERS = [
    { value: "google", label: "Google" },
];


export const LLM_MODELS_BY_PROVIDER = {
    google: [
        { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    ],
};