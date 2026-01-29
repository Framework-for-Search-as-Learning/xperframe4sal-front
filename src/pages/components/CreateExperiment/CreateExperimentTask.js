import React, { useState, useContext } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  ListItemText,
  styled,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";

import { useTranslation } from "react-i18next";
import ReactQuill from "react-quill";
import StepContext from "./context/StepContextCreate";
import "react-quill/dist/quill.snow.css";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import NotFound from "../../../components/NotFound";

// --- STYLED COMPONENTS ---
const CustomContainer = styled("div")(({ theme }) => ({
  backgroundColor: "#fafafa",
  borderRadius: "8px",
  padding: "0px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  "& .ql-toolbar": {
    backgroundColor: "#f5f5f5",
    borderRadius: "8px 8px 0 0",
  },
  "& .ql-container": {
    minHeight: "200px",
    borderRadius: "0 0 8px 8px",
  },
  "& .ql-editor": {
    fontFamily: theme.typography.fontFamily,
    lineHeight: 1.6,
    color: "#444",
  },
}));

// --- CONSTANTS (Static Data) ---
const SCORE_TYPES = [
  { value: "unic", label: "unic" },
  { value: "min_max", label: "min_max" },
];

const LLM_TYPES = [
  { value: "gemini", label: "Gemini (Google)" },
  //{ value: 'chat-gpt', label: 'ChatGPT (OpenAI)' },
];

const SEARCH_ENGINES = [
  { value: "google", label: "Google" },
  //{ value: 'bing', label: 'Bing' },
];

const RULES_EXPERIMENT_TYPES = [
  { value: "score", label: "score" },
  { value: "question", label: "question" },
];

