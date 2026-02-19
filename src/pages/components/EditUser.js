/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../config/axios';
import {Typography, Box, CircularProgress} from '@mui/material';
import {useTranslation} from 'react-i18next';
import styles from "../../style/editUser.module.css"
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import EditUserArea from '../../components/EditUser/EditUsersArea';
import EditGroupArea from '../../components/EditUser/EditGroupArea';
import {People, Person} from '@mui/icons-material';
import {useParams} from "react-router-dom";
import {useExperimentAuth} from "../../hooks/useExperimentAuth";

const EditUser = () => {
    const {experimentId} = useParams();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const {t} = useTranslation();
    const [actualStep, setActualStep] = useState(null);

    const {isLoading, isAuthorized, data: experimentData} = useExperimentAuth(experimentId, user);

    useEffect(() => {
        if (isAuthorized && experimentData) {
            if (experimentData.typeExperiment === "between-subject" && experimentData.betweenExperimentType === "manual") {
                setActualStep(0);
            }
        }
    }, [isAuthorized, experimentData]);

    const STEPS = [
        {label: 'edit_users', icon: (<Person/>)},
        {label: 'edit_groups', icon: (<People/>)},
    ];

    const handleSwitchStep = (step) => {
        setActualStep(step);
    }

    const displayStep = () => {
        if (actualStep === 0)
            return <EditUserArea ExperimentId={{experimentId}}/>
        if (actualStep === 1)
            return <EditGroupArea ExperimentId={{experimentId}}/>

        return <EditUserArea ExperimentId={{experimentId}}/>
    }

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 2 }}>
                <CircularProgress />
                <Typography>{t('loading') || 'Verificando permissões...'}</Typography>
            </Box>
        );
    }
    if (!isAuthorized) return null;

    return (
        <div className={styles.fullPage}>
            <Typography variant="h4" component="h1" gutterBottom align="center" marginBottom={0}>
                {t('edit_user')}
            </Typography>

            {actualStep != null ? (
                <>
                    <div className={styles.stepContainer}>
                        {STEPS.map((step, index) => (
                            <div key={index} className={styles.stepSelector} onClick={() => handleSwitchStep(index)}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        backgroundColor: index === actualStep ? 'primary.main' : 'grey.300',
                                        color: index === actualStep ? 'white' : 'black',
                                        fontSize: '1.5rem',
                                        marginBottom: 1,
                                    }}
                                >
                                    {step.icon}
                                </Box>
                                <p className={index !== actualStep ? styles.inactiveText : undefined}>{t(step.label)}</p>
                            </div>
                        ))}
                    </div>

                    {displayStep()}
                </>
            ) : <EditUserArea ExperimentId={{experimentId}}/>}
        </div>
    );
};

export default EditUser;
