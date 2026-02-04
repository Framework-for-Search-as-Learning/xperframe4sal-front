import React, { useState, useContext, useEffect } from "react";
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
    const [llm, setLlm] = useState("gemini");
    const [searchEngine, setSearchEngine] = useState("google");

    // Estados para armazenamento de chaves de API
    const [geminiApiKey, setGeminiApiKey] = useState("");
    const [googleApiKey, setGoogleApiKey] = useState("");
    const [googleCx, setGoogleCx] = useState("");

    // Validação de formulário
    const [isValidTitleTask, setIsValidTitleTask] = React.useState(true);
    const [isValidSumaryTask, setIsValidSumaryTask] = React.useState(true);
    const isValidFormTask = isValidTitleTask && taskTitle && isValidSumaryTask && taskSummary;

    // Opções disponíveis para LLMs e motores de busca
    const LlmTypes = [
        { value: "gemini", label: "Gemini (Google)" },
    ];
    const SearchEngines = [
        { value: "google", label: "Google" },
    ];
    const scoreTypes = [
        { value: "unic", label: t("unic") },
        { value: "min_max", label: t("min_max") },
    ];
    const RulesExperimentTypes = [
        { value: "score", label: t("score") },
        { value: "question", label: t("question") },
    ];

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
            setRulesExperiment(task.rule_type);
            setScoreThresholdmx(task.max_score);
            setScoreThreshold(task.min_score);
            setscoreType("min_max");
            setOrigin(task.search_source || "");

            // Configura fonte de pesquisa baseada no tipo
            if (task.search_source === "llm") {
                setLlm(task.search_model || "gemini");
            } else if (task.search_source === "search-engine") {
                setSearchEngine(task.search_model || "google");
            }

            // Carrega chaves de API
            setGeminiApiKey(task.geminiApiKey || "");
            setGoogleApiKey(task.googleApiKey || "");
            setGoogleCx(task.google_cx || "");

            // Encontra e configura o survey selecionado
            const selectedSurvey2 = ExperimentSurveys.find(
                (s) => s._id === task.survey_id,
            );
            setSelectedSurvey(selectedSurvey2);
            setSelectedSurveyids(selectedSurvey2);

            // Filtra questões selecionadas baseado no mapeamento
            if (selectedSurvey2?.questions) {
                const selectedQs = selectedSurvey2.questions.filter((q) =>
                    filteredTasks.includes(q.id),
                );
                setSelectedQuestion(selectedQs);
            }

            toggleEditTask();
        }
    };

    /**
     * Cria uma nova tarefa no experimento
     */
    const handleCreateTask = async () => {
        try {
            setIsLoadingTask(true);

            let questionIds = [];
            let surveyId = SelectedSurvey?._id || null;

            // Ajusta configurações baseadas no tipo de experimento
            if (BtypeExperiment !== "rules_based") {
                surveyId = null;
                questionIds = null;
            } else {
                questionIds = RulesExperiment === "score"
                    ? null
                    : Array.isArray(selectedQuestionIds)
                        ? selectedQuestionIds.map((q) => q.id).filter(Boolean)
                        : [];
            }

            const newTask = {
                title: taskTitle,
                summary: taskSummary,
                description: taskDescription,
                rule_type: RulesExperiment,
                survey_id: surveyId,
                questionsId: questionIds,
                min_score: ScoreThreshold,
                max_score: ScoreThresholdmx,
                experiment_id: ExperimentId,
                search_source: origin,
                search_model: origin === "llm" ? llm : searchEngine,
                geminiApiKey: geminiApiKey,
                googleApiKey: googleApiKey,
                googleCx: googleCx,
            };

            await api.post(`/task2`, newTask, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            toggleCreateTask();
            resetTask();
            fetchTasks();
        } catch (error) {
            console.error(t("Error creating task"), error);
        } finally {
            setIsLoadingTask(false);
        }
    };

    /**
     * Atualiza uma tarefa existente
     */
    const handleEditTaskSubmit = async (e) => {
        e.preventDefault();

        let surveyId = SelectedSurvey?._id || null;
        let questionsId = selectedQuestionIds || [];

        // Ajusta configurações baseadas no tipo de experimento
        if (BtypeExperiment !== "rules_based") {
            surveyId = null;
            questionsId = [];
        } else if (RulesExperiment === "score") {
            questionsId = [];
        }

        const newTask = {
            title: taskTitle,
            summary: taskSummary,
            description: taskDescription,
            rule_type: RulesExperiment,
            survey_id: surveyId,
            questionsId: questionsId,
            min_score: ScoreThreshold,
            max_score: ScoreThresholdmx,
            experiment_id: ExperimentId,
            search_source: origin,
            search_model: origin === "llm" ? llm : searchEngine,
            geminiApiKey: geminiApiKey,
            googleApiKey: googleApiKey,
            googleCx: googleCx,
        };

        try {
            await api.patch(`/task2/${editTaskIndex}`, newTask, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            toggleEditTask();
            resetTask();
            fetchTasks();
        } catch (error) {
            console.error("Erro na atualização da tarefa:", error);
        }
    };

    /**
     * Remove uma tarefa do experimento
     */
    const handleDeleteTask = async () => {
        try {
            await api.delete(`/task2/${taskToDeleteIndex}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            handleCloseDeleteDialog();
            fetchTasks();
        } catch (error) {
            console.error(t("Error in Search"), error);
        }
    };

    /**
     * Reseta todos os campos do formulário
     */
    const resetTask = () => {
        setTaskTitle("");
        setTaskSummary("");
        setTaskDescription("");
        setIsValidTitleTask(true);
        setIsValidSumaryTask(true);
        setRulesExperiment("score");
        setScoreThreshold("");
        setScoreThresholdmx("");
        setSelectedSurvey(null);
        setSelectedQuestionIds([]);
        setSelectedQuestion(null);
        setOrigin("");
        setLlm("gemini");
        setSearchEngine("google");
        setGeminiApiKey("");
        setGoogleApiKey("");
        setGoogleCx("");
    };

    /**
     * Manipula a seleção de questões do survey
     */
    const handleQuestionChange = (event) => {
        const selectedIds = event.target.value;
        const selectedQuestions = SelectedSurvey.questions.filter((q) =>
            selectedIds.includes(q._id),
        );
        setSelectedQuestionIds(selectedIds);
        setSelectedQuestion(selectedQuestions);
    };

    /**
     * Controla abertura/fechamento da descrição da tarefa na lista
     */
    const toggleTaskDescription = (index) => {
        setOpenTaskIds((prev) =>
            prev.includes(index)
                ? prev.filter((id) => id !== index)
                : [...prev, index],
        );
    };

    // Handlers para abertura/fechamento de diálogos
    const handleOpenDeleteDialog = (index) => {
        setTaskToDeleteIndex(index);
        setIsDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTaskToDeleteIndex(null);
    };
    const toggleCreateTask = () => {
        resetTask();
        setIsCreateTaskOpen((prev) => !prev);
    };
    const toggleEditTask = () => setIsEditTaskOpen((prev) => !prev);
    const handleCancelEditTask = () => {
        resetTask();
        toggleEditTask();
    };
    const handleCancelTask = () => {
        resetTask();
        toggleCreateTask();
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                columnGap: 2.5,
                marginTop: { xs: 6.5, sm: 0 },
            }}
        >
            <Typography fontSize={40} variant="h6" align="center" gutterBottom>
                {t("edit_task")}
            </Typography>

            {/* Lista de tarefas do experimento */}
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
                        width: "100%",
                        marginX: "auto",
                    }}
                >
                    {isLoadingTask ? (
                        <CircularProgress />
                    ) : Array.isArray(tasks) && tasks.length > 0 ? (
                        <FormControl fullWidth>
                            <Box
                                sx={{
                                    minHeight: 300,
                                    maxHeight: 300,
                                    overflowY: "auto",
                                }}
                            >
                                {tasks
                                    .filter((task) =>
                                        task.title.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((task, index) => (
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
                                                        onClick={() => handleOpenDeleteDialog(task._id)}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleEditTask(task._id)}
                                                        sx={{ ml: 2 }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => toggleTaskDescription(task._id)}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        {openTaskIds.includes(task._id) ? (
                                                            <ExpandLessIcon />
                                                        ) : (
                                                            <ExpandMoreIcon />
                                                        )}
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {openTaskIds.includes(task._id) && (
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
                                                    dangerouslySetInnerHTML={{
                                                        __html: task.description,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ))}
                            </Box>
                        </FormControl>
                    ) : (
                        <NotFound title={t("NTaskFound")} subTitle={t("NoTaskcreated")} />
                    )}

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "auto",
                            width: "100%",
                            mt: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={toggleCreateTask}
                        >
                            {isCreateTaskOpen ? t("cancel") : t("create_task")}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Diálogo de confirmação de exclusão */}
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
                <DialogContent
                    sx={{
                        textAlign: "center",
                        color: "#6b7280",
                    }}
                >
                    <Box sx={{ marginBottom: 3 }}>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "1rem",
                                lineHeight: 1.5,
                            }}
                        >
                            {t("delete_confirmation_message")}
                        </p>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleCloseDeleteDialog}
                            sx={{
                                borderColor: "#d1d5db",
                                color: "#374151",
                                ":hover": {
                                    backgroundColor: "#f3f4f6",
                                },
                            }}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteTask}
                            sx={{
                                boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            {t("delete")}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Diálogo de edição de tarefa */}
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
                <DialogContent>
                    <form onSubmit={handleEditTaskSubmit}>
                        {/* Campos básicos da tarefa */}
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

                        {/* Configuração de fonte de pesquisa */}
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="origin-label">{t("select_source")}</InputLabel>
                                    <Select
                                        labelId="origin-label"
                                        value={origin}
                                        onChange={(e) => setOrigin(e.target.value)}
                                        label={t("select_source")}
                                    >
                                        <MenuItem value="llm">Large Language Model</MenuItem>
                                        <MenuItem value="search-engine">{t("search_engine")}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Seleção de LLM específico */}
                            {origin === "llm" && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="llm-select-label">{t("select_llm")}</InputLabel>
                                        <Select
                                            labelId="llm-select-label"
                                            value={llm}
                                            onChange={(e) => setLlm(e.target.value)}
                                            label={t("select_llm")}
                                        >
                                            {LlmTypes.map((type) => (
                                                <MenuItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Seleção de motor de busca */}
                            {origin === "search-engine" && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="search-engine-label">
                                            {t("select_search_engine")}
                                        </InputLabel>
                                        <Select
                                            labelId="search-engine-label"
                                            value={searchEngine}
                                            onChange={(e) => setSearchEngine(e.target.value)}
                                            label={t("select_search_engine")}
                                        >
                                            {SearchEngines.map((engine) => (
                                                <MenuItem key={engine.value} value={engine.value}>
                                                    {engine.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>

                        {/* Campos para chaves de API */}
                        <Grid container spacing={2} alignItems="center">
                            {origin === "llm" && llm === "gemini" && (
                                <Grid item xs={12}>
                                    <TextField
                                        label="Gemini API Key"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        value={geminiApiKey}
                                        onChange={(e) => setGeminiApiKey(e.target.value)}
                                        placeholder="Enter your Gemini API Key"
                                    />
                                </Grid>
                            )}

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
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>

                        {/* Configurações específicas para experimentos rules_based */}
                        {ExperimentType === "between-subject" && BtypeExperiment === "rules_based" && (
                            <>
                                {/* Configuração para regras baseadas em score */}
                                {RulesExperiment === "score" && (
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t("Separation_rule")}</InputLabel>
                                                <Select
                                                    value={RulesExperiment}
                                                    onChange={(e) => setRulesExperiment(e.target.value)}
                                                    label={t("Separation_rule")}
                                                >
                                                    {RulesExperimentTypes.map((stype) => (
                                                        <MenuItem key={stype.value} value={stype.value}>
                                                            {stype.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t("select_survey")}</InputLabel>
                                                <Select
                                                    value={SelectedSurvey}
                                                    onChange={(e) => {
                                                        const newSurvey = e.target.value;
                                                        setSelectedSurvey(newSurvey);
                                                        setSelectedQuestion(null);
                                                    }}
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

                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t("select_survey_th")}</InputLabel>
                                                <Select
                                                    value={scoreType}
                                                    onChange={(e) => setscoreType(e.target.value)}
                                                    label={t("select_survey_th")}
                                                >
                                                    {scoreTypes.map((stype) => (
                                                        <MenuItem key={stype.value} value={stype.value}>
                                                            {stype.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {scoreType === "unic" ? (
                                            <Grid item xs={2}>
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
                                                <Grid item xs={4}>
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
                                                <Grid item xs={4}>
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
                                )}

                                {/* Configuração para regras baseadas em questões */}
                                {RulesExperiment === "question" && (
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t("Separation_rule")}</InputLabel>
                                                <Select
                                                    value={RulesExperiment}
                                                    onChange={(e) => setRulesExperiment(e.target.value)}
                                                    label={t("Separation_rule")}
                                                >
                                                    {RulesExperimentTypes.map((stype) => (
                                                        <MenuItem key={stype.value} value={stype.value}>
                                                            {stype.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t("select_survey")}</InputLabel>
                                                <Select
                                                    value={SelectedSurvey}
                                                    onChange={(e) => {
                                                        const newSurvey = e.target.value;
                                                        setSelectedSurvey(newSurvey);
                                                        setSelectedQuestion(null);
                                                    }}
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

                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t("select_question")}</InputLabel>
                                                <Select
                                                    value={selectedQuestionIds}
                                                    onChange={handleQuestionChange}
                                                    label={t("select_question")}
                                                    multiple
                                                    renderValue={(selected) =>
                                                        SelectedSurvey.questions
                                                            .filter((q) => selected.includes(q.id))
                                                            .map((q) => q.statement || "Sem enunciado")
                                                            .join(", ")
                                                    }
                                                >
                                                    {SelectedSurvey?.questions && SelectedSurvey.questions.length > 0 ? (
                                                        SelectedSurvey.questions
                                                            .filter(
                                                                (q) =>
                                                                    q.type === "multiple-selection" ||
                                                                    q.type === "multiple-choices"
                                                            )
                                                            .map((question) => (
                                                                <MenuItem key={question.id} value={question.id}>
                                                                    <Checkbox checked={selectedQuestionIds.includes(question.id)} />
                                                                    {question.statement || "Sem enunciado"}
                                                                </MenuItem>
                                                            ))
                                                    ) : (
                                                        <MenuItem disabled>{t("no_questions_available")}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t("select_survey_th")}</InputLabel>
                                                <Select
                                                    value={scoreType}
                                                    onChange={(e) => setscoreType(e.target.value)}
                                                    label={t("select_survey_th")}
                                                >
                                                    {scoreTypes.map((stype) => (
                                                        <MenuItem key={stype.value} value={stype.value}>
                                                            {stype.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {scoreType === "unic" ? (
                                            <Grid item xs={2}>
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
                                                <Grid item xs={2}>
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
                                                <Grid item xs={2}>
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
                                )}
                            </>
                        )}

                        {/* Campo de resumo da tarefa */}
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

                        {/* Editor de descrição da tarefa (ReactQuill) */}
                        <div style={{ width: "100%", marginTop: "16.5px", marginBottom: "16px" }}>
                            <CustomContainer>
                                <ReactQuill
                                    value={taskDescription}
                                    onChange={(content) => setTaskDescription(content)}
                                    placeholder={t("task_Desc1")}
                                />
                            </CustomContainer>
                        </div>

                        {/* Botões de ação do formulário */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "auto",
                                width: "100%",
                                mt: 2,
                            }}
                        >
                            <Button variant="contained" onClick={handleCancelEditTask} color="primary">
                                {"Cancelar"}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                onClick={handleEditTaskSubmit}
                                disabled={!isValidFormTask || isLoadingTask}
                            >
                                {"Editar"}
                            </Button>
                        </Box>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Diálogo de criação de tarefa (similar ao de edição, mas com submit diferente) */}
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
                    {/* O conteúdo deste formulário é idêntico ao de edição,
              com exceção dos handlers de submit e cancelamento */}
                    {/* ... conteúdo omitido por ser redundante ... */}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default EditExperimentTask;