const CreateExperimentTask = () => {
  const { t } = useTranslation();

  // --- CONTEXT STATE ---
  const {
    step,
    setStep,
    ExperimentTasks,
    setExperimentTasks,
    ExperimentType,
    BtypeExperiment,
    ExperimentSurveys,
  } = useContext(StepContext);

  // --- UI CONTROL STATE ---
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openTaskIds, setOpenTaskIds] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDeleteIndex, setTaskToDeleteIndex] = useState(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);

  // --- CREATE FORM STATE ---
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSummary, setTaskSummary] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [origin, setOrigin] = useState("");
  const [llm, setLlm] = useState("gemini");
  const [searchEngine, setSearchEngine] = useState("google");

  // API Keys State (Create)
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [googleApiKey, setGoogleApikey] = useState(""); 
  const [googleCx, setGoogleCx] = useState("");

  const [RulesExperiment, setRulesExperiment] = useState("score");
  const [SelectedSurvey, setSelectedSurvey] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [ScoreThreshold, setScoreThreshold] = useState("");
  const [ScoreThresholdmx, setScoreThresholdmx] = useState("0");
  const [isValidTitleTask, setIsValidTitleTask] = useState(true);
  const [isValidSumaryTask, setIsValidSumaryTask] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // --- EDIT FORM STATE ---
  const [editTaskIndex, setEditTaskIndex] = useState(null);
  const [taskTitleEdit, setTaskTitleEdit] = useState("");
  const [taskSummaryEdit, setTaskSummaryEdit] = useState("");
  const [taskDescriptionEdit, setTaskDescriptionEdit] = useState("");
  const [RulesExperimentEdit, setRulesExperimentEdit] = useState("");
  const [SelectedSurveyEdit, setSelectedSurveyEdit] = useState("");
  const [selectedQuestionIdsEdit, setSelectedQuestionIdsEdit] = useState([]);
  const [ScoreThresholdEdit, setScoreThresholdEdit] = useState("");
  const [ScoreThresholdmxEdit, setScoreThresholdmxEdit] = useState("");
  const [isValidTitleTaskEdit, setIsValidTitleTaskEdit] = useState(true);
  const [isValidSumaryTaskEdit, setIsValidSumaryTaskEdit] = useState(true);

  // API Keys State (Edit)
  const [geminiApiKeyEdit, setGeminiApiKeyEdit] = useState("");
  const [googleApiKeyEdit, setGoogleApikeyEdit] = useState("");
  const [googleCxEdit, setGoogleCxEdit] = useState("");

  // Shared Helper State
  const [scoreType, setscoreType] = useState("");

  // --- HANDLERS: Navigation & Dialogs ---

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const toggleCreateTask = () => setIsCreateTaskOpen((prev) => !prev);
  const toggleEditTask = () => setIsEditTaskOpen((prev) => !prev);

  const toggleTaskDescription = (index) => {
    setOpenTaskIds((prev) =>
      prev.includes(index)
        ? prev.filter((id) => id !== index)
        : [...prev, index],
    );
  };

  // --- HANDLERS: Delete Logic ---

  const handleOpenDeleteDialog = (index) => {
    setTaskToDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTaskToDeleteIndex(null);
  };

  const handleDeleteTask = () => {
    setExperimentTasks((prev) =>
      prev.filter((_, i) => i !== taskToDeleteIndex),
    );
    handleCloseDeleteDialog();
  };

  // --- HANDLERS: Form Input Changes (Generic Logic) ---

  const handleSurveyChangeGeneric = (event, isEdit) => {
    const newSurvey = event.target.value;
    if (isEdit) {
      setSelectedSurveyEdit(newSurvey);
      setSelectedQuestionIdsEdit([]);
    } else {
      setSelectedSurvey(newSurvey);
      setSelectedQuestion(null);
    }
  };

  const handleQuestionChangeGeneric = (event, isEdit) => {
    const selectedIds = event.target.value;
    if (isEdit) {
      setSelectedQuestionIdsEdit(selectedIds);
    } else {
      setSelectedQuestionIds(selectedIds);
      const selectedQuestions = SelectedSurvey.questions.filter((q) =>
        selectedIds.includes(q.statement),
      );
      setSelectedQuestion(selectedQuestions);
    }
  };

  const handleTextChange = (e, setVal, setValid) => {
    const value = e.target.value;
    setVal(value);
    if (setValid) setValid(value.trim().length > 0);
  };

  // --- HANDLERS: Task CRUD Operations ---

  const resetCreateForm = () => {
    setTaskTitle("");
    setTaskSummary("");
    setTaskDescription("");
    setScoreThreshold("");
    setScoreThresholdmx("");
    setGeminiApiKey("");
    setGoogleApikey("");
    setGoogleCx("");
    setIsValidTitleTask(true);
    setIsValidSumaryTask(true);
  };

  const handleCancelTask = () => {
    resetCreateForm();
    toggleCreateTask();
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    const questionIds =
      RulesExperiment === "score"
        ? null
        : selectedQuestionIds?.map((q) => q.id) || [];

    const newTask = {
      title: taskTitle,
      summary: taskSummary,
      description: taskDescription,
      RulesExperiment: RulesExperiment,
      SelectedSurvey: SelectedSurvey?.uuid || null,
      selectedQuestionIds: questionIds,
      ScoreThreshold: ScoreThreshold,
      ScoreThresholdmx: ScoreThresholdmx,
      search_source: origin,
      search_model: origin === "llm" ? llm : searchEngine,
      geminiApiKey: origin === "llm" ? geminiApiKey : null,
      googleApiKey: origin === "search-engine" ? googleApiKey : null, 
      googleCx: origin === "search-engine" ? googleCx : null,
    };

    setExperimentTasks((prev) => [...prev, newTask]);
    toggleCreateTask();
    resetCreateForm();
  };

  const handleEditTask = (index) => {
    setEditTaskIndex(index);
    const task = ExperimentTasks[index];

    // Populate Form
    setTaskTitleEdit(task.title);
    setTaskSummaryEdit(task.summary);
    setTaskDescriptionEdit(task.description);
    setRulesExperimentEdit(task.RulesExperiment);
    setScoreThresholdmxEdit(task.ScoreThresholdmx);
    setScoreThresholdEdit(task.ScoreThreshold);

    // Populate API Keys
    setGeminiApiKeyEdit(task.geminiApiKey || "");
    setGoogleApikeyEdit(task.googleApiKey || ""); 
    setGoogleCxEdit(task.googleCx || "");

    // Populate Survey & Questions
    const selectedSurveyObj = ExperimentSurveys.find(
      (survey) => survey.uuid === task.SelectedSurvey,
    );
    setSelectedSurveyEdit(selectedSurveyObj);

    const selectedQuestionIdsObj =
      selectedSurveyObj?.questions?.filter(
        (quest) =>
          Array.isArray(task?.selectedQuestionIds) &&
          task.selectedQuestionIds.includes(quest.id),
      ) || [];
    setSelectedQuestionIdsEdit(selectedQuestionIdsObj);

    // Populate Source
    setOrigin(task.search_source || "");
    if (task.search_source === "llm") {
      setLlm(task.search_model || "gemini");
    } else if (task.search_source === "search-engine") {
      setSearchEngine(task.search_model || "google");
    }

    toggleEditTask();
  };

  const handleCancelEditTask = () => {
    setTaskTitleEdit("");
    setTaskSummaryEdit("");
    setTaskDescriptionEdit("");
    setGeminiApiKeyEdit("");
    setGoogleApikeyEdit("");
    setGoogleCxEdit("");
    setIsValidTitleTaskEdit(true);
    setIsValidSumaryTaskEdit(true);
    toggleEditTask();
  };

  const handleEditTaskSubmit = (e) => {
    e.preventDefault();
    const questionIds =
      RulesExperimentEdit === "score"
        ? null
        : selectedQuestionIdsEdit?.map((q) => q.id) || [];

    const updatedTask = {
      title: taskTitleEdit,
      summary: taskSummaryEdit,
      description: taskDescriptionEdit,
      RulesExperiment: RulesExperimentEdit,
      ScoreThreshold: ScoreThresholdEdit,
      ScoreThresholdmx: ScoreThresholdmxEdit,
      SelectedSurvey: SelectedSurveyEdit?.uuid || null,
      selectedQuestionIds: questionIds,
      search_source: origin,
      search_model: origin === "llm" ? llm : searchEngine,
      // Backend fields req
      geminiApiKey: origin === "llm" ? geminiApiKeyEdit : null,
      googleApiKey: origin === "search-engine" ? googleApiKeyEdit : null,
      googleCx: origin === "search-engine" ? googleCxEdit : null,
    };

    setExperimentTasks((prev) => {
      const updatedTasks = [...prev];
      updatedTasks[editTaskIndex] = updatedTask;
      return updatedTasks;
    });
    toggleEditTask();
  };

  // --- FORM CONFIGURATION PATTERN ---
  const getFormConfig = (mode) => {
    const isEdit = mode === "edit";
    return {
      mode,
      // Fields
      title: isEdit ? taskTitleEdit : taskTitle,
      setTitle: isEdit
        ? (e) => handleTextChange(e, setTaskTitleEdit, setIsValidTitleTaskEdit)
        : (e) => handleTextChange(e, setTaskTitle, setIsValidTitleTask),
      isTitleValid: isEdit ? isValidTitleTaskEdit : isValidTitleTask,

      summary: isEdit ? taskSummaryEdit : taskSummary,
      setSummary: isEdit
        ? (e) =>
            handleTextChange(e, setTaskSummaryEdit, setIsValidSumaryTaskEdit)
        : (e) => handleTextChange(e, setTaskSummary, setIsValidSumaryTask),
      isSummaryValid: isEdit ? isValidSumaryTaskEdit : isValidSumaryTask,

      description: isEdit ? taskDescriptionEdit : taskDescription,
      setDescription: isEdit ? setTaskDescriptionEdit : setTaskDescription,

      // Rules Logic
      rulesExp: isEdit ? RulesExperimentEdit : RulesExperiment,
      setRulesExp: isEdit ? setRulesExperimentEdit : setRulesExperiment,

      survey: isEdit ? SelectedSurveyEdit : SelectedSurvey,
      setSurvey: (e) => handleSurveyChangeGeneric(e, isEdit),

      questions: isEdit ? selectedQuestionIdsEdit : selectedQuestionIds,
      setQuestions: (e) => handleQuestionChangeGeneric(e, isEdit),

      threshold: isEdit ? ScoreThresholdEdit : ScoreThreshold,
      setThreshold: isEdit ? setScoreThresholdEdit : setScoreThreshold,

      thresholdMx: isEdit ? ScoreThresholdmxEdit : ScoreThresholdmx,
      setThresholdMx: isEdit ? setScoreThresholdmxEdit : setScoreThresholdmx,

      // Source & Keys
      origin,
      setOrigin,
      llm,
      setLlm,
      searchEngine,
      setSearchEngine,

      geminiKey: isEdit ? geminiApiKeyEdit : geminiApiKey,
      setGeminiKey: isEdit ? setGeminiApiKeyEdit : setGeminiApiKey,

      googleKey: isEdit ? googleApiKeyEdit : googleApiKey,
      setGoogleKey: isEdit ? setGoogleApikeyEdit : setGoogleApikey,

      cx: isEdit ? googleCxEdit : googleCx,
      setCx: isEdit ? setGoogleCxEdit : setGoogleCx,

      // Submission
      submitAction: isEdit ? handleEditTaskSubmit : handleCreateTask,
      cancelAction: isEdit ? handleCancelEditTask : handleCancelTask,
      isValidForm: isEdit
        ? isValidTitleTaskEdit &&
          taskTitleEdit &&
          isValidSumaryTaskEdit &&
          taskSummaryEdit
        : isValidTitleTask && taskTitle && isValidSumaryTask && taskSummary,
    };
  };

  // --- RENDER HELPERS ---

  const renderRulesSection = (config) => {
    if (
      ExperimentType !== "between-subject" ||
      BtypeExperiment !== "rules_based"
    )
      return null;

    return (
      <Grid container spacing={2} alignItems="center">
        {/* Rule Type Selector */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
            <InputLabel>{t("Separation_rule")}</InputLabel>
            <Select
              fullWidth
              value={config.rulesExp}
              onChange={(e) => config.setRulesExp(e.target.value)}
              label={t("Separation_rule")}
            >
              {RULES_EXPERIMENT_TYPES.map((stype) => (
                <MenuItem key={stype.value} value={stype.value}>
                  {stype.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Survey Selector */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
            <InputLabel>{t("select_survey")}</InputLabel>
            <Select
              fullWidth
              value={config.survey}
              onChange={config.setSurvey}
              label={t("select_survey")}
            >
              {ExperimentSurveys?.length > 0 ? (
                ExperimentSurveys.map((survey) => (
                  <MenuItem key={survey.id} value={survey}>
                    {survey.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>{t("no_survey_available")}</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* Questions Selector (Only if Rule is 'question') */}
        {config.rulesExp === "question" && (
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
              <InputLabel>{t("select_question")}</InputLabel>
              <Select
                fullWidth
                value={config.questions}
                onChange={config.setQuestions}
                label={t("select_question")}
                multiple
                renderValue={(selected) =>
                  config.survey?.questions
                    .filter((q) => selected.includes(q))
                    .map((q) => q.statement || "Sem enunciado")
                    .join(", ")
                }
              >
                {config.survey?.questions &&
                config.survey.questions.length > 0 ? (
                  config.survey.questions
                    .filter(
                      (q) =>
                        (q.type === "multiple-selection" ||
                          q.type === "multiple-choices") &&
                        q.hasscore,
                    )
                    .map((question) => (
                      <MenuItem key={question.id} value={question}>
                        <Checkbox
                          checked={config.questions.includes(question)}
                        />
                        {question.statement || "Sem enunciado"}
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>{t("no_questions_available")}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Score Type Logic (Unic vs Min/Max) */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
            <InputLabel>{t("select_survey_th")}</InputLabel>
            <Select
              fullWidth
              value={scoreType}
              onChange={(e) => setscoreType(e.target.value)}
              label={t("select_survey_th")}
            >
              {SCORE_TYPES.map((stype) => (
                <MenuItem key={stype.value} value={stype.value}>
                  {t(stype.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {scoreType === "unic" ? (
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label={t("score_Threshold_unic")}
              value={config.threshold}
              onChange={(e) => {
                const value = Number(e.target.value);
                config.setThreshold(value);
                config.setThresholdMx(value);
              }}
            />
          </Grid>
        ) : (
          <>
            <Grid item xs={12} sm={config.rulesExp === "score" ? 4 : 2}>
              <TextField
                fullWidth
                margin="normal"
                type="number"
                label={t("score_Threshold_min")}
                value={config.threshold}
                onChange={(e) => {
                  const minValue = Number(e.target.value);
                  if (minValue <= config.thresholdMx) {
                    config.setThreshold(minValue);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={config.rulesExp === "score" ? 4 : 2}>
              <TextField
                fullWidth
                margin="normal"
                type="number"
                label={t("score_Threshold_max")}
                value={config.thresholdMx}
                onChange={(e) => {
                  const maxValue = Number(e.target.value);
                  if (maxValue >= config.threshold) {
                    config.setThresholdMx(maxValue);
                  }
                }}
                inputProps={{ min: config.threshold }}
              />
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  const renderFormFields = (config) => (
    <form onSubmit={config.submitAction}>
      <TextField
        label={t("task_title")}
        error={!config.isTitleValid}
        helperText={!config.isTitleValid ? t("invalid_name_message") : ""}
        variant="outlined"
        fullWidth
        margin="normal"
        value={config.title}
        onChange={config.setTitle}
        required
      />

      {/* SOURCE & KEYS SECTION */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
            <InputLabel id="origin-label">{t("select_source")}</InputLabel>
            <Select
              fullWidth
              labelId="origin-label"
              value={config.origin}
              onChange={(e) => config.setOrigin(e.target.value)}
              label={t("select_source")}
            >
              <MenuItem value="llm">Large Language Model</MenuItem>
              <MenuItem value="search-engine">{t("search_engine")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* LLM Selection */}
        {config.origin === "llm" && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
              <InputLabel id="llm-select-label">{t("select_llm")}</InputLabel>
              <Select
                fullWidth
                labelId="llm-select-label"
                value={config.llm}
                onChange={(e) => config.setLlm(e.target.value)}
                label={t("select_llm")}
              >
                {LLM_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
                <optgroup label={t("more_soon")}></optgroup>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Search Engine Selection */}
        {config.origin === "search-engine" && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
              <InputLabel id="search-engine-label">
                {t("select_search_engine")}
              </InputLabel>
              <Select
                fullWidth
                labelId="search-engine-label"
                value={config.searchEngine}
                onChange={(e) => config.setSearchEngine(e.target.value)}
                label={t("select_search_engine")}
              >
                {SEARCH_ENGINES.map((engine) => (
                  <MenuItem key={engine.value} value={engine.value}>
                    {engine.label}
                  </MenuItem>
                ))}
                <optgroup label={t("more_soon")}></optgroup>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* --- API KEY INPUTS --- */}

        {/* Case 1: LLM (Gemini Key) */}
        {config.origin === "llm" && config.llm === "gemini" && (
          <Grid item xs={12}>
            <TextField
              label="Gemini API Key"
              variant="outlined"
              fullWidth
              margin="normal"
              value={config.geminiKey}
              onChange={(e) => config.setGeminiKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
            />
          </Grid>
        )}

        {/* Case 2: Search Engine (Google Key & CX) */}
        {config.origin === "search-engine" &&
          config.searchEngine === "google" && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Google API Key"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={config.googleKey}
                  onChange={(e) => config.setGoogleKey(e.target.value)}
                  placeholder="Enter Google API Key"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Google CX (Search Engine ID)"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={config.cx}
                  onChange={(e) => config.setCx(e.target.value)}
                  placeholder="Enter Google CX"
                />
              </Grid>
            </>
          )}
      </Grid>

      {/* Dynamic Rules Section based on Experiment Type */}
      {renderRulesSection(config)}

      <TextField
        label={t("task_summary")}
        error={!config.isSummaryValid}
        helperText={!config.isSummaryValid ? t("invalid_name_message") : ""}
        variant="outlined"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={config.summary}
        onChange={config.setSummary}
        required
      />

      <div style={{ width: "100%", marginTop: "16.5px", marginBottom: "16px" }}>
        <CustomContainer>
          <ReactQuill
            value={config.description}
            onChange={config.setDescription}
            placeholder={t("task_Desc1")}
          />
        </CustomContainer>
      </div>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          width: "100%",
          mt: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={config.cancelAction}
          color="primary"
        >
          {t("cancel")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!config.isValidForm || isLoadingTask}
        >
          {config.mode === "create" ? t("create") : t("save")}
        </Button>
      </Box>
    </form>
  );

  const renderTaskList = () => (
    <FormControl fullWidth>
      <Box sx={{ minHeight: 300, maxHeight: 300, overflowY: "auto" }}>
        {Array.isArray(ExperimentTasks) &&
          ExperimentTasks.filter((task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()),
          ).map((task, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                mb: 1,
                padding: 1,
                backgroundColor: "#ffffff",
                borderRadius: "4px",
                boxShadow: 1,
                wordBreak: "break-word",
                "&:hover": { backgroundColor: "#e6f7ff" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ListItemText primary={task.title} sx={{ ml: 1 }} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    color="error"
                    onClick={() => handleOpenDeleteDialog(index)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditTask(index)}
                    sx={{ ml: 2 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => toggleTaskDescription(index)}
                    sx={{ ml: 1 }}
                  >
                    {openTaskIds.includes(index) ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                </Box>
              </Box>

              {openTaskIds.includes(index) && (
                <Box
                  sx={{
                    marginTop: 0,
                    padding: 1,
                    backgroundColor: "#E8E8E8",
                    borderRadius: "4px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    wordBreak: "break-word",
                  }}
                  dangerouslySetInnerHTML={{ __html: task.description }}
                />
              )}
            </Box>
          ))}
      </Box>
    </FormControl>
  );

  // --- MAIN RENDER ---
  return (
    <Box>
      <Box
        sx={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            padding: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            boxShadow: 4,
            width: { xs: "95%", sm: "60%" },
            marginX: "auto",
          }}
        >
          {isLoadingTask ? (
            <CircularProgress />
          ) : Array.isArray(ExperimentTasks) && ExperimentTasks.length > 0 ? (
            renderTaskList()
          ) : (
            <NotFound title={t("NTaskFound")} subTitle={t("NoTaskcreated")} />
          )}

          {/* Navigation Buttons (Desktop) */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              justifyContent: "space-between",
              marginTop: "auto",
              width: "100%",
              mt: 2,
            }}
          >
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBack}
                sx={{ maxWidth: 150, fontWeight: "bold", boxShadow: 2 }}
              >
                {t("back")}
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ marginRight: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={toggleCreateTask}
                >
                  {isCreateTaskOpen ? t("cancel") : t("create_task")}
                </Button>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{ maxWidth: "120px" }}
                >
                  {t("next")}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Navigation Buttons (Mobile) */}
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              justifyContent: "space-between",
              mt: 2,
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleBack}
              sx={{ maxWidth: 150, fontWeight: "bold", boxShadow: 2 }}
            >
              <ArrowBack />
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={toggleCreateTask}
              sx={{ maxWidth: "170px" }}
            >
              {isCreateTaskOpen ? t("cancel") : t("create_task")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              sx={{ maxWidth: 150, fontWeight: "bold", boxShadow: 2 }}
            >
              <ArrowForward />
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        fullWidth
        maxWidth="xs"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            boxShadow: 5,
            padding: 4,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: "#111827",
            textAlign: "center",
            paddingBottom: "8px",
          }}
        >
          {t("confirm_delete")}
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", color: "#6b7280" }}>
          <Box sx={{ marginBottom: 3 }}>
            <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.5 }}>
              {t("delete_confirmation_message")}
            </p>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseDeleteDialog}
              sx={{
                borderColor: "#d1d5db",
                color: "#374151",
                ":hover": { backgroundColor: "#f3f4f6" },
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteTask}
              sx={{ boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)" }}
            >
              {t("delete")}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={isEditTaskOpen}
        onClose={toggleEditTask}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: 3,
            padding: 4,
          },
        }}
      >
        <DialogTitle>{t("task_edit")}</DialogTitle>
        <DialogContent>{renderFormFields(getFormConfig("edit"))}</DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog
        open={isCreateTaskOpen}
        onClose={toggleCreateTask}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: 3,
            padding: 4,
          },
        }}
      >
        <DialogTitle>{t("task_creation")}</DialogTitle>
        <DialogContent>
          {renderFormFields(getFormConfig("create"))}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default CreateExperimentTask;