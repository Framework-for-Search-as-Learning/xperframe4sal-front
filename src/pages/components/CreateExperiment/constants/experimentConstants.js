export const SCORE_TYPES = [
  { value: "unic", label: "unic" },
  { value: "min_max", label: "min_max" },
];

export const LLM_TYPES = [
    { value: "gemini", label: "Gemini" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "claude", label: "Claude" },
];

export const SEARCH_ENGINES = [
    { value: "google", label: "Google" },
    { value: "bing", label: "Bing" },
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

export const LLM_PROVIDERS = [
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "google", label: "Google" },
];


export const LLM_MODELS_BY_PROVIDER = {
    openai: [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
        { value: "gpt-4", label: "GPT-4" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ],
    anthropic: [
        { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
        { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
        { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
        { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
        { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
    ],
    google: [
        { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)" },
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
        { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro" },
    ],
    cohere: [
        { value: "command-r-plus", label: "Command R+" },
        { value: "command-r", label: "Command R" },
        { value: "command", label: "Command" },
        { value: "command-light", label: "Command Light" },
    ],
    mistral: [
        { value: "mistral-large-latest", label: "Mistral Large" },
        { value: "mistral-medium-latest", label: "Mistral Medium" },
        { value: "mistral-small-latest", label: "Mistral Small" },
        { value: "open-mistral-7b", label: "Mistral 7B" },
    ],
};