/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState, useContext } from 'react';
import { Box, TextField, Button, styled, Typography } from '@mui/material';
import FormStepContainer from '../../../components/Forms/FormStepContainer';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import StepContext from './context/StepContext';
import 'react-quill/dist/quill.snow.css';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

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

const ExperimentICF = () => {
  const {
    step,
    setStep,
    ExperimentTitleICF,
    setExperimentTitleICF,
    ExperimentDescICF,
    setExperimentDescICF,
    isEditMode,
    handleSaveExperiment,
  } = useContext(StepContext);

  const { t } = useTranslation();
  const [isValidTitleExp, setIsValidTitleExp] = useState(true);
  const stripHtml = (html) => html.replace(/<[^>]*>/g, '').trim();

  const [isDescEmpty, setIsDescEmpty] = useState(() => stripHtml(ExperimentDescICF).length === 0);

  const isValidFormExperiment = isValidTitleExp && ExperimentTitleICF && !isDescEmpty;
  const handleNameChangeTitle = (e) => {
    const value = e.target.value;
    setExperimentTitleICF(value);
    setIsValidTitleExp(value.trim().length > 0);
  };

  const handleNextExperiment = () => {
    setStep(step + 1);
  };

  const handleBackResearcher = () => {
    setStep(step - 1);
  };

  return (
    <FormStepContainer>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        {t('ICF')}
      </Typography>
      <TextField
        label={t('Experiment_title_ICF')}
        error={!isValidTitleExp}
        helperText={!isValidTitleExp ? t('invalid_name_message') : ''}
        variant="outlined"
        fullWidth
        margin="normal"
        value={ExperimentTitleICF}
        onChange={handleNameChangeTitle}
        required
      />

      <div style={{ width: '100%', marginTop: '16.5px', marginBottom: '16px' }}>
        <CustomContainer>
          <ReactQuill
            theme="snow"
            value={ExperimentDescICF}
            onChange={(value) => {
              setExperimentDescICF(value);
              setIsDescEmpty(stripHtml(value).length === 0);
            }}
            placeholder={t('ICF_desc')}
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

export default ExperimentICF;
