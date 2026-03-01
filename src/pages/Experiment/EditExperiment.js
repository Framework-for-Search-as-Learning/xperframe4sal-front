/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { api } from '../../config/axios';
import 'react-quill/dist/quill.snow.css';
import {
    Box, Typography, List, ListItemButton, ListItemIcon,
    Divider, ListItemText, Drawer, CircularProgress
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ListAltIcon from '@mui/icons-material/ListAlt';
import QuizIcon from '@mui/icons-material/Quiz';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useExperimentAuth } from "../../hooks/useExperimentAuth";
import { Messages } from 'primereact/messages';
import ExperimentMetadataForm from '../components/CreateExperiment/ExperimentMetadataForm';
import StudyDesignForm from '../components/CreateExperiment/StudyDesignForm';
import CreateExperimentICF from '../components/CreateExperiment/CreateExperimentICF';
import CreateExperimentQuestionnaire from '../components/CreateExperiment/CreateExperimentQuestionnaire';
import CreateExperimentTask from '../components/CreateExperiment/CreateExperimentTask';

import StepContext from '../components/CreateExperiment/context/StepContextCreate';

const drawerWidth = 300;
const appBarHeight = 64;

const EditExperiment = () => {
    const { t } = useTranslation();
    const { experimentId } = useParams();
    const msgs = useRef(null);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));

    const { isLoading, isAuthorized, data: experimentData } = useExperimentAuth(experimentId, user);

    const [step, setStep] = useState(0);
    const [ExperimentTitle, setExperimentTitle] = useState('');
    const [ExperimentType, setExperimentType] = useState('within-subject');
    const [BtypeExperiment, setBtypeExperiment] = useState('random');
    const [ExperimentDesc, setExperimentDesc] = useState('');

    const [Icfid, setIcfid] = useState('');
    const [ExperimentTitleICF, setExperimentTitleICF] = useState('');
    const [ExperimentDescICF, setExperimentDescICF] = useState('');

    const [ExperimentTasks, setExperimentTasks] = useState([]);
    const [ExperimentSurveys, setExperimentSurveys] = useState([]);

    const steps = [
        { label: t('edit_form'), icon: <EditNoteIcon /> },
        { label: t('edit_icf'), icon: <AssignmentIndIcon /> },
        { label: t('step_questionnaires'), icon: <QuizIcon /> },
        { label: t('study_design'), icon: <SettingsIcon /> },
        { label: t('edit_task'), icon: <ListAltIcon /> },
    ];

    useEffect(() => {
        if (isAuthorized && experimentData) {
            setExperimentTitle(experimentData.name || '');
            setExperimentType(experimentData.typeExperiment || 'within-subject');
            setBtypeExperiment(experimentData.betweenExperimentType || 'random');
            setExperimentDesc(experimentData.summary || '');

            fetchIcf();
            fetchSurvey()
            fetchTasks();
        }
    }, [isAuthorized, experimentData, experimentId]);

    const fetchIcf = useCallback(async () => {
        try {
            const { data } = await api.get(`/icf/experiment/${experimentId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            setExperimentTitleICF(data.title || '');
            setExperimentDescICF(data.description || '');
            setIcfid(data._id || '');
        } catch (err) {
            console.error('Error fetching ICF:', err);
        }
    }, [experimentId, user.accessToken]);

    const fetchSurvey = useCallback(async () => {
        try {
            const response = await api.get(`/survey/experiment/${experimentId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            setExperimentSurveys(response.data);
        } catch (error) {
            console.error('Error fetching surveys:', error);
        }
    }, [experimentId, user.accessToken]);

    const fetchTasks = useCallback(async () => {
        try {
            const response = await api.get(`/task/experiment/${experimentId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            setExperimentTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, [experimentId, user.accessToken]);

    const handleSaveExperiment = async () => {
        try {
            if (step === 0 || step === 3) {
                const updatedExperiment = {
                    name: ExperimentTitle,
                    summary: ExperimentDesc,
                    typeExperiment: ExperimentType,
                    betweenExperimentType: BtypeExperiment,
                };
                await api.patch(`/experiment/${experimentId}`, updatedExperiment, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });
            }
            else if (step === 1) {
                const updatedIcf = {
                    title: ExperimentTitleICF,
                    description: ExperimentDescICF,
                };
                await api.patch(`/icf/${Icfid}`, updatedIcf, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });
            }

            if (msgs.current) msgs.current.show({ severity: 'success', summary: t('Success'), life: 3000 });
        } catch (error) {
            if (msgs.current) msgs.current.show({ severity: 'error', summary: t('error'), life: 3000 });
            console.error('Erro ao salvar:', error);
        }
    };

    if (isLoading) return <CircularProgress />;
    if (!isAuthorized) return null;

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, top: appBarHeight, height: `calc(100% - ${appBarHeight}px)`, backgroundColor: '#f9f9f9' } }}>
                <List>
                    <Typography align="center" variant="h6" sx={{ p: 1 }}>{t('edit_experiment')}</Typography>
                    <Divider />
                    {steps.map((s, index) => (
                        <ListItemButton key={s.label} selected={index === step} onClick={() => setStep(index)} sx={{ borderRadius: 2, mx: 1, my: 0.5, backgroundColor: index === step ? 'primary.light' : 'transparent' }}>
                            <ListItemIcon>{s.icon}</ListItemIcon>
                            <ListItemText primary={s.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, position: 'relative' }}>
                <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
                    <Messages ref={msgs} />
                </Box>

                <StepContext.Provider
                    value={{
                        step, setStep,
                        isEditMode: true,
                        handleSaveExperiment,
                        ExperimentTitle, setExperimentTitle,
                        ExperimentType, setExperimentType,
                        BtypeExperiment, setBtypeExperiment,
                        ExperimentDesc, setExperimentDesc,
                        ExperimentTitleICF, setExperimentTitleICF,
                        ExperimentDescICF, setExperimentDescICF,
                        ExperimentSurveys, setExperimentSurveys,
                        ExperimentTasks, setExperimentTasks,
                    }}
                >
                    {step === 0 && <ExperimentMetadataForm />}
                    {step === 1 && <CreateExperimentICF />}
                    {step === 2 && <CreateExperimentQuestionnaire />}
                    {step === 3 && <StudyDesignForm />}
                    {step === 4 && <CreateExperimentTask />}
                </StepContext.Provider>
            </Box>
        </Box>
    );
};

export default EditExperiment;