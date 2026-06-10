/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useContext, useState, useEffect } from 'react';
import { Box, Button, styled, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import StepContext from './context/StepContext';
import 'react-quill/dist/quill.snow.css';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import FormStepContainer from '../../../components/Forms/FormStepContainer';

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
    isEditMode,
    handleSaveExperiment,
    setIsCurrentStepValid,
  } = useContext(StepContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isValidTitleExp, setIsValidTitleExp] = useState(true);
  const stripHtml = (html) => html.replace(/<[^>]*>/g, '').trim();

  const [isDescEmpty, setIsDescEmpty] = useState(() => stripHtml(ExperimentDesc).length === 0);

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

  useEffect(() => {
    setIsCurrentStepValid(isValidFormExperiment);
  }, [isValidFormExperiment, setIsCurrentStepValid]);

  return (
    <FormStepContainer>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        {t('step_metadata')}
      </Typography>
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
        <CustomContainer>
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
          justifyContent: isEditMode ? 'flex-end' : 'space-between',
          mt: 2,
          width: '100%',
        }}
      >
        {!isEditMode && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackResearcher}
            sx={{ maxWidth: '150px' }}
          >
            {t('back')}
          </Button>
        )}
        <Button
          variant="contained"
          color={isEditMode ? 'success' : 'primary'}
          onClick={isEditMode ? handleSaveExperiment : handleNextExperiment}
          sx={{ maxWidth: '150px' }}
          disabled={!isValidFormExperiment}
        >
          {isEditMode ? t('save') : t('next')}
        </Button>
      </Box>

      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          justifyContent: isEditMode ? 'flex-end' : 'space-between',
          mt: 2,
          width: '100%',
        }}
      >
        {!isEditMode && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackResearcher}
            sx={{ maxWidth: '150px' }}
          >
            <ArrowBack />
          </Button>
        )}
        <Button
          variant="contained"
          color={isEditMode ? 'success' : 'primary'}
          onClick={isEditMode ? handleSaveExperiment : handleNextExperiment}
          sx={{ maxWidth: '150px' }}
          disabled={!isValidFormExperiment}
        >
          {isEditMode ? t('save') : <ArrowForward />}
        </Button>
      </Box>
    </FormStepContainer>
  );
};

export default ExperimentMetadataForm;
