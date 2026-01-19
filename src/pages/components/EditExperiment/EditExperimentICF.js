import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import StepContext from './context/StepContext';
import 'react-quill/dist/quill.snow.css';
import { api } from '../../../config/axios';
import { Messages } from 'primereact/messages';

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

const EditExperimentICF = () => {
    const [
        ExperimentTitle,
        setExperimentTitle,
        ExperimentType,
        setExperimentType,
        BtypeExperiment,
        setBtypeExperiment,
        ExperimentDesc,
        setExperimentDesc,
        ExperimentId,
        setExperimentId,
        ExperimentSurveys,
        setExperimentSurveys,
    ] = useContext(StepContext);

    const { t } = useTranslation();
    const [isValidTitleExp, setIsValidTitleExp] = useState(true);
    const [Icfid, setIcfid] = useState('');
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [ExperimentTitleICF, setExperimentTitleICF] = useState('');
    const [ExperimentDescICF, setExperimentDescICF] = useState('');
    const msgs = useRef(null);


    const isValidFormExperiment = isValidTitleExp && ExperimentTitleICF?.trim().length > 0;

    const handleNameChangeTitle = (e) => {
        const value = e.target.value;
        setExperimentTitleICF(value);
        setIsValidTitleExp(value.trim().length > 0);
    };

    const fetchIcf = useCallback(async () => {
        try {
            const { data } = await api.get(`/icf2/experiment/${ExperimentId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            setExperimentTitleICF(data.title || '');
            setExperimentDescICF(data.description || '');
            setIcfid(data._id || '')
        } catch (err) {
            console.error('Error fetching experiment data:', err);
        }
    }, [ExperimentId, user.accessToken]);

    useEffect(() => {
        fetchIcf();
    }, [fetchIcf]);


    const handleEditExperimentSubmit = async (e) => {
        e.preventDefault();
        const icf = {
            title: ExperimentTitleICF,
            description: ExperimentDescICF,
        };

        try {
            await api.patch(`/icf2/${Icfid}`, icf, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            if (msgs.current) {
                msgs.current.clear();
                setTimeout(() => {
                    msgs.current.show({
                        severity: 'success',
                        summary: t('Success'),
                        life: 3000,
                    });
                }, 100);
            }
        } catch (error) {
            if (msgs.current) {
                msgs.current.clear();
                msgs.current.show({
                    severity: 'error',
                    summary: t('error'),
                    life: 3000,
                });
            }
            console.error('Erro na atualização da tarefa:', error);
        }
    };

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
                {t('edit_icf')}
            </Typography>
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
                        width: '100%',
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
                                    onChange={setExperimentDescICF}
                                    placeholder={t('ICF_desc')}
                                />
                            </CustomContainer>
                        </div>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginTop: 2,
                                width: '100%',
                            }}
                        >

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleEditExperimentSubmit}
                                sx={{ maxWidth: '150px' }}
                                disabled={!isValidFormExperiment}
                            >
                                {t('save')}
                            </Button>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                            zIndex: 1000,
                        }}
                    >
                        <Messages ref={msgs} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default EditExperimentICF;
