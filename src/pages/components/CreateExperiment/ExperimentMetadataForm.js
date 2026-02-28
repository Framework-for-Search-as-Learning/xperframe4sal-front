/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, {useContext, useState} from 'react';
import {Box, Button, styled, TextField,} from '@mui/material';
import {useTranslation} from 'react-i18next';
import ReactQuill from 'react-quill';
import StepContext from './context/StepContextCreate';
import 'react-quill/dist/quill.snow.css';
import {useNavigate} from 'react-router-dom';
import {ArrowBack, ArrowForward} from '@mui/icons-material';

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

const ExperimentMetadataForm = () => {
    const {
        step,
        setStep,
        ExperimentTitle,
        setExperimentTitle,
        ExperimentDesc,
        setExperimentDesc,
    } = useContext(StepContext);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isValidTitleExp, setIsValidTitleExp] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const stripHtml = (html) => html.replace(/<[^>]*>/g, '').trim();

    const [isDescEmpty, setIsDescEmpty] = useState(
        () => stripHtml(ExperimentDesc).length === 0
    );

    const isValidFormExperiment = ExperimentTitle.trim().length > 0 && !isDescEmpty;

    const handleNameChangeTitle = (e) => {
        const value = e.target.value;
        setExperimentTitle(value);
        setIsValidTitleExp(value.trim().length > 0);
    };

    const handleNextExperiment = () => {
        setStep(step + 1);
    };

    const handleBackResearcher = () => {
        navigate('/experiments');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                marginTop: 5,
            }}
        >
            <Box
                sx={{
                    width: { xs: '100%', sm: '60%' },
                    padding: 2,
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
                <Box
                    sx={{
                        width: '100%',
                        margin: 0,
                        padding: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        '& > *': {
                            marginBottom: 2,
                            width: '100%',
                        },
                    }}
                >
                    <TextField
                        label={t('Experiment_title')}
                        error={!isValidTitleExp}
                        helperText={!isValidTitleExp ? t('invalid_name_message') : ''}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={ExperimentTitle}
                        onChange={handleNameChangeTitle}
                        required
                    />

                    <div style={{ width: '100%', marginTop: '16.5px', marginBottom: '16px' }}>
                        <CustomContainer >
                            <ReactQuill
                                theme="snow"
                                value={ExperimentDesc}
                                onChange={(value) => {
                                    setExperimentDesc(value);
                                    setIsDescEmpty(stripHtml(value).length === 0);
                                }}
                                placeholder={t('Experiment_Desc1')}
                            />
                        </CustomContainer>
                    </div>

                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            justifyContent: 'space-between',
                            marginTop: 2,
                            width: '100%',
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleBackResearcher}
                            sx={{ maxWidth: '150px' }}
                        >
                            {t('back')}
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNextExperiment}
                            sx={{ maxWidth: '150px' }}
                            disabled={!isValidFormExperiment || isLoading}
                        >
                            {t('next')}
                        </Button>
                    </Box>
                    <Box
                        sx={{
                            display: { xs: 'flex', sm: 'none' },
                            justifyContent: 'space-between',
                            marginTop: 2,
                            width: '100%',
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleBackResearcher}
                            sx={{ maxWidth: '150px' }}
                        >
                            <ArrowBack />
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNextExperiment}
                            sx={{ maxWidth: '150px' }}
                            disabled={!isValidFormExperiment || isLoading}
                        >
                            <ArrowForward />
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ExperimentMetadataForm;
