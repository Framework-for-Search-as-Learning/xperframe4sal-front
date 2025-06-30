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
import NotFound from '../../../components/NotFound';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";

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
    const [user] = useState(JSON.parse(localStorage.getItem("user")));

    const { t } = useTranslation();
    const [isLoadingTask, setIsLoadingTask] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [ExperimentTasks, setExperimentTasks] = useState([]);

    const [openTaskIds, setOpenTaskIds] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskid, settaskid] = useState("");
    const [taskSummary, setTaskSummary] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [RulesExperiment, setRulesExperiment] = useState("score");
    const [ScoreThresholdmx, setScoreThresholdmx] = useState("");
    const [ScoreThreshold, setScoreThreshold] = useState("");
    const [scoreType, setscoreType] = useState("");
    const [SelectedSurvey, setSelectedSurvey] = useState("");
    const [SelectedSurveyids, setSelectedSurveyids] = useState("");
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [SelectedQuestion, setSelectedQuestion] = useState(null);
    const [editTaskIndex, setEditTaskIndex] = useState(null);


    const handleEditTask = async (index) => {
        setEditTaskIndex(index);
        const task = tasks.find((t) => t._id === index);

        if (task) {
            settaskid(task._id);

            const response = await api.get(`task-question-map/task/${task._id}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            const filteredTasks = response.data;
            setSelectedQuestionIds(filteredTasks);

            setTaskTitle(task.title);
            setTaskSummary(task.summary);
            setTaskDescription(task.description);
            setRulesExperiment(task.rule_type);
            setScoreThresholdmx(task.max_score);
            setScoreThreshold(task.min_score);
            setscoreType("min_max");

            const selectedSurvey2 = ExperimentSurveys.find(s => s._id === task.survey_id);
            setSelectedSurvey(selectedSurvey2);
            setSelectedSurveyids(selectedSurvey2);

            if (selectedSurvey2?.questions) {
                const selectedQs = selectedSurvey2.questions.filter(q =>
                    filteredTasks.includes(q.id)
                );
                setSelectedQuestion(selectedQs);
            }

            toggleEditTask();
        }
    };

    const [isValidTitleTask, setIsValidTitleTask] = React.useState(true);
    const [isValidSumaryTask, setIsValidSumaryTask] = React.useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taskToDeleteIndex, setTaskToDeleteIndex] = useState(null);

    const scoreTypes = [
        { value: "unic", label: t("unic") },
        { value: "min_max", label: t("min_max") },
    ];
    const RulesExperimentTypes = [
        { value: "score", label: t("score") },
        { value: "question", label: t("question") },
    ];

    const handleOpenDeleteDialog = (index) => {
        setTaskToDeleteIndex(index);
        setIsDeleteDialogOpen(true);
    };

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

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTaskToDeleteIndex(null);
    };

    const handleNameChangeTitleTask = (e) => {
        const value = e.target.value;
        setTaskTitle(value);
        setIsValidTitleTask(value.trim().length > 0);
    };

    const handleNameChangeSumaryTask = (e) => {
        const value = e.target.value;
        setTaskSummary(value);
        setIsValidSumaryTask(value.trim().length > 0);
    };

    const isValidFormTask =
        isValidTitleTask && taskTitle && isValidSumaryTask && taskSummary;

    const handleCancelEditTask = () => {
        resetTask();
        toggleEditTask();
    };
    const handleCancelTask = () => {
        resetTask();
        toggleCreateTask();
    };

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
    };

    const handleSurveyChange = (event) => {
        const newSurvey = event.target.value;
        setSelectedSurvey(newSurvey);
        setSelectedQuestion(null);
    };

    const handleQuestionChange = (event) => {
        const selectedIds = event.target.value;

        const selectedQuestions = SelectedSurvey.questions.filter((q) =>
            selectedIds.includes(q._id)
        );
        setSelectedQuestionIds(selectedIds);
        setSelectedQuestion(selectedQuestions);
    };


    const toggleCreateTask = () => {
        resetTask();
        setIsCreateTaskOpen((prev) => !prev);
    };

    const toggleEditTask = () => setIsEditTaskOpen((prev) => !prev);

    const toggleTaskDescription = (index) => {
        setOpenTaskIds((prev) =>
            prev.includes(index)
                ? prev.filter((id) => id !== index)
                : [...prev, index]
        );
    };

    useEffect(() => {
        fetchTasks();
    }, [user, t]);

    const fetchTasks = async () => {
        try {
            const response = await api.get(`task2/experiment/${ExperimentId}`, {
                //params: { Experimentid: experimentId },    talvez seja uma boa melhorar o get, podendo usar parametros
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            const filteredTasks = response.data;
            //const filteredTasks = response.data.filter(task => task.Experimentid === ExperimentId);
            setTasks(filteredTasks);
        } catch (error) {
            console.error(t("Error in Search"), error);
        }
    };

    const handleCreateTask = async () => {
        try {
            setIsLoadingTask(true);

            let questionIds = [];

            let surveyId = SelectedSurvey?._id || null;

            if (BtypeExperiment !== "rules_based") {
                surveyId = null;
                questionIds = null;
            } else {
                questionIds =
                    RulesExperiment === "score"
                        ? null
                        : Array.isArray(selectedQuestionIds)
                            ? selectedQuestionIds.map(q => q.id).filter(Boolean)
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
            };
            console.log(newTask)

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


    const handleEditTaskSubmit = async (e) => {
        e.preventDefault();

        let surveyId = SelectedSurvey?._id || null;
        let questionsId = selectedQuestionIds || [];

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
        };
        console.log(newTask)

        try {
            const response = await api.patch(
                `/task2/${editTaskIndex}`,
                newTask,
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );

            toggleEditTask();
            resetTask();
            fetchTasks();
        } catch (error) {
            console.error("Erro na atualização da tarefa:", error);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                columnGap: 2.5,
                marginTop: { xs: 6.5, sm: 0 }
            }}
        >
            <Typography fontSize={40} variant="h6" align="center" gutterBottom>
                {t('edit_task')}
            </Typography>
            <Box
                sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Box
                    sx={{
                        padding: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        boxShadow: 4,
                        width: '100%',
                        marginX: 'auto'
                    }}
                >

                    {isLoadingTask ? (
                        <CircularProgress />
                    ) : Array.isArray(tasks) && tasks.length > 0 ? (
                        <FormControl fullWidth>
                            <Box
                                sx={{
                                    minHeight: 300, maxHeight: 300,
                                    overflowY: 'auto'
                                }}
                            >
                                {Array.isArray(tasks) &&
                                    tasks.filter((task) =>
                                        task.title.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map((task, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                mb: 1,
                                                padding: 1,
                                                backgroundColor: '#ffffff',
                                                borderRadius: '4px',
                                                boxShadow: 1,
                                                wordBreak: 'break-word',
                                                '&:hover': { backgroundColor: '#e6f7ff' }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <ListItemText primary={task.title} sx={{ ml: 1 }} />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleOpenDeleteDialog(task._id)}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() =>
                                                            handleEditTask(task._id)
                                                        }
                                                        sx={{ ml: 2 }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => toggleTaskDescription(task._id)}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        {openTaskIds.includes(task._id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {openTaskIds.includes(task._id) && (
                                                <Box
                                                    sx={{
                                                        marginTop: 0,
                                                        padding: 1,
                                                        backgroundColor: '#E8E8E8',
                                                        borderRadius: '4px',
                                                        maxHeight: '150px',
                                                        overflowY: 'auto',
                                                        wordBreak: 'break-word',
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: task.description }}
                                                />
                                            )}
                                        </Box>
                                    ))}

                            </Box>
                        </FormControl>
                    ) : (
                        <NotFound title={t('NTaskFound')} subTitle={t('NoTaskcreated')} />
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
                            {isCreateTaskOpen ? "Cancelar" : "Criar Tarefa"}
                        </Button>
                    </Box>
                </Box>
            </Box>
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
                <DialogTitle>{t("task_creation")}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleCreateTask}>
                        <TextField
                            label={t("task_title")}
                            error={!isValidTitleTask}
                            helperText={
                                !isValidTitleTask
                                    ? t("invalid_name_message")
                                    : ""
                            }
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={taskTitle}
                            onChange={handleNameChangeTitleTask}
                            required
                        />

                        {ExperimentType === "between-subject" &&
                            BtypeExperiment === "rules_based" && (
                                <>
                                    {RulesExperiment === "score" && (
                                        <Grid
                                            container
                                            spacing={2}
                                            alignItems="center"
                                        >
                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("Separation_rule")}
                                                    </InputLabel>
                                                    <Select
                                                        value={RulesExperiment}
                                                        onChange={(e) =>
                                                            setRulesExperiment(
                                                                e.target.value
                                                            )
                                                        }
                                                        label={t(
                                                            "Separation_rule"
                                                        )}
                                                    >
                                                        {RulesExperimentTypes.map(
                                                            (stype) => (
                                                                <MenuItem
                                                                    key={
                                                                        stype.value
                                                                    }
                                                                    value={
                                                                        stype.value
                                                                    }
                                                                >
                                                                    {
                                                                        stype.label
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("select_survey")}
                                                    </InputLabel>
                                                    <Select
                                                        value={SelectedSurvey}
                                                        onChange={
                                                            handleSurveyChange
                                                        }
                                                        label={t(
                                                            "select_survey"
                                                        )}
                                                    >
                                                        {ExperimentSurveys?.length >
                                                            0 ? (
                                                            ExperimentSurveys.map(
                                                                (survey) => (
                                                                    <MenuItem
                                                                        key={
                                                                            survey.id
                                                                        }
                                                                        value={
                                                                            survey
                                                                        }
                                                                    >
                                                                        {
                                                                            survey.title
                                                                        }
                                                                    </MenuItem>
                                                                )
                                                            )
                                                        ) : (
                                                            <MenuItem disabled>
                                                                {t(
                                                                    "no_survey_available"
                                                                )}
                                                            </MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("select_survey_th")}
                                                    </InputLabel>
                                                    <Select
                                                        value={scoreType}
                                                        onChange={(e) =>
                                                            setscoreType(
                                                                e.target.value
                                                            )
                                                        }
                                                        label={t(
                                                            "select_survey_th"
                                                        )}
                                                    >
                                                        {scoreTypes.map(
                                                            (stype) => (
                                                                <MenuItem
                                                                    key={
                                                                        stype.value
                                                                    }
                                                                    value={
                                                                        stype.value
                                                                    }
                                                                >
                                                                    {
                                                                        stype.label
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            {scoreType === "unic" ? (
                                                <Grid item xs={2}>
                                                    <TextField
                                                        fullWidth
                                                        margin="normal"
                                                        type="number"
                                                        label={t(
                                                            "score_Threshold_unic"
                                                        )}
                                                        value={ScoreThreshold}
                                                        onChange={(e) => {
                                                            const value =
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                );
                                                            setScoreThreshold(
                                                                value
                                                            );
                                                            setScoreThresholdmx(
                                                                value
                                                            );
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
                                                            label={t(
                                                                "score_Threshold_min"
                                                            )}
                                                            value={
                                                                ScoreThreshold
                                                            }
                                                            onChange={(e) => {
                                                                const minValue =
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                if (
                                                                    minValue <=
                                                                    ScoreThresholdmx
                                                                ) {
                                                                    setScoreThreshold(
                                                                        minValue
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField
                                                            fullWidth
                                                            margin="normal"
                                                            type="number"
                                                            label={t(
                                                                "score_Threshold_max"
                                                            )}
                                                            value={
                                                                ScoreThresholdmx
                                                            }
                                                            onChange={(e) => {
                                                                const maxValue =
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                if (
                                                                    maxValue >=
                                                                    ScoreThreshold
                                                                ) {
                                                                    setScoreThresholdmx(
                                                                        maxValue
                                                                    );
                                                                }
                                                            }}
                                                            inputProps={{
                                                                min: ScoreThreshold,
                                                            }}
                                                        />
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
                                    )}

                                    {RulesExperiment === "question" && (
                                        <Grid
                                            container
                                            spacing={2}
                                            alignItems="center"
                                        >
                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("Separation_rule")}
                                                    </InputLabel>
                                                    <Select
                                                        value={RulesExperiment}
                                                        onChange={(e) =>
                                                            setRulesExperiment(
                                                                e.target.value
                                                            )
                                                        }
                                                        label={t(
                                                            "Separation_rule"
                                                        )}
                                                    >
                                                        {RulesExperimentTypes.map(
                                                            (stype) => (
                                                                <MenuItem
                                                                    key={
                                                                        stype.value
                                                                    }
                                                                    value={
                                                                        stype.value
                                                                    }
                                                                >
                                                                    {
                                                                        stype.label
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("select_survey")}
                                                    </InputLabel>
                                                    <Select
                                                        value={SelectedSurvey}
                                                        onChange={
                                                            handleSurveyChange
                                                        }
                                                        label={t(
                                                            "select_survey"
                                                        )}
                                                    >
                                                        {ExperimentSurveys?.length >
                                                            0 ? (
                                                            ExperimentSurveys.map(
                                                                (survey) => (
                                                                    <MenuItem
                                                                        key={
                                                                            survey.id
                                                                        }
                                                                        value={
                                                                            survey
                                                                        }
                                                                    >
                                                                        {
                                                                            survey.title
                                                                        }
                                                                    </MenuItem>
                                                                )
                                                            )
                                                        ) : (
                                                            <MenuItem disabled>
                                                                {t(
                                                                    "no_survey_available"
                                                                )}
                                                            </MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl fullWidth margin="normal">
                                                    <InputLabel>{t('select_question')}</InputLabel>

                                                    <Select
                                                        value={selectedQuestionIds}
                                                        onChange={handleQuestionChange}
                                                        label={t('select_question')}
                                                        multiple
                                                        renderValue={(selected) =>
                                                            SelectedSurvey.questions
                                                                .filter(q => selected.includes(q.id))
                                                                .map(q => q.statement || 'Sem enunciado')
                                                                .join(', ')
                                                        }
                                                    >
                                                        {SelectedSurvey?.questions && SelectedSurvey.questions.length > 0 ? (
                                                            SelectedSurvey.questions
                                                                .filter(q => q.type === 'multiple-selection' || q.type === 'multiple-choices')
                                                                .map((question) => (
                                                                    <MenuItem key={question.id} value={question.id}>
                                                                        <Checkbox checked={selectedQuestionIds.includes(question.id)} />
                                                                        {question.statement || 'Sem enunciado'}
                                                                    </MenuItem>
                                                                ))
                                                        ) : (
                                                            <MenuItem disabled>{t('no_questions_available')}</MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>

                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("select_survey_th")}
                                                    </InputLabel>
                                                    <Select
                                                        value={scoreType}
                                                        onChange={(e) =>
                                                            setscoreType(
                                                                e.target.value
                                                            )
                                                        }
                                                        label={t(
                                                            "select_survey_th"
                                                        )}
                                                    >
                                                        {scoreTypes.map(
                                                            (stype) => (
                                                                <MenuItem
                                                                    key={
                                                                        stype.value
                                                                    }
                                                                    value={
                                                                        stype.value
                                                                    }
                                                                >
                                                                    {
                                                                        stype.label
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            {scoreType === "unic" ? (
                                                <Grid item xs={2}>
                                                    <TextField
                                                        fullWidth
                                                        margin="normal"
                                                        type="number"
                                                        label={t(
                                                            "score_Threshold_unic"
                                                        )}
                                                        value={ScoreThreshold}
                                                        onChange={(e) => {
                                                            const value =
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                );
                                                            setScoreThreshold(
                                                                value
                                                            );
                                                            setScoreThresholdmx(
                                                                value
                                                            );
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
                                                            label={t(
                                                                "score_Threshold_min"
                                                            )}
                                                            value={
                                                                ScoreThreshold
                                                            }
                                                            onChange={(e) => {
                                                                const minValue =
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                if (
                                                                    minValue <=
                                                                    ScoreThresholdmx
                                                                ) {
                                                                    setScoreThreshold(
                                                                        minValue
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <TextField
                                                            fullWidth
                                                            margin="normal"
                                                            type="number"
                                                            label={t(
                                                                "score_Threshold_max"
                                                            )}
                                                            value={
                                                                ScoreThresholdmx
                                                            }
                                                            onChange={(e) => {
                                                                const maxValue =
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                if (
                                                                    maxValue >=
                                                                    ScoreThreshold
                                                                ) {
                                                                    setScoreThresholdmx(
                                                                        maxValue
                                                                    );
                                                                }
                                                            }}
                                                            inputProps={{
                                                                min: ScoreThreshold,
                                                            }}
                                                        />
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
                                    )}
                                </>
                            )}
                        <TextField
                            label={t("task_summary")}
                            error={!isValidSumaryTask}
                            helperText={
                                !isValidSumaryTask
                                    ? t("invalid_name_message")
                                    : ""
                            }
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            value={taskSummary}
                            onChange={handleNameChangeSumaryTask}
                            required
                        />
                        <div
                            style={{
                                width: "100%",
                                marginTop: "16.5px",
                                marginBottom: "16px",
                            }}
                        >
                            <CustomContainer>
                                <ReactQuill
                                    value={taskDescription}
                                    onChange={(content) =>
                                        setTaskDescription(content)
                                    }
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
                                onClick={handleCancelEditTask}
                                color="primary"
                            >
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
                    <form onSubmit={handleCreateTask}>
                        <TextField
                            label={t("task_title")}
                            error={!isValidTitleTask}
                            helperText={
                                !isValidTitleTask
                                    ? t("invalid_name_message")
                                    : ""
                            }
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={taskTitle}
                            onChange={handleNameChangeTitleTask}
                            required
                        />

                        {ExperimentType === "between-subject" &&
                            BtypeExperiment === "rules_based" && (
                                <>
                                    {RulesExperiment === "score" && (
                                        <Grid
                                            container
                                            spacing={2}
                                            alignItems="center"
                                        >
                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("Separation_rule")}
                                                    </InputLabel>
                                                    <Select
                                                        value={RulesExperiment}
                                                        onChange={(e) =>
                                                            setRulesExperiment(
                                                                e.target.value
                                                            )
                                                        }
                                                        label={t(
                                                            "Separation_rule"
                                                        )}
                                                    >
                                                        {RulesExperimentTypes.map(
                                                            (stype) => (
                                                                <MenuItem
                                                                    key={
                                                                        stype.value
                                                                    }
                                                                    value={
                                                                        stype.value
                                                                    }
                                                                >
                                                                    {
                                                                        stype.label
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("select_survey")}
                                                    </InputLabel>
                                                    <Select
                                                        value={SelectedSurvey}
                                                        onChange={
                                                            handleSurveyChange
                                                        }
                                                        label={t(
                                                            "select_survey"
                                                        )}
                                                    >
                                                        {ExperimentSurveys?.length >
                                                            0 ? (
                                                            ExperimentSurveys.map(
                                                                (survey) => (
                                                                    <MenuItem
                                                                        key={
                                                                            survey.id
                                                                        }
                                                                        value={
                                                                            survey
                                                                        }
                                                                    >
                                                                        {
                                                                            survey.title
                                                                        }
                                                                    </MenuItem>
                                                                )
                                                            )
                                                        ) : (
                                                            <MenuItem disabled>
                                                                {t(
                                                                    "no_survey_available"
                                                                )}
                                                            </MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("select_survey_th")}
                                                    </InputLabel>
                                                    <Select
                                                        value={scoreType}
                                                        onChange={(e) =>
                                                            setscoreType(
                                                                e.target.value
                                                            )
                                                        }
                                                        label={t(
                                                            "select_survey_th"
                                                        )}
                                                    >
                                                        {scoreTypes.map(
                                                            (stype) => (
                                                                <MenuItem
                                                                    key={
                                                                        stype.value
                                                                    }
                                                                    value={
                                                                        stype.value
                                                                    }
                                                                >
                                                                    {
                                                                        stype.label
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            {scoreType === "unic" ? (
                                                <Grid item xs={2}>
                                                    <TextField
                                                        fullWidth
                                                        margin="normal"
                                                        type="number"
                                                        label={t(
                                                            "score_Threshold_unic"
                                                        )}
                                                        value={ScoreThreshold}
                                                        onChange={(e) => {
                                                            const value =
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                );
                                                            setScoreThreshold(
                                                                value
                                                            );
                                                            setScoreThresholdmx(
                                                                value
                                                            );
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
                                                            label={t(
                                                                "score_Threshold_min"
                                                            )}
                                                            value={
                                                                ScoreThreshold
                                                            }
                                                            onChange={(e) => {
                                                                const minValue =
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                if (
                                                                    minValue <=
                                                                    ScoreThresholdmx
                                                                ) {
                                                                    setScoreThreshold(
                                                                        minValue
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField
                                                            fullWidth
                                                            margin="normal"
                                                            type="number"
                                                            label={t(
                                                                "score_Threshold_max"
                                                            )}
                                                            value={
                                                                ScoreThresholdmx
                                                            }
                                                            onChange={(e) => {
                                                                const maxValue =
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                if (
                                                                    maxValue >=
                                                                    ScoreThreshold
                                                                ) {
                                                                    setScoreThresholdmx(
                                                                        maxValue
                                                                    );
                                                                }
                                                            }}
                                                            inputProps={{
                                                                min: ScoreThreshold,
                                                            }}
                                                        />
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
                                    )}

                                    {RulesExperiment === "question" && (
                                        <Grid
                                            container
                                            spacing={2}
                                            alignItems="center"
                                        >
                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("Separation_rule")}
                                                    </InputLabel>
                                                    <Select
                                                        value={RulesExperiment}
                                                        onChange={(e) =>
                                                            setRulesExperiment(
                                                                e.target.value
                                                            )
                                                        }
                                                        label={t(
                                                            "Separation_rule"
                                                        )}
                                                    >
                                                        {RulesExperimentTypes.map(
                                                            (stype) => (
                                                                <MenuItem
                                                                    key={
                                                                        stype.value
                                                                    }
                                                                    value={
                                                                        stype.value
                                                                    }
                                                                >
                                                                    {
                                                                        stype.label
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("select_survey")}
                                                    </InputLabel>
                                                    <Select
                                                        value={SelectedSurvey}
                                                        onChange={
                                                            handleSurveyChange
                                                        }
                                                        label={t(
                                                            "select_survey"
                                                        )}
                                                    >
                                                        {ExperimentSurveys?.length >
                                                            0 ? (
                                                            ExperimentSurveys.map(
                                                                (survey) => (
                                                                    <MenuItem
                                                                        key={
                                                                            survey.id
                                                                        }
                                                                        value={
                                                                            survey
                                                                        }
                                                                    >
                                                                        {
                                                                            survey.title
                                                                        }
                                                                    </MenuItem>
                                                                )
                                                            )
                                                        ) : (
                                                            <MenuItem disabled>
                                                                {t(
                                                                    "no_survey_available"
                                                                )}
                                                            </MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("select_question")}
                                                    </InputLabel>
                                                    <Select
                                                        value={
                                                            selectedQuestionIds
                                                        }
                                                        onChange={
                                                            handleQuestionChange
                                                        }
                                                        label={t(
                                                            "select_question"
                                                        )}
                                                        multiple
                                                        renderValue={(
                                                            selected
                                                        ) =>
                                                            SelectedSurvey.questions
                                                                .filter((q) =>
                                                                    selected.includes(
                                                                        q
                                                                    )
                                                                )
                                                                .map(
                                                                    (q) =>
                                                                        q.statement ||
                                                                        "Sem enunciado"
                                                                )
                                                                .join(", ")
                                                        }
                                                    >
                                                        {SelectedSurvey?.questions &&
                                                            SelectedSurvey.questions
                                                                .length > 0 ? (
                                                            SelectedSurvey.questions
                                                                .filter(
                                                                    (q) =>
                                                                        q.type ===
                                                                        "multiple-selection" ||
                                                                        q.type ===
                                                                        "multiple-choices"
                                                                )
                                                                .map(
                                                                    (
                                                                        question
                                                                    ) => (
                                                                        <MenuItem
                                                                            key={
                                                                                question.id
                                                                            }
                                                                            value={
                                                                                question
                                                                            }
                                                                        >
                                                                            <Checkbox
                                                                                checked={selectedQuestionIds.includes(
                                                                                    question
                                                                                )}
                                                                            />
                                                                            {question.statement ||
                                                                                "Sem enunciado"}
                                                                        </MenuItem>
                                                                    )
                                                                )
                                                        ) : (
                                                            <MenuItem disabled>
                                                                {t(
                                                                    "no_questions_available"
                                                                )}
                                                            </MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={4}>
                                                <FormControl
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <InputLabel>
                                                        {t("select_survey_th")}
                                                    </InputLabel>
                                                    <Select
                                                        value={scoreType}
                                                        onChange={(e) =>
                                                            setscoreType(
                                                                e.target.value
                                                            )
                                                        }
                                                        label={t(
                                                            "select_survey_th"
                                                        )}
                                                    >
                                                        {scoreTypes.map(
                                                            (stype) => (
                                                                <MenuItem
                                                                    key={
                                                                        stype.value
                                                                    }
                                                                    value={
                                                                        stype.value
                                                                    }
                                                                >
                                                                    {
                                                                        stype.label
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            {scoreType === "unic" ? (
                                                <Grid item xs={2}>
                                                    <TextField
                                                        fullWidth
                                                        margin="normal"
                                                        type="number"
                                                        label={t(
                                                            "score_Threshold_unic"
                                                        )}
                                                        value={ScoreThreshold}
                                                        onChange={(e) => {
                                                            const value =
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                );
                                                            setScoreThreshold(
                                                                value
                                                            );
                                                            setScoreThresholdmx(
                                                                value
                                                            );
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
                                                            label={t(
                                                                "score_Threshold_min"
                                                            )}
                                                            value={
                                                                ScoreThreshold
                                                            }
                                                            onChange={(e) => {
                                                                const minValue =
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                if (
                                                                    minValue <=
                                                                    ScoreThresholdmx
                                                                ) {
                                                                    setScoreThreshold(
                                                                        minValue
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <TextField
                                                            fullWidth
                                                            margin="normal"
                                                            type="number"
                                                            label={t(
                                                                "score_Threshold_max"
                                                            )}
                                                            value={
                                                                ScoreThresholdmx
                                                            }
                                                            onChange={(e) => {
                                                                const maxValue =
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                if (
                                                                    maxValue >=
                                                                    ScoreThreshold
                                                                ) {
                                                                    setScoreThresholdmx(
                                                                        maxValue
                                                                    );
                                                                }
                                                            }}
                                                            inputProps={{
                                                                min: ScoreThreshold,
                                                            }}
                                                        />
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
                                    )}
                                </>
                            )}
                        <TextField
                            label={t("task_summary")}
                            error={!isValidSumaryTask}
                            helperText={
                                !isValidSumaryTask
                                    ? t("invalid_name_message")
                                    : ""
                            }
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            value={taskSummary}
                            onChange={handleNameChangeSumaryTask}
                            required
                        />
                        <div
                            style={{
                                width: "100%",
                                marginTop: "16.5px",
                                marginBottom: "16px",
                            }}
                        >
                            <CustomContainer>
                                <ReactQuill
                                    value={taskDescription}
                                    onChange={(content) =>
                                        setTaskDescription(content)
                                    }
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
                                onClick={handleCancelTask}
                                color="primary"
                            >
                                {"Cancelar"}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                onClick={handleCreateTask}
                                disabled={!isValidFormTask || isLoadingTask}
                            >
                                {"Criar"}
                            </Button>
                        </Box>
                    </form>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default EditExperimentTask;
