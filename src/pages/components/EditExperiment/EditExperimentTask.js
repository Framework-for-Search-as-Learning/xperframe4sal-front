/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, {useState, useContext, useEffect} from "react";
import {Box, CircularProgress, IconButton, Typography, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import StepContext from "./context/StepContext";
import NotFound from "../../../components/NotFound";
import {api} from "../../../config/axios";
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";

import TaskDialog from "../CreateExperiment/components/TaskDialog";
import DeleteConfirmDialog from "../CreateExperiment/components/DeleteConfirmDialog";

import {useTaskForm} from "../CreateExperiment/hooks/useTaskForm";
import {filterTasks} from "../CreateExperiment/utils/formHelpers";

const EditExperimentTask = () => {
    const {t} = useTranslation();

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

    const [isLoadingTask, setIsLoadingTask] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [tasks, setTasks] = useState([]);
    const [openTaskIds, setOpenTaskIds] = useState([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taskToDeleteId, setTaskToDeleteId] = useState(null);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [editTaskId, setEditTaskId] = useState(null);

    const [scoreType, setscoreType] = useState("");

    const createForm = useTaskForm("create");
    const editForm = useTaskForm("edit");

    useEffect(() => {
        fetchTasks();
    }, [ExperimentId]);

    const fetchTasks = async () => {
        if (!ExperimentId) return;

        setIsLoadingTask(true);
        try {
            const response = await api.get(`task/experiment/${ExperimentId}`, {
                headers: {Authorization: `Bearer ${user.accessToken}`},
            });
            setTasks(response.data);
        } catch (error) {
            console.error(t("Error in Search"), error);
        } finally {
            setIsLoadingTask(false);
        }
    };

    const toggleCreateTask = () => {
        if (isCreateTaskOpen) {
            createForm.resetForm();
        }
        setIsCreateTaskOpen((prev) => !prev);
    };

    const toggleEditTask = () => {
        if (isEditTaskOpen) {
            editForm.resetForm();
        }
        setIsEditTaskOpen((prev) => !prev);
    };

    const toggleTaskDescription = (taskId) => {
        setOpenTaskIds((prev) =>
            prev.includes(taskId)
                ? prev.filter((id) => id !== taskId)
                : [...prev, taskId]
        );
    };

    const handleOpenDeleteDialog = (taskId) => {
        setTaskToDeleteId(taskId);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTaskToDeleteId(null);
    };

    const handleDeleteTask = async () => {
        try {
            await api.delete(`task/${taskToDeleteId}`, {
                headers: {Authorization: `Bearer ${user.accessToken}`},
            });
            await fetchTasks();
            handleCloseDeleteDialog();
        } catch (error) {
            console.error(t("Error deleting task"), error);
        }
    };

    const handleSurveyChangeGeneric = (event, isEdit) => {
        const newSurvey = event.target.value;
        if (isEdit) {
            editForm.setSelectedSurvey(newSurvey);
            editForm.setQuestionsId([]);
        } else {
            createForm.setSelectedSurvey(newSurvey);
            createForm.setSelectedQuestion(null);
        }
    };

    const handleQuestionChangeGeneric = (event, isEdit) => {
        const selectedIds = event.target.value;
        if (isEdit) {
            editForm.setQuestionsId(selectedIds);
        } else {
            createForm.setQuestionsId(selectedIds);
            const selectedQuestions = createForm.formState.SelectedSurvey.questions?.filter(
                (q) => selectedIds.includes(q.statement)
            );
            createForm.setSelectedQuestion(selectedQuestions);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setIsLoadingTask(true);

        try {
            const newTask = createForm.buildTaskObject();
            newTask.experiment_id = ExperimentId;

            await api.post(`task`, newTask, {
                headers: {Authorization: `Bearer ${user.accessToken}`},
            });

            await fetchTasks();
            createForm.resetForm();
            toggleCreateTask();
        } catch (error) {
            console.error(t("Error creating task"), error);
        } finally {
            setIsLoadingTask(false);
        }
    };

    const handleEditTask = async (taskId) => {
        try {
            setIsLoadingTask(true);
            const response = await api.get(`task/${taskId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            const task = response.data;
            const config = task.provider_config || {};
            const masked = task.provider_config_masked?.masked || {};

            setEditTaskId(taskId);

            editForm.setTaskTitle(task.title);
            editForm.setTaskSummary(task.summary);
            editForm.setTaskDescription(task.description);

            editForm.setRulesExperiment(task.rule_type || "score");
            editForm.setScoreThreshold(task.min_score || 0);
            editForm.setScoreThresholdmx(task.max_score || 0);
            setscoreType(task.min_score !== task.max_score ? "min_max" : "unic");

            editForm.setOrigin(task.search_source || "");
            if (task.search_source === "llm") {
                editForm.setLlmProvider(config.modelProvider || "");
                editForm.setLlm(config.model || "");
                editForm.setGeminiApiKey(masked.apiKey || "");
            } else {
                editForm.setSearchEngine(config.searchProvider || "google");
                editForm.setGoogleApikey(masked.apiKey || "");
                editForm.setGoogleCx(masked.cx || "");
            }

            toggleEditTask();
        } catch (error) {
            console.error("Erro ao carregar tarefa:", error);
        } finally {
            setIsLoadingTask(false);
        }
    };

    const handleEditTaskSubmit = async (e) => {
        e.preventDefault();
        setIsLoadingTask(true);

        try {
            const updatedTask = editForm.buildTaskObject();

            const taskDataToSend = {
                title: updatedTask.title,
                summary: updatedTask.summary,
                description: updatedTask.description,
                search_source: updatedTask.search_source,
                provider_config: updatedTask.provider_config,
                rule_type: updatedTask.RulesExperiment,
                survey_id: updatedTask.SelectedSurvey,
                min_score: Number(updatedTask.ScoreThreshold) || 0,
                max_score: Number(updatedTask.ScoreThresholdmx) || 0,
                questionsId: editForm.formState.RulesExperiment === "question"
                    ? (editForm.formState.questionsId?.map(q => q.id) || [])
                    : []
            };

            await api.patch(`task/${editTaskId}`, taskDataToSend, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            if (editForm.formState.RulesExperiment === "question") {
                try {
                    await api.delete(`task-question-map/task/${editTaskId}`, {
                        headers: { Authorization: `Bearer ${user.accessToken}` },
                    });
                } catch (err) {
                    console.log("Nenhum mapeamento prévio para deletar");
                }

                if (editForm.formState.questionsId?.length > 0) {
                    const mappingPromises = editForm.formState.questionsId.map((question) =>
                        api.post(
                            `task-question-map`,
                            { task: editTaskId, question: question.id },
                            { headers: { Authorization: `Bearer ${user.accessToken}` } }
                        )
                    );
                    await Promise.all(mappingPromises);
                }
            }

            await fetchTasks();
            toggleEditTask();
        } catch (error) {
            console.error(t("Error updating task"), error);
        } finally {
            setIsLoadingTask(false);
        }
    };

    const getFormConfig = (mode) => {
        const isEdit = mode === "edit";
        const form = isEdit ? editForm : createForm;

        return {
            mode,
            title: form.formState.taskTitle,
            setTitle: (e) => {
                const value = e.target.value;
                form.setTaskTitle(value);
                form.setIsValidTitleTask(value.trim().length > 0);
            },
            isTitleValid: form.formState.isValidTitleTask,

            summary: form.formState.taskSummary,
            setSummary: (e) => {
                const value = e.target.value;
                form.setTaskSummary(value);
                form.setIsValidSumaryTask(value.trim().length > 0);
            },
            isSummaryValid: form.formState.isValidSumaryTask,

            description: form.formState.taskDescription,
            setDescription: form.setTaskDescription,

            rulesExp: form.formState.RulesExperiment,
            setRulesExp: form.setRulesExperiment,

            survey: form.formState.SelectedSurvey,
            setSurvey: (e) => handleSurveyChangeGeneric(e, isEdit),

            questions: form.formState.questionsId,
            setQuestions: (e) => handleQuestionChangeGeneric(e, isEdit),

            threshold: form.formState.ScoreThreshold,
            setThreshold: form.setScoreThreshold,

            thresholdMx: form.formState.ScoreThresholdmx,
            setThresholdMx: form.setScoreThresholdmx,

            origin: form.formState.origin,
            setOrigin: form.setOrigin,
            llmProvider: form.formState.llmProvider,
            setLlmProvider: form.setLlmProvider,
            llm: form.formState.llm,
            setLlm: form.setLlm,
            searchEngine: form.formState.searchEngine,
            setSearchEngine: form.setSearchEngine,

            geminiKey: form.formState.geminiApiKey,
            setGeminiKey: form.setGeminiApiKey,

            googleKey: form.formState.googleApiKey,
            setGoogleKey: form.setGoogleApikey,

            cx: form.formState.googleCx,
            setCx: form.setGoogleCx,

            isValidForm:
                form.formState.isValidTitleTask &&
                form.formState.taskTitle &&
                form.formState.isValidSumaryTask &&
                form.formState.taskSummary,
        };
    };

    const filteredTasks = filterTasks(tasks, searchTerm);

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
                        width: {xs: "95%", sm: "60%"},
                        marginX: "auto",
                    }}
                >
                    <TextField
                        label={t("search_task")}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {isLoadingTask ? (
                        <CircularProgress/>
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
                                                <ExpandLessIcon/>
                                            ) : (
                                                <ExpandMoreIcon/>
                                            )}
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleEditTask(task._id)}
                                            color="primary"
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleOpenDeleteDialog(task._id)}
                                            color="error"
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Box>
                                </Box>
                                {openTaskIds.includes(task._id) && (
                                    <Box sx={{marginTop: 2}}>
                                        <Typography variant="body2">{task.summary}</Typography>
                                        <div dangerouslySetInnerHTML={{__html: task.description}}/>
                                    </Box>
                                )}
                            </Box>
                        ))
                    ) : (
                        <NotFound title={t("NTaskFound")} subTitle={t("NoTaskcreated")}/>
                    )}

                    <Box sx={{marginTop: 2, width: "100%", textAlign: "center"}}>
                        <button
                            onClick={toggleCreateTask}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#1976d2",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "16px",
                            }}
                        >
                            {t("create_task") || "Criar Tarefa"}
                        </button>
                    </Box>
                </Box>
            </Box>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleDeleteTask}
                t={t}
            />

            <TaskDialog
                open={isEditTaskOpen}
                onClose={toggleEditTask}
                mode="edit"
                config={getFormConfig("edit")}
                onSubmit={handleEditTaskSubmit}
                isLoading={isLoadingTask}
                experimentType={ExperimentType}
                btypeExperiment={BtypeExperiment}
                experimentSurveys={ExperimentSurveys}
                scoreType={scoreType}
                setScoreType={setscoreType}
                t={t}
            />

            <TaskDialog
                open={isCreateTaskOpen}
                onClose={toggleCreateTask}
                mode="create"
                config={getFormConfig("create")}
                onSubmit={handleCreateTask}
                isLoading={isLoadingTask}
                experimentType={ExperimentType}
                btypeExperiment={BtypeExperiment}
                experimentSurveys={ExperimentSurveys}
                scoreType={scoreType}
                setScoreType={setscoreType}
                t={t}
            />
        </Box>
    );
};

export default EditExperimentTask;