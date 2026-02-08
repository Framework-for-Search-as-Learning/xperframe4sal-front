/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState, useContext } from 'react';
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
} from '@mui/material';

import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import StepContext from './context/StepContextCreate';
import 'react-quill/dist/quill.snow.css';
import EmojiObjectsOutlined from '@mui/icons-material/EmojiObjectsOutlined';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack, ArrowForward } from '@mui/icons-material';
import NotFound from '../../../components/NotFound';

const CustomContainer = styled('div')(({ theme }) => ({
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    padding: '0px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    '& .ql-toolbar': {
        backgroundColor: '#f5f5f5',
        borderRadius: '8px 8px 0 0',
    },
    '& .ql-container': {
        minHeight: '200px',
        borderRadius: '0 0 8px 8px',
    },
    '& .ql-editor': {
        fontFamily: theme.typography.fontFamily,
        lineHeight: 1.6,
        color: '#444',
    },
}));
const CreateExperimentTask = () => {
    const { step,
        setStep,
        ExperimentTasks,
        setExperimentTasks,
        ExperimentType,
        BtypeExperiment,
        ExperimentSurveys,
    } = useContext(StepContext);
    const { t } = useTranslation();

    const [ScoreThresholdmx, setScoreThresholdmx] = useState('0');
    const [RulesExperiment, setRulesExperiment] = useState('score');
    const [ScoreThreshold, setScoreThreshold] = useState('');
    const [isLoadingTask, setIsLoadingTask] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openTaskIds, setOpenTaskIds] = useState([]);
    const [SelectedSurvey, setSelectedSurvey] = useState([]);

    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskSummary, setTaskSummary] = useState("");
    const [origin, setOrigin] = useState('');
    const [llm, setLlm] = useState('gemini');
    const [searchEngine, setSearchEngine] = useState('google')
    const [taskDescription, setTaskDescription] = useState("");

    const [editTaskIndex, setEditTaskIndex] = useState(null);
    const [taskTitleEdit, setTaskTitleEdit] = useState("");
    const [taskSummaryEdit, setTaskSummaryEdit] = useState("");
    const [taskDescriptionEdit, setTaskDescriptionEdit] = useState("");
    const [RulesExperimentEdit, setRulesExperimentEdit] = useState("");
    const [SelectedSurveyEdit, setSelectedSurveyEdit] = useState("");
    const [ScoreThresholdmxEdit, setScoreThresholdmxEdit] = useState('');
    const [ScoreThresholdEdit, setScoreThresholdEdit] = useState('');
    const [isValidTitleTask, setIsValidTitleTask] = React.useState(true);
    const [isValidSumaryTask, setIsValidSumaryTask] = React.useState(true);

    const [isValidTitleTaskEdit, setIsValidTitleTaskEdit] = React.useState(true);
    const [isValidSumaryTaskEdit, setIsValidSumaryTaskEdit] = React.useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taskToDeleteIndex, setTaskToDeleteIndex] = useState(null);

    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [selectedQuestionIdsEdit, setSelectedQuestionIdsEdit] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [scoreType, setscoreType] = useState('');

    const handleSurveyChange = (event) => {
        const newSurvey = event.target.value;
        setSelectedSurvey(newSurvey);
        setSelectedQuestion(null);
    };
    const handleQuestionChange = (event) => {
        const selectedIds = event.target.value;
        setSelectedQuestionIds(selectedIds);
        const selectedQuestions = SelectedSurvey.questions.filter(q => selectedIds.includes(q.statement));
        setSelectedQuestion(selectedQuestions);
    };

    const handleSurveyChangeEdit = (event) => {
        const newSurvey = event.target.value;
        setSelectedSurveyEdit(newSurvey);
        setSelectedQuestionIdsEdit([]);
    };
    
    const handleQuestionChangeEdit = (event) => {
        const selectedQuestions = event.target.value;
        setSelectedQuestionIdsEdit(selectedQuestions);
    };

    const scoreTypes = [
        { value: 'unic', label: t('unic') },
        { value: 'min_max', label: t('min_max') }
    ];

    const LlmTypes = [
        { value: 'gemini', label: 'Gemini (Google)' },
        //{ value: 'chat-gpt', label: 'ChatGPT (OpenAI)' },
        //{ value: 'deepseek', label: 'DeepSeek (DeepSeek AI)' },
    ];
    const SearchEngines = [
        { value: 'google', label: 'Google' },
        //{ value: 'bing', label: 'Bing' },
        //{ value: 'duckduckgo', label: 'DuckDuckGo' },
    ];


    const handleOpenDeleteDialog = (index) => {
        setTaskToDeleteIndex(index);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTaskToDeleteIndex(null);
    };

    const handleDeleteTask = () => {
        setExperimentTasks((prev) => prev.filter((_, i) => i !== taskToDeleteIndex));
        handleCloseDeleteDialog();
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

    const handleNameChangeTitleTaskEdit = (e) => {
        const value = e.target.value;
        setTaskTitleEdit(value);
        setIsValidTitleTaskEdit(value.trim().length > 0);
    };

    const handleNameChangeSummaryTaskEdit = (e) => {
        const value = e.target.value;
        setTaskSummaryEdit(value);
        setIsValidSumaryTaskEdit(value.trim().length > 0);
    };

    const RulesExperimentTypes = [
        { value: 'score', label: t('score') },
        { value: 'question', label: t('question') },
    ];


    const isValidFormTask = isValidTitleTask && taskTitle && isValidSumaryTask && taskSummary;
    const isValidFormTaskEdit = isValidTitleTaskEdit && taskTitleEdit && isValidSumaryTaskEdit && taskSummaryEdit;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleCancelEditTask = () => {
        setTaskTitleEdit('');
        setTaskSummaryEdit('');
        setTaskDescriptionEdit('');
        setIsValidTitleTaskEdit(true);
        setIsValidSumaryTaskEdit(true);
        toggleEditTask();
    };
    const handleCancelTask = () => {
        setTaskTitle('');
        setTaskSummary('');
        setTaskDescription('');
        setIsValidTitleTask(true);
        setIsValidSumaryTask(true);
        toggleCreateTask();
    };

    const toggleCreateTask = () => setIsCreateTaskOpen((prev) => !prev);
    const toggleEditTask = () => setIsEditTaskOpen((prev) => !prev);

    const toggleTaskDescription = (index) => {
        setOpenTaskIds((prev) =>
            prev.includes(index) ? prev.filter((id) => id !== index) : [...prev, index]
        );
    };

    const handleCreateTask = (e) => {
        e.preventDefault();

        const questionIds = RulesExperiment === 'score'
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
            search_model: (origin == 'llm' ? llm : searchEngine)
        };

        setExperimentTasks((prev) => [...prev, newTask]);
        toggleCreateTask();
        setTaskTitle("");
        setTaskSummary("");
        setTaskDescription("");
        setScoreThreshold("");
        setScoreThresholdmx("");
    };

    const handleEditTaskSubmit = (e) => {
        e.preventDefault();

        const questionIds = RulesExperimentEdit === 'score'
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
            search_model: (origin == 'llm' ? llm : searchEngine)
        };
        setExperimentTasks((prev) => {
            const updatedTasks = [...prev];
            updatedTasks[editTaskIndex] = updatedTask;
            return updatedTasks;
        });
        toggleEditTask();
    };

    const handleEditTask = (index) => {
        setEditTaskIndex(index);
        const task = ExperimentTasks[index];
        setTaskTitleEdit(task.title);
        setTaskSummaryEdit(task.summary);
        setTaskDescriptionEdit(task.description);
        setRulesExperimentEdit(task.RulesExperiment);

        const selectedSurveyObj = ExperimentSurveys.find(survey => survey.uuid === task.SelectedSurvey);
        setSelectedSurveyEdit(selectedSurveyObj);

        const selectedQuestionIdsObj = selectedSurveyObj?.questions?.filter(quest =>
            Array.isArray(task?.selectedQuestionIds) && task.selectedQuestionIds.includes(quest.id)
        ) || [];

        setSelectedQuestionIdsEdit(selectedQuestionIdsObj);
        setScoreThresholdmxEdit(task.ScoreThresholdmx);
        setScoreThresholdEdit(task.ScoreThreshold);
        
        setOrigin(task.search_source || '');
        if (task.search_source === 'llm') {
           setLlm(task.search_model || 'gemini');
        } else if (task.search_source === 'search-engine') {
           setSearchEngine(task.search_model || 'google');
        }
        
        toggleEditTask();
    };


    return (
        <Box>
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
                        width: { xs: '95%', sm: '60%' },
                        marginX: 'auto'
                    }}
                >

                    {isLoadingTask ? (
                        <CircularProgress />
                    ) : Array.isArray(ExperimentTasks) && ExperimentTasks.length > 0 ? (
                        <FormControl fullWidth>
                            <Box
                                sx={{
                                    minHeight: 300, maxHeight: 300,
                                    overflowY: 'auto'
                                }}
                            >
                                {Array.isArray(ExperimentTasks) &&
                                    ExperimentTasks.filter((task) =>
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
                                                        {openTaskIds.includes(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {openTaskIds.includes(index) && (
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

                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'space-between', marginTop: 'auto', width: '100%', mt: 2 }}>
                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBack}
                                sx={{ maxWidth: 150, fontWeight: 'bold', boxShadow: 2 }}
                            >
                                {t('back')}
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ marginRight: 2 }}>
                                <Button variant="contained" color="primary" onClick={toggleCreateTask}>
                                    {isCreateTaskOpen ? t('cancel') : t('create_task')}
                                </Button>
                            </Box>
                            <Box>
                                <Button variant="contained" color="primary" onClick={handleNext} sx={{ maxWidth: '120px' }}>
                                    {t('next')}
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'space-between', mt: 2, width: '100%' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleBack}
                            sx={{ maxWidth: 150, fontWeight: 'bold', boxShadow: 2 }}
                        >
                            <ArrowBack />
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={toggleCreateTask}
                            sx={{ maxWidth: '170px' }}
                        >
                            {isCreateTaskOpen ? t('cancel') : t('create_task')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            sx={{ maxWidth: 150, fontWeight: 'bold', boxShadow: 2 }}
                        >
                            <ArrowForward />
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
                    '& .MuiDialog-paper': {
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        boxShadow: 5,
                        padding: 4,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: '#111827',
                        textAlign: 'center',
                        paddingBottom: '8px',
                    }}
                >
                    {t('confirm_delete')}
                </DialogTitle>
                <DialogContent
                    sx={{
                        textAlign: 'center',
                        color: '#6b7280',
                    }}
                >
                    <Box sx={{ marginBottom: 3 }}>
                        <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.5 }}>
                            {t('delete_confirmation_message')}
                        </p>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCloseDeleteDialog}
                            sx={{
                                borderColor: '#d1d5db',
                                color: '#374151',
                                ':hover': {
                                    backgroundColor: '#f3f4f6',
                                },
                            }}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteTask}
                            sx={{
                                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {t('delete')}
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
                    '& .MuiDialog-paper': {
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: 3,
                        padding: 4,
                    },
                }}
            >
                <DialogTitle>{t('task_edit')}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleEditTaskSubmit}>
                        <TextField
                            label={t('task_title')}
                            error={!isValidTitleTaskEdit}
                            helperText={!isValidTitleTaskEdit ? t('invalid_name_message') : ''}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={taskTitleEdit}
                            onChange={handleNameChangeTitleTaskEdit}
                            required
                        />
                        <Grid container spacing={2} alignItems="center">
                            {/* Select origem: LLM ou motor de busca */}
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="origin-label">{t('select_source')}</InputLabel>
                                    <Select
                                        labelId="origin-label"
                                        value={origin}
                                        onChange={(e) => {
                                            setOrigin(e.target.value);
                                        }}
                                        label={t('select_source')}
                                    >
                                        <MenuItem value="llm">Large Language Model</MenuItem>
                                        <MenuItem value="search-engine">{t('search_engine')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Se escolher LLM, mostrar select dos modelos */}
                            {origin === 'llm' && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="llm-select-label">{t('select_llm')}</InputLabel>
                                        <Select
                                            labelId="llm-select-label"
                                            value={llm}
                                            onChange={(e) => setLlm(e.target.value)}
                                            label={t('select_llm')}
                                        >
                                            {LlmTypes.map((type) => (
                                                <MenuItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </MenuItem>
                                            ))}
                                            <optgroup label={t('more_soon')} ></optgroup>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Se escolher motor de busca, mostrar select dos motores */}
                            {origin === 'search-engine' && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="search-engine-label">{t('select_search_engine')}</InputLabel>
                                        <Select
                                            labelId="search-engine-label"
                                            value={searchEngine}
                                            onChange={(e) => setSearchEngine(e.target.value)}
                                            label={t('select_search_engine')}
                                        >
                                            {SearchEngines.map((engine) => (
                                                <MenuItem key={engine.value} value={engine.value}>
                                                    {engine.label}
                                                </MenuItem>
                                            ))}
                                            <optgroup label={t('more_soon')} ></optgroup>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>


                        {ExperimentType === 'between-subject' && BtypeExperiment === 'rules_based' && (
                            <>
                                {RulesExperimentEdit === 'score' && (
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t('Separation_rule')}</InputLabel>
                                                <Select
                                                    value={RulesExperimentEdit}
                                                    onChange={(e) => setRulesExperimentEdit(e.target.value)}
                                                    label={t('Separation_rule')}
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
                                                <InputLabel>{t('select_survey')}</InputLabel>
                                                <Select
                                                    value={SelectedSurveyEdit}
                                                    onChange={handleSurveyChange}
                                                    label={t('select_survey')}
                                                >
                                                    {ExperimentSurveys?.length > 0 ? (
                                                        ExperimentSurveys.map((survey) => (
                                                            <MenuItem key={survey.id} value={survey}>
                                                                {survey.title}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem disabled>{t('no_survey_available')}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t('select_survey_th')}</InputLabel>
                                                <Select
                                                    value={scoreType}
                                                    onChange={(e) => setscoreType(e.target.value)}
                                                    label={t('select_survey_th')}
                                                >
                                                    {scoreTypes.map((stype) => (
                                                        <MenuItem key={stype.value} value={stype.value}>
                                                            {stype.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {scoreType === 'unic' ? (
                                            <Grid item xs={2}>
                                                <TextField
                                                    fullWidth
                                                    margin="normal"
                                                    type="number"
                                                    label={t('score_Threshold_unic')}
                                                    value={ScoreThresholdEdit}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        setScoreThresholdEdit(value);
                                                        setScoreThresholdmxEdit(value);
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
                                                        label={t('score_Threshold_min')}
                                                        value={ScoreThresholdEdit}
                                                        onChange={(e) => {
                                                            const minValue = Number(e.target.value);
                                                            if (minValue <= ScoreThresholdmxEdit) {
                                                                setScoreThresholdEdit(minValue);
                                                            }
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={4}>
                                                    <TextField
                                                        fullWidth
                                                        margin="normal"
                                                        type="number"
                                                        label={t('score_Threshold_max')}
                                                        value={ScoreThresholdmxEdit}
                                                        onChange={(e) => {
                                                            const maxValue = Number(e.target.value);
                                                            if (maxValue >= ScoreThresholdEdit) {
                                                                setScoreThresholdmxEdit(maxValue);
                                                            }
                                                        }}
                                                        inputProps={{ min: ScoreThresholdEdit }}
                                                    />
                                                </Grid>
                                            </>
                                        )}

                                    </Grid>
                                )}

                                {RulesExperimentEdit === 'question' && (
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t('Separation_rule')}</InputLabel>
                                                <Select
                                                    value={RulesExperimentEdit}
                                                    onChange={(e) => setRulesExperimentEdit(e.target.value)}
                                                    label={t('Separation_rule')}
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
                                                <InputLabel>{t('select_survey')}</InputLabel>
                                                <Select
                                                    value={SelectedSurveyEdit}
                                                    onChange={handleSurveyChangeEdit}
                                                    label={t('select_survey')}
                                                >
                                                    {ExperimentSurveys?.length > 0 ? (
                                                        ExperimentSurveys.map((survey) => (
                                                            <MenuItem key={survey.id} value={survey}>
                                                                {survey.title}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem disabled>{t('no_survey_available')}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t('select_question')}</InputLabel>
                                                <Select
                                                    value={selectedQuestionIdsEdit}
                                                    onChange={handleQuestionChangeEdit}
                                                    label={t('select_question')}
                                                    multiple
                                                    renderValue={(selected) =>
                                                        SelectedSurveyEdit?.questions
                                                            .filter(q => selected.includes(q))
                                                            .map(q => q.statement || 'Sem enunciado')
                                                            .join(', ')
                                                    }
                                                >
                                                    {SelectedSurveyEdit?.questions && SelectedSurveyEdit.questions.length > 0 ? (
                                                        SelectedSurveyEdit.questions
                                                            .filter(q => (q.type === 'multiple-selection' || q.type === 'multiple-choices') && q.hasscore)
                                                            .map((question) => (
                                                                <MenuItem key={question.id} value={question}>
                                                                    <Checkbox checked={selectedQuestionIdsEdit.includes(question)} />
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
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t('select_survey_th')}</InputLabel>
                                                <Select
                                                    value={scoreType}
                                                    onChange={(e) => setscoreType(e.target.value)}
                                                    label={t('select_survey_th')}
                                                >
                                                    {scoreTypes.map((stype) => (
                                                        <MenuItem key={stype.value} value={stype.value}>
                                                            {stype.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {scoreType === 'unic' ? (
                                            <Grid item xs={2}>
                                                <TextField
                                                    fullWidth
                                                    margin="normal"
                                                    type="number"
                                                    label={t('score_Threshold_unic')}
                                                    value={ScoreThresholdEdit}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        setScoreThresholdEdit(value);
                                                        setScoreThresholdmxEdit(value);
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
                                                        label={t('score_Threshold_min')}
                                                        value={ScoreThresholdEdit}
                                                        onChange={(e) => {
                                                            const minValue = Number(e.target.value);
                                                            if (minValue <= ScoreThresholdmxEdit) {
                                                                setScoreThresholdEdit(minValue);
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <TextField
                                                        fullWidth
                                                        margin="normal"
                                                        type="number"
                                                        label={t('score_Threshold_max')}
                                                        value={ScoreThresholdmxEdit}
                                                        onChange={(e) => {
                                                            const maxValue = Number(e.target.value);
                                                            if (maxValue >= ScoreThresholdEdit) {
                                                                setScoreThresholdmxEdit(maxValue);
                                                            }
                                                        }}
                                                        inputProps={{ min: ScoreThresholdEdit }}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                )}


                            </>
                        )}
                        <TextField
                            label={t('task_summary')}
                            error={!isValidSumaryTaskEdit}
                            helperText={!isValidSumaryTaskEdit ? t('invalid_name_message') : ''}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            value={taskSummaryEdit}
                            onChange={handleNameChangeSummaryTaskEdit}
                            required
                        />
                        <div style={{ width: '100%', marginTop: '16.5px', marginBottom: '16px' }}>
                            <CustomContainer>
                                <ReactQuill
                                    value={taskDescriptionEdit}
                                    onChange={(content) => setTaskDescriptionEdit(content)}
                                    placeholder={t('task_Desc1')}
                                />
                            </CustomContainer>
                        </div>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', width: '100%', mt: 2 }}>
                            <Button variant="contained" onClick={handleCancelEditTask} color="primary">
                                {t('cancel')}
                            </Button>
                            <Button variant="contained" color="primary" type="submit" disabled={!isValidFormTaskEdit || isLoadingTask}>
                                {t('save')}
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
                    '& .MuiDialog-paper': {
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: 3,
                        padding: 4
                    }
                }}
            >
                <DialogTitle>{t('task_creation')}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleCreateTask}>
                        <TextField
                            label={t('task_title')}
                            error={!isValidTitleTask}
                            helperText={!isValidTitleTask ? t('invalid_name_message') : ''}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={taskTitle}
                            onChange={handleNameChangeTitleTask}
                            required
                        />
                        <Grid container spacing={2} alignItems="center">
                            {/* Select origem: LLM ou motor de busca */}
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="origin-label">{t('select_source')}</InputLabel>
                                    <Select
                                        labelId="origin-label"
                                        value={origin}
                                        onChange={(e) => {
                                            setOrigin(e.target.value);
                                        }}
                                        label={t('select_source')}
                                    >
                                        <MenuItem value="llm">Large Language Model</MenuItem>
                                        <MenuItem value="search-engine">{t('search_engine')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Se escolher LLM, mostrar select dos modelos */}
                            {origin === 'llm' && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="llm-select-label">{t('select_llm')}</InputLabel>
                                        <Select
                                            labelId="llm-select-label"
                                            value={llm}
                                            onChange={(e) => setLlm(e.target.value)}
                                            label={t('select_llm')}
                                        >
                                            {LlmTypes.map((type) => (
                                                <MenuItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </MenuItem>
                                            ))}
                                            <optgroup label={t('more_soon')} ></optgroup>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Se escolher motor de busca, mostrar select dos motores */}
                            {origin === 'search-engine' && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="search-engine-label">{t('select_search_engine')}</InputLabel>
                                        <Select
                                            labelId="search-engine-label"
                                            value={searchEngine}
                                            onChange={(e) => setSearchEngine(e.target.value)}
                                            label={t('select_search_engine')}
                                        >
                                            {SearchEngines.map((engine) => (
                                                <MenuItem key={engine.value} value={engine.value}>
                                                    {engine.label}
                                                </MenuItem>
                                            ))}
                                            <optgroup label={t('more_soon')} ></optgroup>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>

                        {ExperimentType === 'between-subject' && BtypeExperiment === 'rules_based' && (
                            <>
                                {RulesExperiment === 'score' && (
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t('Separation_rule')}</InputLabel>
                                                <Select
                                                    value={RulesExperiment}
                                                    onChange={(e) => setRulesExperiment(e.target.value)}
                                                    label={t('Separation_rule')}
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
                                                <InputLabel>{t('select_survey')}</InputLabel>
                                                <Select
                                                    value={SelectedSurvey}
                                                    onChange={handleSurveyChange}
                                                    label={t('select_survey')}
                                                >
                                                    {ExperimentSurveys?.length > 0 ? (
                                                        ExperimentSurveys.map((survey) => (
                                                            <MenuItem key={survey.id} value={survey}>
                                                                {survey.title}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem disabled>{t('no_survey_available')}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t('select_survey_th')}</InputLabel>
                                                <Select
                                                    value={scoreType}
                                                    onChange={(e) => setscoreType(e.target.value)}
                                                    label={t('select_survey_th')}
                                                >
                                                    {scoreTypes.map((stype) => (
                                                        <MenuItem key={stype.value} value={stype.value}>
                                                            {stype.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {scoreType === 'unic' ? (
                                            <Grid item xs={2}>
                                                <TextField
                                                    fullWidth
                                                    margin="normal"
                                                    type="number"
                                                    label={t('score_Threshold_unic')}
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
                                                        label={t('score_Threshold_min')}
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
                                                        label={t('score_Threshold_max')}
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

                                {RulesExperiment === 'question' && (
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={4}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t('Separation_rule')}</InputLabel>
                                                <Select
                                                    value={RulesExperiment}
                                                    onChange={(e) => setRulesExperiment(e.target.value)}
                                                    label={t('Separation_rule')}
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
                                                <InputLabel>{t('select_survey')}</InputLabel>
                                                <Select
                                                    value={SelectedSurvey}
                                                    onChange={handleSurveyChange}
                                                    label={t('select_survey')}
                                                >
                                                    {ExperimentSurveys?.length > 0 ? (
                                                        ExperimentSurveys.map((survey) => (
                                                            <MenuItem key={survey.id} value={survey}>
                                                                {survey.title}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem disabled>{t('no_survey_available')}</MenuItem>
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
                                                            .filter(q => selected.includes(q))
                                                            .map(q => q.statement || 'Sem enunciado')
                                                            .join(', ')
                                                    }
                                                >
                                                    {SelectedSurvey?.questions && SelectedSurvey.questions.length > 0 ? (
                                                        SelectedSurvey.questions
                                                            .filter(q => (q.type === 'multiple-selection' || q.type === 'multiple-choices') && q.hasscore)
                                                            .map((question) => (
                                                                <MenuItem key={question.id} value={question}>
                                                                    <Checkbox checked={selectedQuestionIds.includes(question)} />
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
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{t('select_survey_th')}</InputLabel>
                                                <Select
                                                    value={scoreType}
                                                    onChange={(e) => setscoreType(e.target.value)}
                                                    label={t('select_survey_th')}
                                                >
                                                    {scoreTypes.map((stype) => (
                                                        <MenuItem key={stype.value} value={stype.value}>
                                                            {stype.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {scoreType === 'unic' ? (
                                            <Grid item xs={2}>
                                                <TextField
                                                    fullWidth
                                                    margin="normal"
                                                    type="number"
                                                    label={t('score_Threshold_unic')}
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
                                                        label={t('score_Threshold_min')}
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
                                                        label={t('score_Threshold_max')}
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

                        <TextField
                            label={t('task_summary')}
                            error={!isValidSumaryTask}
                            helperText={!isValidSumaryTask ? t('invalid_name_message') : ''}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            value={taskSummary}
                            onChange={handleNameChangeSumaryTask}
                            required
                        />

                        <div style={{ width: '100%', marginTop: '16.5px', marginBottom: '16px' }}>
                            <CustomContainer>
                                <ReactQuill
                                    value={taskDescription}
                                    onChange={(content) => setTaskDescription(content)}
                                    placeholder={t('task_Desc1')}
                                />
                            </CustomContainer>
                        </div>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', width: '100%', mt: 2 }}>
                            <Button variant="contained" onClick={handleCancelTask} color="primary">
                                {t('cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                onClick={handleCreateTask}
                                disabled={!isValidFormTask || isLoadingTask}
                            >
                                {t('create')}
                            </Button>
                        </Box>
                    </form>
                </DialogContent>
            </Dialog>
        </Box>
    );
};
export default CreateExperimentTask;
