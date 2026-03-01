/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState, useContext } from "react";
import { Box, CircularProgress, Typography, Button, Snackbar, Alert } from "@mui/material";
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import { useParams } from 'react-router-dom';
import { api } from "../../../config/axios";

import StepContext from "./context/StepContextCreate";
import NotFound from "../../../components/NotFound";
import TaskList from "./components/TaskList";
import TaskDialog from "./components/TaskDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import { useTaskForm } from "./hooks/useTaskForm";
import { handleTextChange, filterTasks } from "./utils/formHelpers";

const CreateExperimentTask = () => {
    const { t } = useTranslation();
    const { experimentId } = useParams();

    const {
        step, setStep,
        ExperimentTasks, setExperimentTasks,
        ExperimentType, BtypeExperiment, ExperimentSurveys,
        isEditMode
    } = useContext(StepContext);

    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [isLoadingTask, setIsLoadingTask] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openTaskIds, setOpenTaskIds] = useState([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taskToDeleteIndex, setTaskToDeleteIndex] = useState(null);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [editTaskIndex, setEditTaskIndex] = useState(null);
    const [scoreType, setscoreType] = useState("");

    const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
    const handleCloseFeedback = () => setFeedback({ ...feedback, open: false });

    const createForm = useTaskForm("create");
    const editForm = useTaskForm("edit");

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const toggleCreateTask = () => {
        if (isCreateTaskOpen) createForm.resetForm();
        setIsCreateTaskOpen((prev) => !prev);
    };

    const toggleEditTask = () => {
        if (isEditTaskOpen) editForm.resetForm();
        setIsEditTaskOpen((prev) => !prev);
    };

    const toggleTaskDescription = (index) => {
        setOpenTaskIds((prev) =>
            prev.includes(index) ? prev.filter((id) => id !== index) : [...prev, index]
        );
    };

    const handleOpenDeleteDialog = (index) => {
        setTaskToDeleteIndex(index);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTaskToDeleteIndex(null);
    };

    const handleDeleteTask = async () => {
        if (isEditMode) {
            try {
                const taskToDelete = ExperimentTasks[taskToDeleteIndex];
                const taskId = taskToDelete._id || taskToDelete.id || taskToDelete.uuid;

                await api.delete(`task/${taskId}`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });
                setFeedback({ open: true, message: t('Success_Delete') || "Tarefa excluída!", severity: 'success' });
            } catch (error) {
                console.error("Erro ao deletar:", error);
                setFeedback({ open: true, message: t('error') || "Erro ao excluir.", severity: 'error' });
                return;
            }
        }
        setExperimentTasks((prev) => prev.filter((_, i) => i !== taskToDeleteIndex));
        handleCloseDeleteDialog();
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        const newTask = createForm.buildTaskObject();

        if (isEditMode) {
            try {
                setIsLoadingTask(true);
                const { RulesExperiment, SelectedSurvey, selectedQuestionIds, ScoreThreshold, ScoreThresholdmx, ...taskToSend } = newTask;
                taskToSend.experiment_id = experimentId;

                const response = await api.post(`task`, taskToSend, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });

                newTask._id = response.data._id || response.data.id;
                setFeedback({ open: true, message: t('success_create') || "Tarefa criada!", severity: 'success' });
            } catch (error) {
                console.error("Erro ao criar tarefa:", error);
                setFeedback({ open: true, message: t('error') || "Erro ao criar.", severity: 'error' });
                setIsLoadingTask(false);
                return;
            } finally {
                setIsLoadingTask(false);
            }
        }

        setExperimentTasks((prev) => [...prev, newTask]);
        createForm.resetForm();
        toggleCreateTask();
    };

    const handleEditTask = async (index) => {
        setEditTaskIndex(index);
        let task = ExperimentTasks[index];

        if (isEditMode) {
            try {
                setIsLoadingTask(true);
                const taskId = task._id || task.id || task.uuid;
                const response = await api.get(`task/${taskId}`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });
                task = response.data;
            } catch (error) {
                console.error("Erro ao carregar tarefa:", error);
            } finally {
                setIsLoadingTask(false);
            }
        }

        const config = task.provider_config || {};
        const masked = task.provider_config_masked?.masked || config;

        editForm.setTaskTitle(task.title);
        editForm.setTaskSummary(task.summary);
        editForm.setTaskDescription(task.description);

        const ruleType = task.rule_type || task.RulesExperiment || "score";
        editForm.setRulesExperiment(ruleType);

        const minScore = task.min_score ?? task.ScoreThreshold ?? 0;
        const maxScore = task.max_score ?? task.ScoreThresholdmx ?? 0;
        editForm.setScoreThreshold(minScore);
        editForm.setScoreThresholdmx(maxScore);
        setscoreType(minScore !== maxScore ? "min_max" : "unic");

        let loadedQuestionIds = [];
        if (isEditMode && ruleType === "question") {
            try {
                const taskId = task._id || task.id || task.uuid;
                const questionsResponse = await api.get(`task-question-map/task/${taskId}`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });
                loadedQuestionIds = questionsResponse.data || [];
                editForm.setSelectedQuestionIds(loadedQuestionIds.map(id => ({ id })));
            } catch (error) {
                console.error("Erro mapa questoes", error);
            }
        } else if (!isEditMode) {
            const rawQuestions = task.questionsId || task.selectedQuestionIds || [];
            loadedQuestionIds = rawQuestions.map(q => typeof q === "string" ? q : q.id);
            editForm.setSelectedQuestionIds(loadedQuestionIds.map(id => ({ id })));
        } else {
            editForm.setSelectedQuestionIds([]);
        }

        const surveyRef = task.survey_id || task.SelectedSurvey || task.survey?._id || task.survey?.id || task.survey?.uuid;
        let surveyObj = null;
        if (surveyRef) {
            surveyObj = ExperimentSurveys?.find(s => s._id === surveyRef || s.uuid === surveyRef || s.id === surveyRef) || null;
        }
        if (!surveyObj && loadedQuestionIds.length > 0) {
            surveyObj = ExperimentSurveys?.find(s => s.questions?.some(q => loadedQuestionIds.includes(q._id || q.id || q.uuid))) || null;
        }
        editForm.setSelectedSurvey(surveyObj);

        editForm.setOrigin(task.search_source || "");

        if (task.search_source === "llm") {
            editForm.setLlmProvider(config.modelProvider || "");
            editForm.setLlm(config.model || "");
            editForm.setGeminiApiKey(masked.apiKey || config.apiKey || "");
        } else if (task.search_source === "search-engine") {
            editForm.setSearchEngine(config.searchProvider || "google");
            editForm.setGoogleApikey(masked.apiKey || config.apiKey || "");
            editForm.setGoogleCx(masked.cx || config.cx || "");
        }

        toggleEditTask();
    };

    const handleEditTaskSubmit = async (e) => {
        e.preventDefault();

        const updatedTask = editForm.buildTaskObject();
        const taskToUpdate = ExperimentTasks[editTaskIndex];

        updatedTask._id = taskToUpdate._id;
        updatedTask.id = taskToUpdate.id;
        updatedTask.uuid = taskToUpdate.uuid;

        if (isEditMode) {
            try {
                setIsLoadingTask(true);
                const taskId = taskToUpdate._id || taskToUpdate.id || taskToUpdate.uuid;

                const { RulesExperiment, SelectedSurvey, selectedQuestionIds, ScoreThreshold, ScoreThresholdmx, ...taskToSend } = updatedTask;

                await api.patch(`task/${taskId}`, taskToSend, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });
                setFeedback({ open: true, message: t('success_edit') || "Tarefa salva!", severity: 'success' });
            } catch (error) {
                console.error("Erro ao atualizar a tarefa:", error);
                setFeedback({ open: true, message: t('error') || "Erro ao salvar.", severity: 'error' });
                setIsLoadingTask(false);
                return;
            } finally {
                setIsLoadingTask(false);
            }
        }

        setExperimentTasks((prev) => {
            const updatedTasks = [...prev];
            updatedTasks[editTaskIndex] = updatedTask;
            return updatedTasks;
        });
        toggleEditTask();
    };

    const handleSurveyChangeGeneric = (event, isEdit) => {
        const newSurvey = event.target.value;
        if (isEdit) {
            editForm.setSelectedSurvey(newSurvey);
            editForm.setSelectedQuestionIds([]);
        } else {
            createForm.setSelectedSurvey(newSurvey);
            createForm.setSelectedQuestion(null);
        }
    };

    const handleQuestionChangeGeneric = (event, isEdit) => {
        const selectedIds = event.target.value;
        if (isEdit) {
            editForm.setSelectedQuestionIds(selectedIds);
        } else {
            createForm.setSelectedQuestionIds(selectedIds);
            const selectedQuestions = createForm.formState.SelectedSurvey.questions?.filter(q => selectedIds.includes(q.statement));
            createForm.setSelectedQuestion(selectedQuestions);
        }
    };

    const getFormConfig = (mode) => {
        const isEdit = mode === "edit";
        const form = isEdit ? editForm : createForm;

        return {
            mode,
            title: form.formState.taskTitle,
            setTitle: (e) => handleTextChange(e, form.setTaskTitle, form.setIsValidTitleTask),
            isTitleValid: form.formState.isValidTitleTask,
            summary: form.formState.taskSummary,
            setSummary: (e) => handleTextChange(e, form.setTaskSummary, form.setIsValidSumaryTask),
            isSummaryValid: form.formState.isValidSumaryTask,
            description: form.formState.taskDescription,
            setDescription: form.setTaskDescription,
            rulesExp: form.formState.RulesExperiment,
            setRulesExp: form.setRulesExperiment,
            survey: form.formState.SelectedSurvey,
            setSurvey: (e) => handleSurveyChangeGeneric(e, isEdit),
            questions: form.formState.selectedQuestionIds,
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
            isValidForm: form.formState.isValidTitleTask && form.formState.taskTitle && form.formState.isValidSumaryTask && form.formState.taskSummary,
        };
    };

    const filteredTasks = filterTasks(ExperimentTasks, searchTerm);
    const minimal_tasks = ExperimentType === 'between-subject' ? 2 : 1;
    const canGoNext = ExperimentTasks.length >= minimal_tasks;

    return (
        <Box>
            <Box sx={{ alignItems: "center", justifyContent: "center", marginTop: 5, display: "flex", flexDirection: "column" }}>
                <Box sx={{ padding: 3, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: "8px", boxShadow: 4, width: {xs: "100%", sm: "60%"}, marginX: "auto" }}>

                    {isLoadingTask ? (
                        <CircularProgress/>
                    ) : Array.isArray(ExperimentTasks) && ExperimentTasks.length > 0 ? (
                        <TaskList
                            tasks={filteredTasks}
                            searchTerm={searchTerm}
                            onSearchChange={(e) => setSearchTerm(e.target.value)}
                            openTaskIds={openTaskIds}
                            onToggleDescription={toggleTaskDescription}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleOpenDeleteDialog}
                            t={t}
                        />
                    ) : (
                        <NotFound title={t("NTaskFound")} subTitle={t("NoTaskcreated")}/>
                    )}

                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: isEditMode ? 'flex-end' : 'space-between', mt: 4, width: '100%' }}>
                        {!isEditMode && <Button variant="contained" onClick={handleBack} sx={{ maxWidth: 150 }}>{t('back')}</Button>}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" onClick={toggleCreateTask}>{t('create_task')}</Button>
                            {!isEditMode && <Button variant="contained" onClick={handleNext} disabled={!canGoNext}>{t('next')}</Button>}
                        </Box>
                    </Box>

                    {!canGoNext && !isEditMode && (
                        <Typography variant="caption" sx={{ color: 'error.main', mt: 1, fontWeight: 'bold' }}>
                            {ExperimentType === 'between-subject' ? t('needs_at_least_2_tasks') : t('needs_at_least_1_task')}
                        </Typography>
                    )}

                    <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: isEditMode ? 'center' : 'space-between', mt: 4, width: '100%' }}>
                        {!isEditMode && <Button variant="contained" onClick={handleBack}><ArrowBack /></Button>}
                        <Button variant="contained" onClick={toggleCreateTask}>{t('create_task')}</Button>
                        {!isEditMode && <Button variant="contained" onClick={handleNext} disabled={!canGoNext}><ArrowForward /></Button>}
                    </Box>
                </Box>
            </Box>

            <DeleteConfirmDialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog} onConfirm={handleDeleteTask} t={t} />

            <TaskDialog
                open={isEditTaskOpen} onClose={toggleEditTask} mode="edit" config={getFormConfig("edit")}
                onSubmit={handleEditTaskSubmit} isLoading={isLoadingTask} experimentType={ExperimentType}
                btypeExperiment={BtypeExperiment} experimentSurveys={ExperimentSurveys} scoreType={scoreType}
                setScoreType={setscoreType} t={t}
            />

            <TaskDialog
                open={isCreateTaskOpen} onClose={toggleCreateTask} mode="create" config={getFormConfig("create")}
                onSubmit={handleCreateTask} isLoading={isLoadingTask} experimentType={ExperimentType}
                btypeExperiment={BtypeExperiment} experimentSurveys={ExperimentSurveys} scoreType={scoreType}
                setScoreType={setscoreType} t={t}
            />

            <Snackbar open={feedback.open} autoHideDuration={4000} onClose={handleCloseFeedback} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
                    {feedback.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateExperimentTask;