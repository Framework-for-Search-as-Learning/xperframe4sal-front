import React, {useContext} from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Alert,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {ArrowBack, ArrowForward} from '@mui/icons-material';
import StepContext from './context/StepContextCreate';
import FormStepContainer from "../../../components/Forms/FormStepContainer";

const StudyDesignForm = () => {
    const {t} = useTranslation();
    const {
        step,
        setStep,
        ExperimentType,
        setExperimentType,
        BtypeExperiment,
        setBtypeExperiment
    } = useContext(StepContext);

    const getMethodExplanation = () => {
        switch (BtypeExperiment) {
            case 'random':
                return t('explanation_random');
            case 'rules_based':
                return t('explanation_rules');
            case 'manual':
                return t('explanation_manual');
            default:
                return '';
        }
    };

    return (
        <FormStepContainer>
            <Typography variant="h6" align="center" sx={{mb: 2}}>
                {t('study_design')}
            </Typography>

            <FormControl fullWidth margin="normal">
                <InputLabel id="type-label">{t('Experiment_Type')}</InputLabel>
                <Select
                    labelId="type-label"
                    label={t('Experiment_Type')}
                    value={ExperimentType}
                    onChange={(e) => setExperimentType(e.target.value)}
                >
                    <MenuItem value="between-subject">{t('between-subject')}</MenuItem>
                    <MenuItem value="within-subject">{t('within-subject')}</MenuItem>
                </Select>
            </FormControl>

            {ExperimentType === 'within-subject' && (
                <Alert severity="info" variant="outlined" sx={{mt: 1, width: '100%'}}>
                    {t('explanation_within')}
                </Alert>
            )}

            {ExperimentType === 'between-subject' && (
                <>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="method-label">{t('Group_Separation_Method')}</InputLabel>
                        <Select
                            labelId="method-label"
                            label={t('Group_Separation_Method')}
                            value={BtypeExperiment}
                            onChange={(e) => setBtypeExperiment(e.target.value)}
                        >
                            <MenuItem value="random">{t('random')}</MenuItem>
                            <MenuItem value="rules_based">{t('rules_based')}</MenuItem>
                            <MenuItem value="manual">{t('manual')}</MenuItem>
                        </Select>
                    </FormControl>

                    <Alert
                        severity="info" variant="outlined" sx={{mt: 1, width: '100%'}}>
                        {getMethodExplanation()}
                    </Alert>
                </>
            )}
            <Box
                sx={{
                    display: {xs: 'none', sm: 'flex'},
                    justifyContent: 'space-between',
                    marginTop: 2,
                    width: '100%',
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setStep(step - 1)}
                    sx={{maxWidth: '150px'}}
                >
                    {t('back')}
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setStep(step + 1)}
                    sx={{maxWidth: '150px'}}
                >
                    {t('next')}
                </Button>
            </Box>

            <Box
                sx={{
                    display: {xs: 'flex', sm: 'none'},
                    justifyContent: 'space-between',
                    marginTop: 2,
                    width: '100%',
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setStep(step - 1)}
                    sx={{maxWidth: '150px'}}
                >
                    <ArrowBack/>
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setStep(step + 1)}
                    sx={{maxWidth: '150px'}}
                >
                    <ArrowForward/>
                </Button>
            </Box>
        </FormStepContainer>
    );
};

export default StudyDesignForm;