import React from 'react';
import { useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { v4 as uuidv4 } from 'uuid';
import {
    TextField,
    Button,
    Typography,
    Box,
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
import { Add, CancelOutlined, Done } from '@mui/icons-material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { api } from '../../config/axios';
import { useParams } from 'react-router-dom';

const CreateSurvey = ({ isCreateQuestOpen, toggleCreateQuest, t, setExperimentSurveys, fetch = false }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('pre');
    const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [questions, setQuestions] = useState([]);
    const [isValidTitleSurvey, setIsValidTitleSurvey] = useState(true);
    const [isValidDescSurvey, setIsValidDescSurvey] = useState(true);
    const isValidFormSurvey = isValidTitleSurvey && title && isValidDescSurvey && description;

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedOptId, setSelectedOptId] = useState(null);

    const { experimentId } = useParams();

    const handleMenuOpen = (event, optId) => {
        setAnchorEl(event.currentTarget);
        setSelectedOptId(optId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedOptId(null);
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

                        if (q.type === 'multiple-choices') {
                            option.score = opt.score;
                        }

                        return option;
                    });

                }
                return question;
            }),
        };
        console.log(payload)
        setExperimentSurveys((prev) => [...prev, payload]);
        setTitle("");
        setDescription("");
        setQuestions([]);
        setType('pre');
        toggleCreateQuest();
        if (fetch) {
            const body = { ...payload, experimentId: experimentId }
            try {
                await api.post('/survey2', body)
                console.log("Questionario criada com sucesso: ", body)
            } catch (error) {

                console.error("Erro ao criar Questionario: ", body)
                console.error("Erro: ", error)
            }
        }
    };

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: uuidv4(),
                statement: '',
                type: 'open',
                required: false,
                options: [],
            },
        ]);
    };

    const handleRemoveQuestion = (id) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const handleQuestionChange = (id, field, value) => {
        setQuestions(
            questions.map((q) =>
                q.id === id
                    ? {
                        ...q,
                        [field]: value,
                    }
                    : q
            )
        );
    };

    const handleAddOption = (questionId) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: [
                            ...q.options,
                            { id: uuidv4(), statement: '', score: 0, subquestion: null, hassub: false },
                        ],
                    }
                    : q
            )

        );

        console.log(questions);
    };

    const handleRemoveOption = (questionId, optionId) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.filter((opt) => opt.id !== optionId),
                    }
                    : q
            )
        );
    };

    const handleOptionChange = (questionId, optionId, field, value) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map((opt) =>
                            opt.id === optionId
                                ? {
                                    ...opt,
                                    [field]: value,
                                    ...(field === "subquestion" ? { hassub: true } : {}),
                                }
                                : opt
                        ),
                    }
                    : q
            )
        );
    };

    const handleNameChangeTitleSurvey = (e) => {
        const inputName = e.target.value;
        setTitle(inputName);
        setIsValidTitleSurvey(inputName.trim() !== "");
    };
    const handleNameChangeDescSurvey = (e) => {
        const inputName = e.target.value;
        setDescription(inputName);
        setIsValidDescSurvey(inputName.trim() !== "");
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
        <Dialog
            open={isCreateQuestOpen}
            onClose={toggleCreateQuest}
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
            <DialogContent sx={{
                width: '100%', padding: 3, backgroundColor: '#f9f9f9', mx: 'auto', '& .MuiDialog-paper': {
                    backgroundColor: '#f9f9f9',
                }
            }}>
                <Box sx={{
                    width: '100%', padding: 3, backgroundColor: '#f9f9f9', mx: 'auto', '& .MuiDialog-paper': {
                        backgroundColor: '#f9f9f9',
                    }
                }}>
                    <Typography variant="h4" gutterBottom align="center">
                        {t('title')}
                    </Typography>
                    <form onSubmit={handleCreateSurvey}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>{t('surveyType')}</InputLabel>
                            <Select value={type} onChange={(e) => setType(e.target.value)} label={t('surveyType')}>
                                {surveyTypes.map((stype) => (
                                    <MenuItem key={stype.value} value={stype.value}>
                                        {stype.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label={t('surveyTitle')}
                            value={title}
                            onChange={handleNameChangeTitleSurvey}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            label={t('surveyDescription')}
                            value={description}
                            required
                            onChange={handleNameChangeDescSurvey}
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5" gutterBottom>
                                {t('questions')}
                            </Typography>

                            {questions.map((q, index) => (
                                <Paper key={q.id} sx={{ padding: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
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
                                                onChange={(e) => handleQuestionChange(q.id, 'statement', e.target.value)}
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
                                                    onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
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
                                                            checked={Boolean(q.hasscore)}
                                                            onChange={(e) => handleQuestionChange(q.id, 'hasscore', e.target.checked)}
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
                                                        onChange={(e) => handleQuestionChange(q.id, 'required', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label={t('required')}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <IconButton color="error" onClick={() => handleRemoveQuestion(q.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>


                                        {(q.type === 'multiple-selection' || q.type === 'multiple-choices') && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
                                                    {t('options')}
                                                </Typography>

                                                {q.options.map((opt, optIndex) => (
                                                    <Box key={opt.id} sx={{ mb: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                            <TextField
                                                                label={t('option', { index: optIndex + 1 })}
                                                                value={opt.statement}
                                                                onChange={(e) =>
                                                                    handleOptionChange(q.id, opt.id, 'statement', e.target.value)
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
                                                                        handleOptionChange(q.id, opt.id, 'score', Number(e.target.value))
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
                                                                        handleRemoveOption(q.id, selectedOptId);
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
                                                                            hassub: false,
                                                                        };
                                                                        handleOptionChange(q.id, selectedOptId, "subquestion", newValue);
                                                                        handleMenuClose();
                                                                    }}
                                                                >
                                                                    {t(q.options.find(o => o.id === selectedOptId)?.subquestion ? "Removesubq" : "AddSubq")}
                                                                </MenuItem>
                                                            </Menu>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                                                            {opt.subquestion !== null && (
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
                                                                                            { id: uuidv4(), },
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
                                                    onClick={() => handleAddOption(q.id)}
                                                >
                                                    {t('addOption')}
                                                </Button>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            ))}
                            <Button variant="contained" startIcon={<Add />} onClick={handleAddQuestion}>
                                {t('addQuestion')}
                            </Button>
                        </Box>

                        <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'space-between', marginTop: 'auto', width: '100%', mt: 2 }}>
                            <Button variant="contained" onClick={toggleCreateQuest} color="primary">
                                <CancelOutlined />
                            </Button>

                            <Button type="submit" variant="contained" color="primary" disabled={!isValidFormSurvey || isLoadingSurvey}>
                                {isLoadingSurvey ? <CircularProgress size={24} /> : <Done />}
                            </Button>
                        </Box>
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'space-between', marginTop: 'auto', width: '100%', mt: 2 }}>
                            <Button variant="contained" onClick={toggleCreateQuest} color="primary">
                                {t('cancel')}
                            </Button>

                            <Button type="submit" variant="contained" color="primary" disabled={!isValidFormSurvey || isLoadingSurvey}>
                                {isLoadingSurvey ? <CircularProgress size={24} /> : t('createSurvey')}
                            </Button>
                        </Box>
                    </form>
                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={6000}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                    >
                        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default CreateSurvey;