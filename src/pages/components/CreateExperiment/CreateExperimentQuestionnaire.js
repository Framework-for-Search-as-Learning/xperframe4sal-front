/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, {useState, useContext} from 'react';
import {
    Box, Button, CircularProgress, FormControl, IconButton,
    ListItemText, Dialog, DialogContent, DialogTitle, Typography,
} from '@mui/material';
import {ArrowBack, ArrowForward} from '@mui/icons-material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import StepContext from './context/StepContextCreate';
import CreateQuestionnaire from '../../../components/Modals/CreateQuestionnaire';
import EditQuestionnaireDialog from '../../../components/Modals/EditQuestionnaireDialog';
import NotFound from '../../../components/NotFound';

const CreateExperimentQuestionnaire = () => {
    const {step, setStep, ExperimentSurveys, setExperimentSurveys} = useContext(StepContext);
    const {t} = useTranslation();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [openDescIds, setOpenDescIds] = useState([]);

    const toggleDesc = (id) =>
        setOpenDescIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    const handleSaveEdit = (updatedSurvey) => {
        setExperimentSurveys((prev) => {
            const next = [...prev];
            next[editTarget.index] = updatedSurvey;
            return next;
        });
        setEditTarget(null);
    };

    const handleConfirmDelete = () => {
        setExperimentSurveys((prev) => prev.filter((_, i) => i !== deleteTarget));
        setDeleteTarget(null);
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            marginTop: 5
        }}>
            <Box sx={{
                width: {xs: '100%', sm: '60%'},
                padding: {xs: 1, sm: 3},
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                boxShadow: 4,
                mx: 'auto'
            }}>

                {Array.isArray(ExperimentSurveys) && ExperimentSurveys.length > 0 ? (
                    <FormControl fullWidth sx={{minHeight: 300, maxHeight: 300, overflowY: 'auto'}}>
                        {ExperimentSurveys.map((survey, index) => (
                            <Box key={index} sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                mb: 1,
                                p: 1,
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                boxShadow: 1,
                                wordBreak: 'break-word',
                                '&:hover': {backgroundColor: '#e6f7ff'}
                            }}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <ListItemText primary={survey.title} sx={{ml: 1}}/>
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <IconButton color="error"
                                                    onClick={() => setDeleteTarget(index)}><DeleteIcon/></IconButton>
                                        <IconButton color="primary" onClick={() => setEditTarget({
                                            index,
                                            survey
                                        })}><EditIcon/></IconButton>
                                        <IconButton color="primary" onClick={() => toggleDesc(index)}>
                                            {openDescIds.includes(index) ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                                        </IconButton>
                                    </Box>
                                </Box>
                                {openDescIds.includes(index) && (
                                    <Box sx={{
                                        p: 1,
                                        backgroundColor: '#E8E8E8',
                                        borderRadius: '4px',
                                        maxHeight: 150,
                                        overflowY: 'auto'
                                    }}
                                         dangerouslySetInnerHTML={{__html: survey.description}}/>
                                )}
                            </Box>
                        ))}
                    </FormControl>
                ) : (
                    <NotFound title={t('NSurveysFound')} subTitle={t('Nosurveyscreated')}/>
                )}

                <Box sx={{display: {xs: 'none', sm: 'flex'}, justifyContent: 'space-between', mt: 2}}>
                    <Button variant="contained" onClick={() => setStep(step - 1)}>{t('back')}</Button>
                    <Box sx={{display: 'flex', gap: 2}}>
                        <Button variant="contained" onClick={() => setIsCreateOpen(true)}>{t('create_survey')}</Button>
                        <Button variant="contained" onClick={() => setStep(step + 1)}>{t('next')}</Button>
                    </Box>
                </Box>

                <Box sx={{display: {xs: 'flex', sm: 'none'}, justifyContent: 'space-between', mt: 2}}>
                    <Button variant="contained" onClick={() => setStep(step - 1)}><ArrowBack/></Button>
                    <Button variant="contained" onClick={() => setIsCreateOpen(true)}>{t('create_survey')}</Button>
                    <Button variant="contained" onClick={() => setStep(step + 1)}><ArrowForward/></Button>
                </Box>
            </Box>

            <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
                    sx={{'& .MuiDialog-paper': {borderRadius: '12px', p: 4}}}>
                <DialogTitle sx={{textAlign: 'center', fontWeight: 'bold'}}>{t('confirm_delete')}</DialogTitle>
                <DialogContent sx={{textAlign: 'center', color: '#6b7280'}}>
                    <p style={{margin: '0 0 24px', lineHeight: 1.5}}>{t('delete_confirmation_message')}</p>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2}}>
                        <Button variant="outlined" onClick={() => setDeleteTarget(null)}>{t('cancel')}</Button>
                        <Button variant="contained" color="error" onClick={handleConfirmDelete}>{t('delete')}</Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <CreateQuestionnaire
                isCreateQuestOpen={isCreateOpen}
                toggleCreateQuest={() => setIsCreateOpen(false)}
                setExperimentSurveys={setExperimentSurveys}
            />

            {editTarget && (
                <EditQuestionnaireDialog
                    open={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    survey={editTarget.survey}
                    onSave={handleSaveEdit}
                />
            )}
        </Box>
    );
};

export default CreateExperimentQuestionnaire;