/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useCallback } from 'react';
import { useState, useContext, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import StepContext from './context/StepContext';
import {
    TextField,
    Button,
    Typography,
    Box,
    ListItemText,
    DialogTitle,
    FormControl,
    CircularProgress,
    IconButton,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Dialog,
    DialogContent,
    FormControlLabel,
    Grid,
    Switch,
    Menu,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Add, Remove } from '@mui/icons-material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { api } from '../../../config/axios';
import CreateSurvey from '../../../components/Modals/CreateSurvey';
import NotFound from '../../../components/NotFound';
import { useParams } from 'react-router-dom';

const EditExperimentSurvey = () => {
    const [
        ExperimentSurveys,
        setExperimentSurveys,
    ] = useContext(StepContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const { t } = useTranslation();
    const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
    const [openSurveyIds, setOpenSurveyIds] = useState([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [SurveyToDeleteId, setSurveyToDeleteId] = useState(null);
    const [editedSurvey, setEditedSurvey] = useState(null);
    const [IndexId, setIndexId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedOptId, setSelectedOptId] = useState(null);
    const [selectedQId, setSelectedQId] = useState(null);
    const [isCreateQuestOpen, setIsCreateQuestOpen] = useState(false);
    const { experimentId } = useParams();


    const toggleCreateQuest = () => {
        setIsCreateQuestOpen((prev) => !prev);
    };

    const generateRandomId = () => `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const fetchSurvey = useCallback(async () => {
        try {
            const response = await api.get(`survey/experiment/${experimentId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            const filteredsurveys = response.data
            setExperimentSurveys(filteredsurveys);
            setIsLoadingSurvey(false);
        } catch (error) {
            console.error(t('Error in Search'), error);
        }
    }, [user.accessToken, t]);

    useEffect(() => {
        fetchSurvey();
    }, [fetchSurvey]);

    const handleMenuOpen = (event, qId, optId) => {
        setAnchorEl(event.currentTarget);
        setSelectedQId(qId);
        setSelectedOptId(optId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedOptId(null);
    };

    const handleOpenDeleteDialog = (index) => {
        setSurveyToDeleteId(ExperimentSurveys[index])
        setIsDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
    };

    const handleDeleteSurvey = async () => {
        try {
            await api.delete(`/survey/${SurveyToDeleteId._id}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            handleCloseDeleteDialog();
            fetchSurvey();
        } catch (error) {
            console.error(t('Error in Search'), error);
        }
    };


    const toggleSurveyDescription = (surveyId) => {
        if (openSurveyIds.includes(surveyId)) {
            setOpenSurveyIds(openSurveyIds.filter((id) => id !== surveyId));
        } else {
            setOpenSurveyIds([...openSurveyIds, surveyId]);
        }
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

    const handleAddQuestionEdit = () => {
        setEditedSurvey((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: generateRandomId(),
                    statement: '',
                    type: 'open',
                    required: false,
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
                            { id: generateRandomId(), statement: '', score: 0, subquestion: null },
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

    const handleOptionChange = (questionId, optionId, field, value) => {
        setEditedSurvey((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map((opt) =>
                            opt.id === optionId
                                ? {
                                    ...opt,
                                    [field]: value,
                                    ...(field === "subquestion" && value ? { hassub: true } :
                                        field === "subquestion" && !value ? { hassub: false } : {}),
                                }
                                : opt
                        ),
                    }
                    : q
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
                            opt.id === optionId ? { ...opt, [field]: value } : opt
                        ),
                    }
                    : q
            ),
        }));
    };

    const handleEditSurveysave = async (event) => {
        event.preventDefault();

        try {
            // Create a clean copy of the survey with only the necessary properties
            const cleanSurveyData = {
                name: editedSurvey.name,
                title: editedSurvey.title,
                description: editedSurvey.description,
                type: editedSurvey.type,
                questions: editedSurvey.questions.map(question => {
                    const cleanQuestion = {
                        id: question.id,
                        statement: question.statement,
                        type: question.type,
                        required: question.required,
                        options: question.options ? question.options.map(option => {
                            const cleanOption = {
                                id: option.id,
                                statement: option.statement,
                                score: option.score || 0
                            };

                            // Only include subquestion if it exists and is not null/undefined
                            if (option.subquestion && typeof option.subquestion === 'object') {
                                cleanOption.subquestion = {
                                    statement: option.subquestion.statement || '',
                                    type: option.subquestion.type || 'open',
                                    required: Boolean(option.subquestion.required),
                                    hasscore: Boolean(option.subquestion.hasscore),
                                    options: option.subquestion.options ? option.subquestion.options.map(subOpt => ({
                                        id: subOpt.id,
                                        statement: subOpt.statement || '',
                                        score: subOpt.score || 0
                                    })) : []
                                };
                                cleanOption.hassub = true;
                            }

                            return cleanOption;
                        }) : []
                    };
                    return cleanQuestion;
                }),
                experiment_id: editedSurvey.experiment_id,
                uniqueAnswer: editedSurvey.uniqueAnswer,
                required: editedSurvey.required
            };

            setExperimentSurveys((prev) => {
                const updatedSurveys = [...prev];
                updatedSurveys[IndexId] = editedSurvey;
                return updatedSurveys;
            });

            await api.patch(`/survey/${editedSurvey._id}`, cleanSurveyData, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            toggleEditQuest();
            fetchSurvey();
        } catch (error) {
            console.error('Erro na atualização do questionario:', error);
        }
    };

    const addIdOnSurvey = (questions) => {
        if (!questions || !Array.isArray(questions)) return;

        questions.forEach((question) => {
            if (!question.id) {
                question.id = generateRandomId();
            }

            if (question.options && Array.isArray(question.options)) {
                question.options.forEach((option) => {
                    if (!option.id) {
                        option.id = generateRandomId();
                    }

                    if (option.subquestion && typeof option.subquestion === 'object' && option.subquestion.options) {
                        addIdOnSurvey(option.subquestion.options);
                    }
                });
            }
        });
    };

    const handleEditSurvey = (index) => {
        setIndexId(index);
        let surveyToEdit = ExperimentSurveys[index];
        if (surveyToEdit) {
            // Create a deep copy and ensure all questions and options have IDs
            const surveyWithIds = {
                ...surveyToEdit,
                questions: surveyToEdit.questions.map(question => ({
                    ...question,
                    id: question.id || generateRandomId(),
                    options: question.options ? question.options.map(option => {
                        const optionWithId = {
                            ...option,
                            id: option.id || generateRandomId(),
                        };

                        // Handle subquestion properly
                        if (option.subquestion && typeof option.subquestion === 'object' && option.subquestion !== null) {
                            optionWithId.subquestion = {
                                ...option.subquestion,
                                options: option.subquestion.options ? option.subquestion.options.map(subOpt => ({
                                    ...subOpt,
                                    id: subOpt.id || generateRandomId()
                                })) : []
                            };
                            optionWithId.hassub = true;
                        } else {
                            optionWithId.subquestion = null;
                            optionWithId.hassub = false;
                        }

                        return optionWithId;
                    }) : []
                }))
            };

            setEditedSurvey(surveyWithIds);
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
                {t('edit_survey')}
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        padding: 3,
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
                        <>
                            <TextField
                                label={t('search_survey')}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ mb: 3 }}
                            />
                            <FormControl fullWidth sx={{
                                overflowY: 'auto', maxHeight: {
                                    xs: 400,
                                    md: 280,
                                    xl: 500
                                }
                            }}>
                                {Array.isArray(ExperimentSurveys) &&
                                    ExperimentSurveys.filter((survey) =>
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
                        </>
                    ) : (
                        <NotFound title={t('NSurveysFound')} subTitle={t('Nosurveyscreated')} />
                    )}

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            mt: 2,
                            width: '100%',
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={toggleCreateQuest}
                            sx={{ mr: 2 }}
                        >
                            {t('create_survey')}
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
                    fetch={true}
                />

                {isEditDialogOpen &&
                    <Dialog
                        open={isEditDialogOpen}
                        onClose={toggleEditQuest}
                        fullWidth
                        maxWidth="lg"
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
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={11}>
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
                                                <Grid item xs={1}>
                                                    <IconButton color="error" onClick={() => handleRemoveQuestionEdit(q.id)}>
                                                        <Remove />
                                                    </IconButton>
                                                </Grid>
                                                <Grid item xs={6}>
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
                                                <Grid item xs={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>{t('required')}</InputLabel>
                                                        <Select
                                                            value={q.required}
                                                            onChange={(e) => handleEditQuestion(q.id, 'required', e.target.value)}
                                                            label={t('required')}
                                                        >
                                                            <MenuItem value={false}>{t('no')}</MenuItem>
                                                            <MenuItem value={true}>{t('yes')}</MenuItem>
                                                        </Select>
                                                    </FormControl>
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
                                                                    {(q.type === 'multiple-choices' || q.type === 'multiple-selection') && (
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
                                                                    <IconButton onClick={(event) => handleMenuOpen(event, q.id, opt.id)}>
                                                                        <MoreVertIcon />
                                                                    </IconButton>

                                                                    <Menu
                                                                        anchorEl={anchorEl}
                                                                        open={Boolean(anchorEl)}
                                                                        onClose={handleMenuClose}
                                                                    >
                                                                        <MenuItem
                                                                            onClick={() => {
                                                                                handleRemoveOptionEdit(selectedQId, selectedOptId);
                                                                                handleMenuClose();
                                                                            }}
                                                                        >
                                                                            {t("excluiopt")}
                                                                        </MenuItem>

                                                                        <MenuItem
                                                                            onClick={() => {
                                                                                const currentOpt = editedSurvey.questions.find((q) => q.id === selectedQId)?.options.find((opt) => opt.id === selectedOptId);
                                                                                const hasSubquestion = currentOpt?.subquestion && typeof currentOpt.subquestion === 'object' && currentOpt.subquestion !== null;
                                                                                const newValue = hasSubquestion ? null : {
                                                                                    statement: "",
                                                                                    type: "open",
                                                                                    options: [],
                                                                                    hasscore: false,
                                                                                    required: false,
                                                                                    hassub: false,
                                                                                };
                                                                                handleOptionChange(selectedQId, selectedOptId, "subquestion", newValue);
                                                                                handleMenuClose();
                                                                            }}
                                                                        >
                                                                            {t(
                                                                                editedSurvey?.questions
                                                                                    ?.find((q) => q.id === selectedQId)
                                                                                    ?.options?.find((opt) => opt.id === selectedOptId)
                                                                                    ?.subquestion && typeof editedSurvey.questions.find((q) => q.id === selectedQId)?.options?.find((opt) => opt.id === selectedOptId)?.subquestion === 'object'
                                                                                    ? "Removesubq"
                                                                                    : "AddSubq"
                                                                            )}
                                                                        </MenuItem>
                                                                    </Menu>
                                                                </Box>

                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    {opt.subquestion && typeof opt.subquestion === 'object' && opt.subquestion !== null && (
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, ml: 8, marginTop: 2 }}>
                                                                            <Grid container spacing={2} alignItems="center">
                                                                                <Grid item xs={6}>
                                                                                    <TextField
                                                                                        label={t('subquestion_E')}
                                                                                        value={opt.subquestion.statement}
                                                                                        onChange={(e) =>
                                                                                            handleOptionChange(q.id, opt.id, 'subquestion', {
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
                                                                                                handleOptionChange(q.id, opt.id, 'subquestion', { ...opt.subquestion, type: e.target.value })
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
                                                                                                        handleOptionChange(q.id, opt.id, "subquestion", {
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
                                                                                                    handleOptionChange(q.id, opt.id, "subquestion", {
                                                                                                        ...opt.subquestion,
                                                                                                        required: e.target.checked,
                                                                                                    })
                                                                                                }
                                                                                                color="primary"
                                                                                            />
                                                                                        }
                                                                                        label={t('required')}
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
                                                                                                    handleOptionChange(q.id, opt.id, 'subquestion', {
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
                                                                                                        handleOptionChange(q.id, opt.id, 'subquestion', {
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
                                                                                                    handleOptionChange(q.id, opt.id, 'subquestion', {
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
                                                                                            handleOptionChange(q.id, opt.id, 'subquestion', {
                                                                                                ...opt.subquestion,
                                                                                                options: [
                                                                                                    ...(opt.subquestion.options || []),
                                                                                                    { id: generateRandomId(), statement: '', score: 0 },
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
        </Box >
    )
}

export default EditExperimentSurvey;
