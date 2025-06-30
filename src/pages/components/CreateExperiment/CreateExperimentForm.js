import React, { useState, useContext } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import StepContext from './context/StepContextCreate';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
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

const CreateExperimentForm = () => {
    const {
        step,
        setStep,
        ExperimentTitle,
        setExperimentTitle,
        ExperimentType,
        setExperimentType,
        BtypeExperiment,
        setBtypeExperiment,
        ExperimentDesc,
        setExperimentDesc,
    } = useContext(StepContext);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isValidTitleExp, setIsValidTitleExp] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const ExperimentTypes = [
        { value: 'between-subject', label: t('between-subject') },
        { value: 'within-subject', label: t('within-subject') },
    ];

    const betweenExperimentTypes = [
        { value: 'random', label: t('random') },
        { value: 'rules_based', label: t('rules_based') },
        { value: 'manual', label: t('manual') },
    ];

    const isValidFormExperiment = isValidTitleExp && ExperimentTitle;
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

                    <FormControl fullWidth margin="normal">
                        <InputLabel>{t('Experiment_Type')}</InputLabel>
                        <Select
                            value={ExperimentType}
                            onChange={(e) => setExperimentType(e.target.value)}
                            label={t('Experiment_Type')}
                        >
                            {ExperimentTypes.map((stype) => (
                                <MenuItem key={stype.value} value={stype.value}>
                                    {stype.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {ExperimentType === 'between-subject' && (
                        <>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>{t('Group_Separation_Method')}</InputLabel>
                                <Select
                                    value={BtypeExperiment}
                                    onChange={(e) => setBtypeExperiment(e.target.value)}
                                    label={t('Group_Separation_Method')}
                                >
                                    {betweenExperimentTypes.map((stype) => (
                                        <MenuItem key={stype.value} value={stype.value}>
                                            {stype.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {BtypeExperiment === "manual" && (
                                <small style={{ color: 'red' }}>{t('manual_group_warning')}</small>
                            )}
                        </>
                    )}

                    <div style={{ width: '100%', marginTop: '16.5px', marginBottom: '16px' }}>
                        <CustomContainer >
                            <ReactQuill
                                theme="snow"
                                value={ExperimentDesc}
                                onChange={setExperimentDesc}
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

export default CreateExperimentForm;
