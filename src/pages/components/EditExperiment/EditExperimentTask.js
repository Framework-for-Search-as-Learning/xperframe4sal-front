import React, { useState, useContext, useEffect, useMemo } from "react";
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
    Typography,
    Grid,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ReactQuill from "react-quill";
import StepContext from "./context/StepContext";
import { api } from "../../../config/axios";
import "react-quill/dist/quill.snow.css";
import NotFound from "../../../components/NotFound";
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import {
    LLM_PROVIDERS,
    LLM_MODELS_BY_PROVIDER,
    SEARCH_ENGINES,
    RULES_EXPERIMENT_TYPES,
    SCORE_TYPES,
} from "../CreateExperiment/constants/experimentConstants";

// Estilização personalizada para o editor ReactQuill
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

const EditExperimentTask = () => {
    // Contexto compartilhado com o fluxo de criação/edição do experimento
    const [
        ExperimentTitle,
        setExperimentTitle,
        ExperimentType,
        setExperimentType,
        BtypeExperiment,
        setBtypeExperiment,
        ExperimentDesc,
        setExperimentDesc,
        ExperimentId,
        setExperimentId,
        ExperimentSurveys,
        setExperimentSurveys,
    ] = useContext(StepContext);

    // Dados do usuário autenticado
    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const { t } = useTranslation();

    // Estados para gerenciamento de tarefas
    const [isLoadingTask, setIsLoadingTask] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [ExperimentTasks, setExperimentTasks] = useState([]);
    const [openTaskIds, setOpenTaskIds] = useState([]);
    const [tasks, setTasks] = useState([]);

    // Estados para controle de modais
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taskToDeleteIndex, setTaskToDeleteIndex] = useState(null);

    // Estados para formulário de criação/edição de tarefas
    const [taskTitle, setTaskTitle] = useState("");
    const [taskid, settaskid] = useState("");
    const [taskSummary, setTaskSummary] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [editTaskIndex, setEditTaskIndex] = useState(null);

    // Estados para regras do experimento (score-based ou question-based)
    const [RulesExperiment, setRulesExperiment] = useState("score");
    const [ScoreThresholdmx, setScoreThresholdmx] = useState("");
    const [ScoreThreshold, setScoreThreshold] = useState("");
    const [scoreType, setscoreType] = useState("");

    // Estados para seleção de survey e questões
    const [SelectedSurvey, setSelectedSurvey] = useState("");
    const [SelectedSurveyids, setSelectedSurveyids] = useState("");
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [SelectedQuestion, setSelectedQuestion] = useState(null);

    // Estados para configuração de fonte de pesquisa (LLM ou Search Engine)
    const [origin, setOrigin] = useState("");
    const [llmProvider, setLlmProvider] = useState(""); // NOVO
    const [llm, setLlm] = useState("");
    const [searchEngine, setSearchEngine] = useState("google");

    // Estados para armazenamento de múltiplas chaves de API
    const [openaiKey, setOpenaiKey] = useState("");
    const [anthropicKey, setAnthropicKey] = useState("");
    const [googleAiKey, setGoogleAiKey] = useState("");
    const [cohereKey, setCohereKey] = useState("");
    const [mistralKey, setMistralKey] = useState("");

    // Compatibilidade com código antigo
    const [geminiApiKey, setGeminiApiKey] = useState("");
    const [googleApiKey, setGoogleApiKey] = useState("");
    const [googleCx, setGoogleCx] = useState("");

    // Validação de formulário
    const [isValidTitleTask, setIsValidTitleTask] = React.useState(true);
    const [isValidSumaryTask, setIsValidSumaryTask] = React.useState(true);
    const isValidFormTask = isValidTitleTask && taskTitle && isValidSumaryTask && taskSummary;

    // Get available models based on selected provider
    const availableModels = useMemo(() => {
        if (!llmProvider) return [];
        return LLM_MODELS_BY_PROVIDER[llmProvider] || [];
    }, [llmProvider]);

    // Reset model when provider changes
    useEffect(() => {
        if (llmProvider && llm) {
            const isValidModel = availableModels.some(model => model.value === llm);
            if (!isValidModel) {
                setLlm("");
            }
        }
    }, [llmProvider]);

    // Get API key config based on provider
    const getApiKeyConfig = () => {
        if (origin !== "llm" || !llmProvider) return null;

        const apiKeyConfigs = {
            openai: {
                label: "OpenAI API Key",
                placeholder: "sk-...",
                value: openaiKey,
                setter: setOpenaiKey,
            },
            anthropic: {
                label: "Anthropic API Key",
                placeholder: "sk-ant-...",
                value: anthropicKey,
                setter: setAnthropicKey,
            },
            google: {
                label: "Google AI API Key",
                placeholder: "AIza...",
                value: googleAiKey || geminiApiKey,
                setter: (value) => {
                    setGoogleAiKey(value);
                    setGeminiApiKey(value); // Sync for compatibility
                },
            },
            cohere: {
                label: "Cohere API Key",
                placeholder: "...",
                value: cohereKey,
                setter: setCohereKey,
            },
            mistral: {
                label: "Mistral API Key",
                placeholder: "...",
                value: mistralKey,
                setter: setMistralKey,
            },
        };

        return apiKeyConfigs[llmProvider] || null;
    };

    const apiKeyConfig = getApiKeyConfig();

    // Carrega as tarefas do experimento ao montar o componente
    useEffect(() => {
        fetchTasks();
    }, [user, t]);

    /**
     * Busca todas as tarefas associadas ao experimento atual
     */
    const fetchTasks = async () => {
        try {
            const response = await api.get(`task2/experiment/${ExperimentId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            setTasks(response.data);
        } catch (error) {
            console.error(t("Error in Search"), error);
        }
    };

    /**
     * Preenche o formulário de edição com dados da tarefa selecionada
     */
    const handleEditTask = async (index) => {
        setEditTaskIndex(index);
        const task = tasks.find((t) => t._id === index);

        if (task) {
            // Busca as questões associadas à tarefa
            const response = await api.get(`task-question-map/task/${task._id}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            const filteredTasks = response.data;
            setSelectedQuestionIds(filteredTasks);

            // Preenche os campos do formulário
            settaskid(task._id);
            setTaskTitle(task.title);
            setTaskSummary(task.summary);
            setTaskDescription(task.description);
            setRulesExperiment(task.RulesExperiment);
            setScoreThreshold(task.ScoreThreshold);
            setScoreThresholdmx(task.ScoreThresholdmx);

            // Set score type
            if (task.ScoreThreshold !== "" && task.ScoreThresholdmx !== "0") {
                setscoreType("min_max");
            } else {
                setscoreType("unic");
            }

            // Populate Survey
            const surveyEx = ExperimentSurveys.find((survey) => survey.uuid === task.survey);
            if (surveyEx) {
                setSelectedSurvey(surveyEx);
                setSelectedSurveyids(surveyEx.uuid);
            }

            // Populate Source
            setOrigin(task.search_source || "");
            setLlmProvider(task.llmProvider || ""); // NOVO

            if (task.search_source === "llm") {
                setLlm(task.search_model || "");
            } else if (task.search_source === "search-engine") {
                setSearchEngine(task.search_model || "google");
            }

            // Populate API Keys
            setOpenaiKey(task.openaiKey || "");
            setAnthropicKey(task.anthropicKey || "");
            setGoogleAiKey(task.googleAiKey || task.geminiApiKey || "");
            setCohereKey(task.cohereKey || "");
            setMistralKey(task.mistralKey || "");

            // Compatibility
            setGeminiApiKey(task.geminiApiKey || task.googleAiKey || "");
            setGoogleApiKey(task.googleApiKey || "");
            setGoogleCx(task.googleCx || "");

            toggleEditTask();
        }
    };

    /**
     * Submete as alterações da tarefa editada
     */
    const handleEditTaskSubmit = async (e) => {
        e.preventDefault();
        setIsLoadingTask(true);

        try {
            // Prepare task object
            const taskData = {
                title: taskTitle,
                summary: taskSummary,
                description: taskDescription,
                RulesExperiment: RulesExperiment,
                survey: SelectedSurveyids,
                ScoreThreshold: ScoreThreshold,
                ScoreThresholdmx: ScoreThresholdmx,
                search_source: origin,
            };

            // Add LLM-specific data
            if (origin === "llm") {
                taskData.llmProvider = llmProvider;
                taskData.search_model = llm;

                // Add appropriate API key
                if (llmProvider === "openai") taskData.openaiKey = openaiKey;
                if (llmProvider === "anthropic") taskData.anthropicKey = anthropicKey;
                if (llmProvider === "google") taskData.googleAiKey = googleAiKey;
                if (llmProvider === "cohere") taskData.cohereKey = cohereKey;
                if (llmProvider === "mistral") taskData.mistralKey = mistralKey;
            }
            // Add Search Engine-specific data
            else if (origin === "search-engine") {
                taskData.search_model = searchEngine;
                taskData.googleApiKey = googleApiKey;
                taskData.googleCx = googleCx;
            }

            // Update task
            await api.put(`task2/${taskid}`, taskData, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            // Update question mappings if needed
            if (RulesExperiment === "question" && selectedQuestionIds.length > 0) {
                // Delete old mappings
                await api.delete(`task-question-map/task/${taskid}`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });

                // Create new mappings
                const mappingPromises = selectedQuestionIds.map((questionId) =>
                    api.post(
                        `task-question-map`,
                        { task: taskid, question: questionId },
                        { headers: { Authorization: `Bearer ${user.accessToken}` } }
                    )
                );
                await Promise.all(mappingPromises);
            }

            // Refresh tasks
            await fetchTasks();
            resetForm();
            toggleEditTask();
        } catch (error) {
            console.error(t("Error updating task"), error);
        } finally {
            setIsLoadingTask(false);
        }
    };

    /**
     * Cria uma nova tarefa
     */
    const handleCreateTaskSubmit = async (e) => {
        e.preventDefault();
        setIsLoadingTask(true);

        try {
            // Prepare task object
            const taskData = {
                title: taskTitle,
                summary: taskSummary,
                description: taskDescription,
                RulesExperiment: RulesExperiment,
                survey: SelectedSurveyids,
                ScoreThreshold: ScoreThreshold,
                ScoreThresholdmx: ScoreThresholdmx,
                search_source: origin,
                experiment: ExperimentId,
            };

            // Add LLM-specific data
            if (origin === "llm") {
                taskData.llmProvider = llmProvider;
                taskData.search_model = llm;

                // Add appropriate API key
                if (llmProvider === "openai") taskData.openaiKey = openaiKey;
                if (llmProvider === "anthropic") taskData.anthropicKey = anthropicKey;
                if (llmProvider === "google") taskData.googleAiKey = googleAiKey;
                if (llmProvider === "cohere") taskData.cohereKey = cohereKey;
                if (llmProvider === "mistral") taskData.mistralKey = mistralKey;
            }
            // Add Search Engine-specific data
            else if (origin === "search-engine") {
                taskData.search_model = searchEngine;
                taskData.googleApiKey = googleApiKey;
                taskData.googleCx = googleCx;
            }

            // Create task
            const response = await api.post(`task2`, taskData, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            const newTaskId = response.data._id;

            // Create question mappings if needed
            if (RulesExperiment === "question" && selectedQuestionIds.length > 0) {
                const mappingPromises = selectedQuestionIds.map((questionId) =>
                    api.post(
                        `task-question-map`,
                        { task: newTaskId, question: questionId },
                        { headers: { Authorization: `Bearer ${user.accessToken}` } }
                    )
                );
                await Promise.all(mappingPromises);
            }

            // Refresh tasks
            await fetchTasks();
            resetForm();
            toggleCreateTask();
        } catch (error) {
            console.error(t("Error creating task"), error);
        } finally {
            setIsLoadingTask(false);
        }
    };

    /**
     * Deleta uma tarefa
     */
    const handleDeleteTask = async () => {
        try {
            await api.delete(`task2/${taskToDeleteIndex}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            await fetchTasks();
            handleCloseDeleteDialog();
        } catch (error) {
            console.error(t("Error deleting task"), error);
        }
    };

    // Toggle handlers
    const toggleTaskDescription = (taskId) => {
        setOpenTaskIds((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };

    const toggleCreateTask = () => {
        if (isCreateTaskOpen) resetForm();
        setIsCreateTaskOpen((prev) => !prev);
    };

    const toggleEditTask = () => {
        if (isEditTaskOpen) resetForm();
        setIsEditTaskOpen((prev) => !prev);
    };

    const handleOpenDeleteDialog = (taskId) => {
        setTaskToDeleteIndex(taskId);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTaskToDeleteIndex(null);
    };

    const handleCancelEditTask = () => {
        resetForm();
        toggleEditTask();
    };

    const handleCancelCreateTask = () => {
        resetForm();
        toggleCreateTask();
    };

    // Reset form
    const resetForm = () => {
        setTaskTitle("");
        setTaskSummary("");
        setTaskDescription("");
        setRulesExperiment("score");
        setScoreThreshold("");
        setScoreThresholdmx("");
        setscoreType("");
        setSelectedSurvey("");
        setSelectedSurveyids("");
        setSelectedQuestionIds([]);
        setSelectedQuestion(null);
        setOrigin("");
        setLlmProvider("");
        setLlm("");
        setSearchEngine("google");
        setOpenaiKey("");
        setAnthropicKey("");
        setGoogleAiKey("");
        setCohereKey("");
        setMistralKey("");
        setGeminiApiKey("");
        setGoogleApiKey("");
        setGoogleCx("");
        settaskid("");
        setIsValidTitleTask(true);
        setIsValidSumaryTask(true);
    };

    // Handle survey change
    const handleSurveyChange = (event) => {
        const selectedSurvey = event.target.value;
        setSelectedSurvey(selectedSurvey);
        setSelectedSurveyids(selectedSurvey.uuid);
        setSelectedQuestionIds([]);
    };

    // Handle question change
    const handleQuestionChange = (event) => {
        setSelectedQuestionIds(event.target.value);
    };

    // Filter tasks based on search term
    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Render Task Form (reusable for both create and edit)
    const renderTaskForm = (isEditMode) => (
        <form onSubmit={isEditMode ? handleEditTaskSubmit : handleCreateTaskSubmit}>
            {/* Task Title */}
            <TextField
                label={t("task_title")}
                error={!isValidTitleTask}
                helperText={!isValidTitleTask ? t("invalid_name_message") : ""}
                variant="outlined"
                fullWidth
                margin="normal"
                value={taskTitle}
                onChange={(e) => {
                    const value = e.target.value;
                    setTaskTitle(value);
                    setIsValidTitleTask(value.trim().length > 0);
                }}
                required
            />

            {/* SOURCE & PROVIDER SECTION */}
            <Grid container spacing={2} alignItems="flex-start">
                {/* Source Selection */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>{t("select_source")}</InputLabel>
                        <Select
                            value={origin}
                            onChange={(e) => {
                                setOrigin(e.target.value);
                                setLlmProvider("");
                                setLlm("");
                            }}
                            label={t("select_source")}
                            required
                        >
                            <MenuItem value="llm">Chat</MenuItem>
                            <MenuItem value="search-engine">{t("search_engine")}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* LLM Provider OR Search Engine */}
                {origin === "llm" ? (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>{t("select_llm_provider")}</InputLabel>
                            <Select
                                value={llmProvider}
                                onChange={(e) => {
                                    setLlmProvider(e.target.value);
                                    setLlm("");
                                }}
                                label={t("select_llm_provider")}
                                required
                            >
                                {LLM_PROVIDERS.map((provider) => (
                                    <MenuItem key={provider.value} value={provider.value}>
                                        {provider.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                ) : origin === "search-engine" ? (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>{t("select_search_engine")}</InputLabel>
                            <Select
                                value={searchEngine}
                                onChange={(e) => setSearchEngine(e.target.value)}
                                label={t("select_search_engine")}
                                required
                            >
                                {SEARCH_ENGINES.map((engine) => (
                                    <MenuItem key={engine.value} value={engine.value}>
                                        {engine.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                ) : null}

                {/* LLM Model (Dynamic based on provider) */}
                {origin === "llm" && llmProvider && (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>{t("select_llm")}</InputLabel>
                            <Select
                                value={llm}
                                onChange={(e) => setLlm(e.target.value)}
                                label={t("select_llm")}
                                required
                            >
                                {availableModels.length > 0 ? (
                                    availableModels.map((model) => (
                                        <MenuItem key={model.value} value={model.value}>
                                            {model.label}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>
                                        {t("no_models_available") || "Nenhum modelo disponível"}
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                {/* API Key (Dynamic based on provider) */}
                {origin === "llm" && llmProvider && apiKeyConfig && (
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label={apiKeyConfig.label}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={apiKeyConfig.value}
                            onChange={(e) => apiKeyConfig.setter(e.target.value)}
                            placeholder={apiKeyConfig.placeholder}
                            required
                        />
                    </Grid>
                )}

                {/* Google Search API Keys */}
                {origin === "search-engine" && searchEngine === "google" && (
                    <>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Google API Key"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={googleApiKey}
                                onChange={(e) => setGoogleApiKey(e.target.value)}
                                placeholder="Enter Google API Key"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Google CX (Search Engine ID)"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={googleCx}
                                onChange={(e) => setGoogleCx(e.target.value)}
                                placeholder="Enter Google CX"
                                required
                            />
                        </Grid>
                    </>
                )}
            </Grid>

            {/* Rules Section (for between-subject experiments) */}
            {ExperimentType === "between-subject" && BtypeExperiment === "rules_based" && (
                <>
                    <Grid container spacing={2} alignItems="center">
                        {/* Rule Type */}
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>{t("Separation_rule")}</InputLabel>
                                <Select
                                    value={RulesExperiment}
                                    onChange={(e) => setRulesExperiment(e.target.value)}
                                    label={t("Separation_rule")}
                                >
                                    {RULES_EXPERIMENT_TYPES.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Survey Selection */}
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>{t("select_survey")}</InputLabel>
                                <Select
                                    value={SelectedSurvey}
                                    onChange={handleSurveyChange}
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

                        {/* Question Selection (only for question-based rules) */}
                        {RulesExperiment === "question" && (
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>{t("select_question")}</InputLabel>
                                    <Select
                                        multiple
                                        value={selectedQuestionIds}
                                        onChange={handleQuestionChange}
                                        label={t("select_question")}
                                        renderValue={(selected) =>
                                            SelectedSurvey?.questions
                                                ?.filter((q) => selected.includes(q.id))
                                                .map((q) => q.statement || "Sem enunciado")
                                                .join(", ")
                                        }
                                    >
                                        {SelectedSurvey?.questions?.length > 0 ? (
                                            SelectedSurvey.questions
                                                .filter(
                                                    (q) =>
                                                        (q.type === "multiple-selection" ||
                                                            q.type === "multiple-choices") &&
                                                        q.hasscore
                                                )
                                                .map((question) => (
                                                    <MenuItem key={question.id} value={question.id}>
                                                        <Checkbox
                                                            checked={selectedQuestionIds.includes(
                                                                question.id
                                                            )}
                                                        />
                                                        {question.statement || "Sem enunciado"}
                                                    </MenuItem>
                                                ))
                                        ) : (
                                            <MenuItem disabled>
                                                {t("no_questions_available")}
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {/* Score Type */}
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>{t("select_survey_th")}</InputLabel>
                                <Select
                                    value={scoreType}
                                    onChange={(e) => setscoreType(e.target.value)}
                                    label={t("select_survey_th")}
                                >
                                    {SCORE_TYPES.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {t(type.label)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Score Thresholds */}
                        {scoreType === "unic" ? (
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    type="number"
                                    label={t("score_Threshold_unic")}
                                    value={ScoreThreshold}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setScoreThreshold(value);
                                        setScoreThresholdmx(value);
                                    }}
                                />
                            </Grid>
                        ) : (
                            <>
                                <Grid item xs={12} sm={RulesExperiment === "score" ? 4 : 2}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        type="number"
                                        label={t("score_Threshold_min")}
                                        value={ScoreThreshold}
                                        onChange={(e) => {
                                            const minValue = Number(e.target.value);
                                            if (minValue <= ScoreThresholdmx) {
                                                setScoreThreshold(minValue);
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={RulesExperiment === "score" ? 4 : 2}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        type="number"
                                        label={t("score_Threshold_max")}
                                        value={ScoreThresholdmx}
                                        onChange={(e) => {
                                            const maxValue = Number(e.target.value);
                                            if (maxValue >= ScoreThreshold) {
                                                setScoreThresholdmx(maxValue);
                                            }
                                        }}
                                        inputProps={{ min: ScoreThreshold }}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </>
            )}

            {/* Task Summary */}
            <TextField
                label={t("task_summary")}
                error={!isValidSumaryTask}
                helperText={!isValidSumaryTask ? t("invalid_name_message") : ""}
                variant="outlined"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={taskSummary}
                onChange={(e) => {
                    const value = e.target.value;
                    setTaskSummary(value);
                    setIsValidSumaryTask(value.trim().length > 0);
                }}
                required
            />

            {/* Task Description */}
            <div style={{ width: "100%", marginTop: "16.5px", marginBottom: "16px" }}>
                <CustomContainer>
                    <ReactQuill
                        value={taskDescription}
                        onChange={(content) => setTaskDescription(content)}
                        placeholder={t("task_Desc1")}
                    />
                </CustomContainer>
            </div>

            {/* Action Buttons */}
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
                    onClick={isEditMode ? handleCancelEditTask : handleCancelCreateTask}
                    color="primary"
                >
                    {t("cancel") || "Cancelar"}
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={!isValidFormTask || isLoadingTask}
                >
                    {isEditMode ? t("edit") || "Editar" : t("create") || "Criar"}
                </Button>
            </Box>
        </form>
    );

    return (
        <Box>
            {/* Main Content Area */}
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
                    {/* Search Bar */}
                    <TextField
                        label={t("search_task")}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Task List */}
                    {isLoadingTask ? (
                        <CircularProgress />
                    ) : filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <Box
                                key={task._id}
                                sx={{
                                    width: "100%",
                                    marginBottom: 2,
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: 2,
                                    backgroundColor: "#fff",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="h6">{task.title}</Typography>
                                    <Box>
                                        <IconButton onClick={() => toggleTaskDescription(task._id)}>
                                            {openTaskIds.includes(task._id) ? (
                                                <ExpandLessIcon />
                                            ) : (
                                                <ExpandMoreIcon />
                                            )}
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleEditTask(task._id)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleOpenDeleteDialog(task._id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                {openTaskIds.includes(task._id) && (
                                    <Box sx={{ marginTop: 2 }}>
                                        <Typography variant="body2">{task.summary}</Typography>
                                        <div dangerouslySetInnerHTML={{ __html: task.description }} />
                                    </Box>
                                )}
                            </Box>
                        ))
                    ) : (
                        <NotFound
                            title={t("NTaskFound")}
                            subTitle={t("NoTaskcreated")}
                        />
                    )}

                    {/* Create Task Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={toggleCreateTask}
                        sx={{ marginTop: 2 }}
                    >
                        {t("create_task") || "Criar Tarefa"}
                    </Button>
                </Box>
            </Box>

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
                <DialogTitle>{t("edit_task")}</DialogTitle>
                <DialogContent>{renderTaskForm(true)}</DialogContent>
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
                <DialogContent>{renderTaskForm(false)}</DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>{t("confirm_delete")}</DialogTitle>
                <DialogContent>
                    <Typography>{t("confirm_delete_message")}</Typography>
                </DialogContent>
                <Box sx={{ padding: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        {t("cancel") || "Cancelar"}
                    </Button>
                    <Button onClick={handleDeleteTask} color="error" variant="contained">
                        {t("delete") || "Deletar"}
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
};

export default EditExperimentTask;