/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Grid, Button, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StepContext from './context/StepContextCreate';
import { Add, ArrowBack } from '@mui/icons-material';

const ConfirmCreateExperiment = () => {
    const { t } = useTranslation();
    const {
        step,
        setStep,
        handleCreateExperiment,
        ExperimentTitle,
        ExperimentType,
        BtypeExperiment,
        ExperimentDesc,
        ExperimentTasks,
        ExperimentSurveys,
    } = useContext(StepContext);

    const [loading, setLoading] = useState(false);
    const handleCreate = async () => {
        setLoading(true);

        const success = await handleCreateExperiment();

        if (success) {
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    let minimal_tasks = 1;
    if (ExperimentType === 'between-subject')
        minimal_tasks = 2;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                marginTop: { xs: 3, sm: 10 },
            }}
        >
            <Box
                sx={{
                    width: { xs: '100%', sm: '60%' },
                    padding: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    boxShadow: 4,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('revis_conc')}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                        <strong>{t('Experiment_title')}:</strong> {ExperimentTitle}
                    </Grid>
                    <Grid item xs={12}>
                        <strong>{t('typeExperiment1')}:</strong> {t(ExperimentType)}
                    </Grid>

                    {ExperimentType === 'between-subject' && (
                        <Grid item xs={12}>
                            <strong>{t('Group_Separation_Method')}:</strong> {t(BtypeExperiment)}
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <strong>{t('Experiment_Desc')}:</strong>
                        <p dangerouslySetInnerHTML={{ __html: ExperimentDesc }} />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        sx={{ display: 'flex', flexDirection: 'column' }}
                    >
                        <div>
                            <strong>{t('selected_task')}:</strong> {
                                ExperimentTasks.length > 0
                                    ? ExperimentTasks.map(task => task.title).join(', ')
                                    : t('non_selected_task')
                            }
                        </div>
                        {ExperimentTasks.length < minimal_tasks && (
                            <p style={{ color: 'red' }}>
                                {t('need_minimal_pt1')} {minimal_tasks} {t('need_minimal_pt2')}
                            </p>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <strong>{t('selected_surveys')}:</strong> {
                            ExperimentSurveys.length > 0
                                ? ExperimentSurveys.map(survey => survey.title).join(', ')
                                : t('non_selected_survey')
                        }
                    </Grid>

                </Grid>

                <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'space-between', mt: 4, width: '100%' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBack}
                        sx={{ maxWidth: 150, fontWeight: 'bold', boxShadow: 2 }}
                    >
                        {t('back')}
                    </Button>

                    <Button
                        disabled={ExperimentTasks.length < minimal_tasks}
                        variant="contained"
                        color="primary"
                        onClick={handleCreate}
                        sx={{ maxWidth: 200, fontWeight: 'bold', boxShadow: 2 }}
                    >
                        {t('create')}
                    </Button>
                </Box>
                <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'space-between', mt: 4, width: '100%' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBack}
                        sx={{ maxWidth: 150, fontWeight: 'bold', boxShadow: 2 }}
                    >
                        <ArrowBack />
                    </Button>

                    <Button
                        disabled={ExperimentTasks.length < minimal_tasks}
                        variant="contained"
                        color="primary"
                        onClick={handleCreate}
                        sx={{ maxWidth: 200, fontWeight: 'bold', boxShadow: 2 }}
                    >
                        <Add />
                    </Button>

                </Box>
            </Box>
        </Box>
    );
};

export default ConfirmCreateExperiment;
