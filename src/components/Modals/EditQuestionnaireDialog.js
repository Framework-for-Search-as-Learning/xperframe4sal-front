/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, {useEffect} from 'react';
import {
    Dialog, DialogContent, Box, Typography, TextField,
    FormControl, InputLabel, Select, MenuItem, Button,
} from '@mui/material';
import {Add} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import useQuestionnaireForm from "../Questionnaire/useQuestionnaireForm";
import QuestionCard from "../Questionnaire/QuestionCard";

const SURVEY_TYPES = (t) => [
    {value: 'pre', label: t('pre')},
    {value: 'post', label: t('post')},
];

const QUESTION_TYPES = (t) => [
    {value: 'open', label: t('open')},
    {value: 'multiple-selection', label: t('multiple_selection')},
    {value: 'multiple-choices', label: t('multiple_choices')},
];

const EditQuestionnaireDialog = ({open, onClose, survey, onSave}) => {
    const {t} = useTranslation();
    const surveyTypes = SURVEY_TYPES(t);
    const questionTypes = QUESTION_TYPES(t);

    const {
        title, setTitle,
        description, setDescription,
        type, setType,
        questions, addQuestion, removeQuestion, updateQuestion,
        isValid, hasInvalidChoiceQuestion,
        buildPayload,hasEmptyStatement
    } = useQuestionnaireForm(survey);

    useEffect(() => {
        if (survey) {
            setTitle(survey.title);
            setDescription(survey.description);
            setType(survey.type);
        }
    }, [survey?.uuid]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!isValid) return;
        onSave({...buildPayload(), uuid: survey.uuid});
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    margin: {xs: 0, sm: 4},
                    height: {xs: '100vh', sm: 'auto'},
                    maxHeight: '90vh',
                    maxWidth: {xs: '100vw', sm: '800px'},
                    width: '100%',
                },
            }}
        >
            <DialogContent sx={{backgroundColor: '#f0f2f5', p: {xs: 2, sm: 3}}}>
                <Typography variant="h5" align="center" gutterBottom sx={{fontWeight: 600}}>
                    {t('editSurvey')}
                </Typography>

                <form onSubmit={handleSave}>
                    <Box sx={{
                        backgroundColor: '#fff',
                        borderRadius: 2,
                        p: 2,
                        mb: 3,
                        borderTop: '6px solid #1976d2',
                        boxShadow: 1
                    }}>
                        <FormControl fullWidth margin="normal" variant="filled">
                            <InputLabel>{t('surveyType')}</InputLabel>
                            <Select value={type} onChange={(e) => setType(e.target.value)}>
                                {surveyTypes.map((st) => (
                                    <MenuItem key={st.value} value={st.value}>{st.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label={t('surveyTitle')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth required margin="normal" variant="filled"
                        />
                        <TextField
                            label={t('surveyDescription')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth required multiline rows={3} margin="normal" variant="filled"
                        />
                    </Box>

                    <Typography variant="subtitle1" sx={{mb: 1, fontWeight: 600}}>{t('questions')}</Typography>

                    {questions.map((q, idx) => (
                        <QuestionCard
                            key={q.id}
                            q={q}
                            index={idx}
                            questionTypes={questionTypes}
                            t={t}
                            onUpdate={updateQuestion}
                            onRemove={removeQuestion}
                        />
                    ))}

                    <Button
                        variant="outlined"
                        startIcon={<Add/>}
                        onClick={addQuestion}
                        fullWidth
                        sx={{mb: 3, borderStyle: 'dashed'}}
                    >
                        {t('addQuestion')}
                    </Button>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                        <Button variant="outlined" onClick={onClose}>{t('cancel')}</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={!isValid || hasEmptyStatement}>
                            {t('save')}
                        </Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditQuestionnaireDialog;