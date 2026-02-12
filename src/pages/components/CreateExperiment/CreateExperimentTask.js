import React, {useState, useContext} from "react";
import {Box, CircularProgress} from "@mui/material";
import {useTranslation} from "react-i18next";
import StepContext from "./context/StepContextCreate";
import NotFound from "../../../components/NotFound";

import TaskList from "./components/TaskList";
import TaskDialog from "./components/TaskDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import NavigationButtons from "./components/NavigationButtons";

import {useTaskForm} from "./hooks/useTaskForm";
import {handleTextChange, filterTasks} from "./utils/formHelpers";

/**
 * CreateExperimentTask - Refactored Component
 * Main component for creating and managing experiment tasks
 */
const CreateExperimentTask = () => {
    const {t} = useTranslation();

    const {
        step,
        setStep,
        ExperimentTasks,
        setExperimentTasks,
        ExperimentType,
        BtypeExperiment,
        ExperimentSurveys,
    } = useContext(StepContext);

    const [isLoadingTask, setIsLoadingTask] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openTaskIds, setOpenTaskIds] = useState([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taskToDeleteIndex, setTaskToDeleteIndex] = useState(null);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [editTaskIndex, setEditTaskIndex] = useState(null);

    const [scoreType, setscoreType] = useState("");

    const createForm = useTaskForm("create");
    const editForm = useTaskForm("edit");

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

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

    const toggleTaskDescription = (index) => {
        setOpenTaskIds((prev) =>
            prev.includes(index)
                ? prev.filter((id) => id !== index)
                : [...prev, index]
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

    const handleDeleteTask = () => {
        setExperimentTasks((prev) =>
            prev.filter((_, i) => i !== taskToDeleteIndex)
        );
        handleCloseDeleteDialog();
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
            const selectedQuestions = createForm.formState.SelectedSurvey.questions?.filter(
                (q) => selectedIds.includes(q.statement)
            );
            createForm.setSelectedQuestion(selectedQuestions);
        }
    };

    const handleCreateTask = (e) => {
        e.preventDefault();
        const newTask = createForm.buildTaskObject();
        setExperimentTasks((prev) => [...prev, newTask]);
        createForm.resetForm();
        toggleCreateTask();
    };

    const handleEditTask = (index) => {
        setEditTaskIndex(index);
        const task = ExperimentTasks[index];
        const config = task.provider_config || {};

        editForm.setTaskTitle(task.title);
        editForm.setTaskSummary(task.summary);
        editForm.setTaskDescription(task.description);
        editForm.setRulesExperiment(task.RulesExperiment);
        editForm.setScoreThresholdmx(task.ScoreThresholdmx);
        editForm.setScoreThreshold(task.ScoreThreshold);

        editForm.setGeminiApiKey(config.apiKey || "");
        editForm.setGoogleApikey(config.apiKey || "");
        editForm.setGoogleCx(config.cx || "");

        const selectedSurveyObj = ExperimentSurveys.find(
            (survey) => survey.uuid === task.SelectedSurvey
        );
        editForm.setSelectedSurvey(selectedSurveyObj);

        const selectedQuestionIdsObj =
            selectedSurveyObj?.questions?.filter(
                (quest) =>
                    Array.isArray(task?.selectedQuestionIds) &&
                    task.selectedQuestionIds.includes(quest.id)
            ) || [];
        editForm.setSelectedQuestionIds(selectedQuestionIdsObj);

        editForm.setOrigin(task.search_source || "");

        if (task.search_source === "llm") {
            editForm.setLlmProvider(config.modelProvider || "");
            editForm.setLlm(config.model || "gemini");
        } else if (task.search_source === "search-engine") {
            editForm.setSearchEngine(config.searchProvider || "google");
        }

        const currentScoreType =
            task.ScoreThreshold !== "" && task.ScoreThresholdmx !== "0"
                ? "min_max"
                : "unic";
        setscoreType(currentScoreType);

        toggleEditTask();
    };

    const handleEditTaskSubmit = (e) => {
        e.preventDefault();
        const updatedTask = editForm.buildTaskObject();

        setExperimentTasks((prev) => {
            const updatedTasks = [...prev];
            updatedTasks[editTaskIndex] = updatedTask;
            return updatedTasks;
        });
        toggleEditTask();
    };

    // --- FORM CONFIGURATION ---
    const getFormConfig = (mode) => {
        const isEdit = mode === "edit";
        const form = isEdit ? editForm : createForm;

        return {
            mode,
            title: form.formState.taskTitle,
            setTitle: (e) =>
                handleTextChange(e, form.setTaskTitle, form.setIsValidTitleTask),
            isTitleValid: form.formState.isValidTitleTask,

            summary: form.formState.taskSummary,
            setSummary: (e) =>
                handleTextChange(e, form.setTaskSummary, form.setIsValidSumaryTask),
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

            isValidForm:
                form.formState.isValidTitleTask &&
                form.formState.taskTitle &&
                form.formState.isValidSumaryTask &&
                form.formState.taskSummary,
        };
    };

    const filteredTasks = filterTasks(ExperimentTasks, searchTerm);

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

                    {/* Navigation Buttons (Desktop) */}
                    <NavigationButtons
                        onBack={handleBack}
                        onNext={handleNext}
                        onToggleCreate={toggleCreateTask}
                        isCreateOpen={isCreateTaskOpen}
                        t={t}
                        isMobile={false}
                    />

                    {/* Navigation Buttons (Mobile) */}
                    <NavigationButtons
                        onBack={handleBack}
                        onNext={handleNext}
                        onToggleCreate={toggleCreateTask}
                        isCreateOpen={isCreateTaskOpen}
                        t={t}
                        isMobile={true}
                    />
                </Box>
            </Box>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleDeleteTask}
                t={t}
            />

            {/* Edit Task Dialog */}
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

            {/* Create Task Dialog */}
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

export default CreateExperimentTask;