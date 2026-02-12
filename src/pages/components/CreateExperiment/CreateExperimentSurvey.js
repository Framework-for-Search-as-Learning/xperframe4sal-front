/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import { useState, useContext } from 'react';
import 'react-quill/dist/quill.snow.css';
import { v4 as uuidv4 } from 'uuid';
import StepContext from './context/StepContextCreate';
import {
    TextField,
    Button,
    Typography,
    Box,
    ListItemText,
    DialogTitle,
    FormControl,
    Snackbar,
    Alert,
    CircularProgress,
    IconButton,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    Dialog,
    DialogContent,
    FormControlLabel,
    Switch,
    Menu,
} from '@mui/material';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTranslation } from 'react-i18next';
import { Add, ArrowBack, ArrowForward, Cancel, CancelOutlined, Done } from '@mui/icons-material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import EmojiObjectsOutlined from '@mui/icons-material/EmojiObjectsOutlined';
import CreateSurvey from '../../../components/Modals/CreateSurvey';
import NotFound from '../../../components/NotFound';

const CreateExperimentSurvey = () => {
    const {
        step,
        setStep,
        ExperimentSurveys,
        setExperimentSurveys,
    } = useContext(StepContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateQuestOpen, setIsCreateQuestOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('pre');
    const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openSurveyIds, setOpenSurveyIds] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [isValidTitleSurvey, setIsValidTitleSurvey] = useState(true);
    const [isValidDescSurvey, setIsValidDescSurvey] = useState(true);
    const isValidFormSurvey = isValidTitleSurvey && title && isValidDescSurvey && description;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [SurveyToDeleteIndex, setSurveyToDeleteIndex] = useState(null);
    const [editedSurvey, setEditedSurvey] = useState(null);
    const [IndexId, setIndexId] = useState(null);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedOptId, setSelectedOptId] = useState(null);

    const handleMenuOpen = (event, optId) => {
        setAnchorEl(event.currentTarget);
        setSelectedOptId(optId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedOptId(null);
    };
    const handleOpenDeleteDialog = (index) => {
        setSurveyToDeleteIndex(index);
        setIsDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setSurveyToDeleteIndex(null);
    };
    const handleDeleteSurvey = () => {
        setExperimentSurveys((prev) => prev.filter((_, i) => i !== SurveyToDeleteIndex));
        handleCloseDeleteDialog();
    };

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleCreateSurvey = async (e) => {
        e.preventDefault();
        const payload = {
            name: title,
            title,
            uuid: uuidv4(),
            description,
            type,
            questions: questions.map((q) => {
                const question = {
                    statement: q.statement,
                    id: q.id,
                    type: q.type,
                    required: q.required,
                    uniqueAnswer: q.uniqueAnswer,
                    hasscore: q.hasscore,
                };
                if (q.type === 'open') {
                    question.options = [];
                } else {
                    question.options = q.options.map((opt) => {
                        const option = { statement: opt.statement, id: opt.id };

                        if (opt.subquestion) {
                            option.subquestion = { ...opt.subquestion };
                            option.hassub = true;
                        } else {
                            option.hassub = false;
                        }


                        option.score = opt.score;


                        return option;
                    });

                }
                return question;
            }),
        };
        setExperimentSurveys((prev) => [...prev, payload]);
        setTitle("");
        setDescription("");
        setQuestions([]);
        setType('pre');
        toggleCreateQuest();
    };

    const toggleSurveyDescription = (surveyId) => {
        if (openSurveyIds.includes(surveyId)) {
            setOpenSurveyIds(openSurveyIds.filter((id) => id !== surveyId));
        } else {
            setOpenSurveyIds([...openSurveyIds, surveyId]);
        }
    };

    const toggleCreateQuest = () => {
        setIsCreateQuestOpen((prev) => !prev);
    };
    const toggleEditQuest = () => {
        setIsEditDialogOpen((prev) => !prev);
    };

    const handleEditQuestion = (questionId, field, value) => {
        setEditedSurvey((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === questionId ? { ...q, [field]: value } : q
            ),
        }));
    };

    const handleEditOption = (questionId, optionId, field, value) => {
        setEditedSurvey((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map((opt) =>
                            opt.id === optionId ? {
                                ...opt, [field]: value,
                                ...(field === "subquestion" ? { hassub: true } : {}),
                            } : opt
                        ),
                    }
                    : q
            ),
        }));
    };

    const handleAddQuestionEdit = () => {
        setEditedSurvey((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: uuidv4(),
                    statement: '',
                    type: 'open',
                    required: false,
                    uniqueAnswer: false,
                    options: [],
                },
            ],
        }));
    };

    const handleRemoveQuestionEdit = (id) => {
        setEditedSurvey((prev) => ({
            ...prev,
            questions: prev.questions.filter((q) => q.id !== id),
        }));
    };

    const handleAddOptionEdit = (questionId) => {
        setEditedSurvey((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: [
                            ...q.options,
                            { id: uuidv4(), statement: '', score: 0, subquestion: null, hassub: false },
                        ],
                    }
                    : q
            ),
        }));
    };

    const handleRemoveOptionEdit = (questionId, optionId) => {
        setEditedSurvey((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.filter((opt) => opt.id !== optionId),
                    }
                    : q
            ),
        }));
    };

    const handleEditQuestionChange = (id, field, value) => {
        setEditedSurvey((prevSurvey) => ({
            ...prevSurvey,
            questions: prevSurvey.questions.map((q) =>
                q.id === id ? { ...q, [field]: value } : q
            ),
        }));
    };


    const handleEditSurveysave = (event) => {
        event.preventDefault();

        setExperimentSurveys((prev) => {
            const updatedSurveys = [...prev];
            updatedSurveys[IndexId] = editedSurvey;
            return updatedSurveys;
        });

        toggleEditQuest();
    };

    const handleEditSurvey = (index) => {
        setIndexId(index);
        const surveyToEdit = ExperimentSurveys[index];
        if (surveyToEdit) {
            setEditedSurvey(surveyToEdit);
            setIsEditDialogOpen(true);
        }
    };

    const questionTypes = [
        { value: 'open', label: t('open') },
        { value: 'multiple-selection', label: t('multiple_selection') },
        { value: 'multiple-choices', label: t('multiple_choices') },
    ];
    const surveyTypes = [
        { value: 'pre', label: t('pre') },
        { value: 'demo', label: t('demo') },
        { value: 'post', label: t('post') }
    ];


    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    marginTop: 10,
                }}
            >
                <Box
                    sx={{
                        width: { xs: '100%', sm: '60%' },
                        padding: { xs: 1, sm: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        boxShadow: 4,
                        mx: 'auto',
                    }}
                >

                    {isLoadingSurvey ? (
                        <CircularProgress />
                    ) : Array.isArray(ExperimentSurveys) && ExperimentSurveys.length > 0 ? (
                        <FormControl fullWidth sx={{ minHeight: 300, maxHeight: 300, overflowY: 'auto' }}>
                            {ExperimentSurveys.filter((survey) =>
                                survey.title.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((survey, index) => (
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
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ListItemText primary={survey.title} sx={{ ml: 1 }} />
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
                                                onClick={() => handleEditSurvey(index)}
                                                sx={{ ml: 2 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="primary"
                                                onClick={() => toggleSurveyDescription(index)}
                                                sx={{ ml: 1 }}
                                            >
                                                {openSurveyIds.includes(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </Box>
                                    </Box>


                                    {openSurveyIds.includes(index) && (
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
                                            dangerouslySetInnerHTML={{ __html: survey.description }}
                                        />
                                    )}

                                </Box>
                            ))}
                        </FormControl>
                    ) : (
                        <NotFound title={t('NSurveysFound')} subTitle={t('Nosurveyscreated')} />
                    )}

                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'space-between', mt: 2, width: '100%' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleBack}
                            sx={{ maxWidth: 150, fontWeight: 'bold', boxShadow: 2 }}
                        >
                            {t('back')}
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={toggleCreateQuest}
                                sx={{ mr: 2 }}
                            >
                                {t('create_survey')}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                                sx={{ maxWidth: 120 }}
                            >
                                {t('next')}
                            </Button>
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
                            onClick={toggleCreateQuest}
                            sx={{ maxWidth: '170px' }}
                        >
                            {t('create_survey')}
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
                                onClick={handleDeleteSurvey}
                                sx={{
                                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                {t('delete')}
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>

                <CreateSurvey
                    isCreateQuestOpen={isCreateQuestOpen}
                    toggleCreateQuest={toggleCreateQuest}
                    t={t}
                    setExperimentSurveys={setExperimentSurveys}
                />

                {isEditDialogOpen &&
                    <Dialog
                        open={isEditDialogOpen}
                        onClose={toggleEditQuest}
                        fullWidth
                        sx={{
                            '& .MuiDialog-paper': {
                                margin: { xs: 0, sm: 32 },
                                height: { xs: '100vh', sm: '100%' },
                                maxWidth: { xs: '100vw', sm: 'calc(100% - 64px)' },
                                width: { xs: '100vw', sm: 'calc(100% - 64px)' },
                            }
                        }}
                    >
                        <DialogContent sx={{ backgroundColor: '#f9f9f9', padding: 3 }}>
                            <Typography variant="h4" gutterBottom align="center">
                                {t('editSurvey')}
                            </Typography>
                            <form onSubmit={handleEditSurveysave}>
                                <TextField
                                    label={t('surveyTitle')}
                                    value={editedSurvey.title}
                                    onChange={(e) => setEditedSurvey({ ...editedSurvey, title: e.target.value })}
                                    fullWidth
                                    required
                                    margin="normal"
                                />
                                <TextField
                                    label={t('surveyDescription')}
                                    value={editedSurvey.description}
                                    onChange={(e) => setEditedSurvey({ ...editedSurvey, description: e.target.value })}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    required
                                    margin="normal"
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>{t('surveyType')}</InputLabel>
                                    <Select
                                        value={editedSurvey.type}
                                        onChange={(e) => setEditedSurvey({ ...editedSurvey, type: e.target.value })}
                                        label={t('surveyType')}
                                    >
                                        {surveyTypes.map((stype) => (
                                            <MenuItem key={stype.value} value={stype.value}>
                                                {stype.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h5" gutterBottom>
                                        {t('questions')}
                                    </Typography>

                                    {editedSurvey.questions.map((q, index) => (
                                        <Paper key={q.id} sx={{ padding: 2, mb: 2 }}>
                                            <Grid container spacing={2} sx={{
                                                flexDirection: {
                                                    xs: 'column', sm: 'row'
                                                },
                                                alignItems: {
                                                    xs: 'flex-start', sm: 'center'
                                                },
                                            }}>
                                                <Grid
                                                    item
                                                    xs={6}
                                                    sx={{
                                                        width: '100%',
                                                        maxWidth: { xs: '100%', sm: '50%' }
                                                    }}>
                                                    <TextField
                                                        label={t('questionStatement', { index: index + 1 })}
                                                        value={q.statement}
                                                        onChange={(e) =>
                                                            handleEditQuestion(q.id, 'statement', e.target.value)
                                                        }
                                                        fullWidth
                                                        required
                                                    />
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={6}
                                                    sx={{
                                                        width: '100%',
                                                        maxWidth: { xs: '100%', sm: '50%' }
                                                    }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>{t('questionType')}</InputLabel>
                                                        <Select
                                                            value={q.type}
                                                            onChange={(e) => handleEditQuestion(q.id, 'type', e.target.value)}
                                                            label={t('questionType')}
                                                        >
                                                            {questionTypes.map((qt) => (
                                                                <MenuItem key={qt.value} value={qt.value}>
                                                                    {qt.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={7}>
                                                </Grid>
                                                {(q.type === 'open') && (
                                                    <Grid item xs={2}>
                                                    </Grid>
                                                )}
                                                {(q.type === 'multiple-selection' || q.type === 'multiple-choices') && (
                                                    <Grid item xs={2}>
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={q.hasscore}
                                                                    onChange={(e) => handleEditQuestionChange(q.id, 'hasscore', e.target.checked)}
                                                                    color="primary"
                                                                />
                                                            }
                                                            label={t('score')}
                                                        />
                                                    </Grid>
                                                )}

                                                <Grid item xs={2}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={q.required}
                                                                onChange={(e) => handleEditQuestionChange(q.id, 'required', e.target.checked)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={t('required')}
                                                    />

                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={q.uniqueAnswer}
                                                                onChange={(e) => handleEditQuestionChange(q.id, 'uniqueAnswer', e.target.checked)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={t('unique_answer')}
                                                    />
                                                </Grid>

                                                <Grid item xs={1}>
                                                    <IconButton color="error" onClick={() => handleRemoveQuestionEdit(q.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>

                                                {(q.type === 'multiple-selection' || q.type === 'multiple-choices') && (
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>{t('options')}</Typography>

                                                        {q.options.map((opt, optIndex) => (
                                                            <Box key={opt.id} sx={{ mb: 2 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                    <TextField
                                                                        label={t('option', { index: optIndex + 1 })}
                                                                        value={opt.statement}
                                                                        onChange={(e) =>
                                                                            handleEditOption(q.id, opt.id, 'statement', e.target.value)
                                                                        }
                                                                        fullWidth
                                                                        required
                                                                    />
                                                                    {q.hasscore && (
                                                                        <TextField
                                                                            label={t('weight')}
                                                                            type="number"
                                                                            value={opt.score || 0}
                                                                            onChange={(e) =>
                                                                                handleEditOption(q.id, opt.id, 'score', Number(e.target.value))
                                                                            }
                                                                            sx={{ width: 100, ml: 2 }}
                                                                            required
                                                                        />
                                                                    )}
                                                                    <IconButton onClick={(event) => handleMenuOpen(event, opt.id)}>
                                                                        <MoreVertIcon />
                                                                    </IconButton>

                                                                    <Menu
                                                                        anchorEl={anchorEl}
                                                                        open={Boolean(anchorEl)}
                                                                        onClose={handleMenuClose}
                                                                    >
                                                                        <MenuItem
                                                                            onClick={() => {
                                                                                handleRemoveOptionEdit(q.id, selectedOptId);
                                                                                handleMenuClose();
                                                                            }}
                                                                        >
                                                                            {t("excluiopt")}
                                                                        </MenuItem>

                                                                        <MenuItem
                                                                            onClick={() => {
                                                                                const currentOpt = q.options.find(o => o.id === selectedOptId);
                                                                                const newValue = currentOpt?.subquestion ? null : {
                                                                                    statement: "",
                                                                                    type: "open",
                                                                                    options: [],
                                                                                    hasscore: false,
                                                                                    required: false,
                                                                                };
                                                                                handleEditOption(q.id, selectedOptId, "subquestion", newValue);
                                                                                handleMenuClose();
                                                                            }}
                                                                        >
                                                                            {t(q.options.find(o => o.id === selectedOptId)?.subquestion ? "Removesubq" : "AddSubq")}
                                                                        </MenuItem>
                                                                    </Menu>
                                                                </Box>

                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    {opt.hassub == true && (
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, ml: 8, marginTop: 2 }}>
                                                                            <Grid container spacing={2} alignItems="center">
                                                                                <Grid item xs={6}>
                                                                                    <TextField
                                                                                        label={t('subquestion_E')}
                                                                                        value={opt.subquestion.statement}
                                                                                        onChange={(e) =>
                                                                                            handleEditOption(q.id, opt.id, 'subquestion', {
                                                                                                ...opt.subquestion,
                                                                                                statement: e.target.value
                                                                                            })
                                                                                        }
                                                                                        fullWidth
                                                                                        required
                                                                                    />
                                                                                </Grid>

                                                                                <Grid item xs={6}>
                                                                                    <FormControl fullWidth>
                                                                                        <InputLabel>{t('subquestionType')}</InputLabel>
                                                                                        <Select
                                                                                            value={opt.subquestion.type}
                                                                                            onChange={(e) =>
                                                                                                handleEditOption(q.id, opt.id, 'subquestion', { ...opt.subquestion, type: e.target.value })
                                                                                            }
                                                                                            label={t('subquestionType')}
                                                                                        >
                                                                                            {questionTypes.map((qt) => (
                                                                                                <MenuItem key={qt.value} value={qt.value}>
                                                                                                    {qt.label}
                                                                                                </MenuItem>
                                                                                            ))}
                                                                                        </Select>
                                                                                    </FormControl>
                                                                                </Grid>

                                                                                <Grid item xs={7}>
                                                                                </Grid>

                                                                                {(opt.subquestion.type === 'multiple-selection' || opt.subquestion.type === 'multiple-choices') && (
                                                                                    <Grid item xs={2}>
                                                                                        <FormControlLabel
                                                                                            control={
                                                                                                <Switch
                                                                                                    checked={Boolean(opt.subquestion.hasscore)}
                                                                                                    onChange={(e) =>
                                                                                                        handleEditOption(q.id, opt.id, "subquestion", {
                                                                                                            ...opt.subquestion,
                                                                                                            hasscore: e.target.checked,
                                                                                                        })
                                                                                                    }
                                                                                                    color="primary"
                                                                                                />
                                                                                            }
                                                                                            label={t("score")}
                                                                                        />
                                                                                    </Grid>
                                                                                )}
                                                                                <Grid item xs={2}>
                                                                                    <FormControlLabel
                                                                                        control={
                                                                                            <Switch
                                                                                                checked={opt.subquestion.required}
                                                                                                onChange={(e) =>
                                                                                                    handleEditOption(q.id, opt.id, "subquestion", {
                                                                                                        ...opt.subquestion,
                                                                                                        required: e.target.checked,
                                                                                                    })
                                                                                                }
                                                                                                color="primary"
                                                                                            />
                                                                                        }
                                                                                        label={t('required')}
                                                                                    />

                                                                                    <FormControlLabel
                                                                                        control={
                                                                                            <Switch
                                                                                                checked={q.uniqueAnswer}
                                                                                                onChange={(e) => handleEditQuestionChange(q.id, 'uniqueAnswer', e.target.checked)}
                                                                                                color="primary"
                                                                                            />
                                                                                        }
                                                                                        label={t('unique_answer')}
                                                                                    />
                                                                                </Grid>

                                                                            </Grid>

                                                                            {(opt.subquestion.type === 'multiple-selection' || opt.subquestion.type === 'multiple-choices') && (
                                                                                <Box>
                                                                                    <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
                                                                                        {t('options')}
                                                                                    </Typography>
                                                                                    {opt.subquestion.options?.map((subOpt, subOptIndex) => (

                                                                                        <Box key={subOpt.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                                                            <TextField
                                                                                                label={t('option', { index: subOptIndex + 1 })}
                                                                                                value={subOpt.statement}
                                                                                                onChange={(e) =>
                                                                                                    handleEditOption(q.id, opt.id, 'subquestion', {
                                                                                                        ...opt.subquestion,
                                                                                                        options: opt.subquestion.options.map((o, i) =>
                                                                                                            i === subOptIndex ? { ...o, statement: e.target.value } : o
                                                                                                        ),
                                                                                                    })
                                                                                                }
                                                                                                fullWidth
                                                                                                required
                                                                                            />
                                                                                            {opt.subquestion.hasscore && (
                                                                                                <TextField
                                                                                                    label={t('weight')}
                                                                                                    type="number"
                                                                                                    value={subOpt.score || 0}
                                                                                                    onChange={(e) =>
                                                                                                        handleEditOption(q.id, opt.id, 'subquestion', {
                                                                                                            ...opt.subquestion,
                                                                                                            options: opt.subquestion.options.map((o, i) =>
                                                                                                                i === subOptIndex ? { ...o, score: Number(e.target.value) } : o
                                                                                                            ),
                                                                                                        })
                                                                                                    }
                                                                                                    sx={{ width: 100, ml: 2 }}
                                                                                                    required
                                                                                                />

                                                                                            )}
                                                                                            <IconButton
                                                                                                color="error"
                                                                                                onClick={() =>
                                                                                                    handleEditOption(q.id, opt.id, 'subquestion', {
                                                                                                        ...opt.subquestion,
                                                                                                        options: opt.subquestion.options.filter((_, i) => i !== subOptIndex),
                                                                                                    })
                                                                                                }
                                                                                            >
                                                                                                <DeleteIcon />
                                                                                            </IconButton>
                                                                                        </Box>
                                                                                    ))}
                                                                                    <Button
                                                                                        variant="outlined"
                                                                                        startIcon={<Add />}
                                                                                        onClick={() =>
                                                                                            handleEditOption(q.id, opt.id, 'subquestion', {
                                                                                                ...opt.subquestion,
                                                                                                options: [
                                                                                                    ...(opt.subquestion.options || []),
                                                                                                    { id: `subopt-${uuidv4()}`, statement: '' },
                                                                                                ],
                                                                                            })
                                                                                        }
                                                                                    >
                                                                                        {t('addOption')}
                                                                                    </Button>
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        ))}

                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<Add />}
                                                            onClick={() => handleAddOptionEdit(q.id)}
                                                        >
                                                            {t('addOption')}
                                                        </Button>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Paper>
                                    ))}
                                    <Button variant="contained" startIcon={<Add />} onClick={handleAddQuestionEdit}>
                                        {t('addQuestion')}
                                    </Button>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                    <Button variant="outlined" onClick={toggleEditQuest}>
                                        {t('cancel')}
                                    </Button>
                                    <Button type="submit" variant="contained" color="primary">
                                        {t('save')}
                                    </Button>
                                </Box>
                            </form>
                        </DialogContent>
                    </Dialog>
                }
            </Box>
        </Box>
    )
}

export default CreateExperimentSurvey;
