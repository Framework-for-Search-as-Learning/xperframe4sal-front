/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
    Button,
    Typography,
} from '@mui/material';
import { api } from "../config/axios";
import { ExperimentStatus } from '../components/ExperimentStatus';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { t } from 'i18next';
import styles from '../style/experimentTemplate.module.css'

const mountSteps = (steps, stepsCompleted) => {
    steps = Object.entries(steps);

    steps = steps.sort((a, b) => a[1].order - b[1].order);

    const stepsToReturn = [];
    for (const [key, value] of steps) {
        stepsToReturn.push({ label: value["label"], completed: stepsCompleted[key], link: value["link"] || "" });
    }

    return stepsToReturn;
}

const ExperimentTemplate = ({ steps, headerTitle, children }) => {
    const { experimentId } = useParams();
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const completeds = steps.filter(step => step.completed);

    const handleFinish = async () => {
        try {
            const get_response = await api.get(`user-experiment?experimentId=${experimentId}&userId=${user.id}`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            const user_experiment = get_response.data

            const patch_responde = await api.patch(
                `user-experiment/${user_experiment._id}/finish`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            )

            if (patch_responde.data._id) {
                navigate('/experiments')
            } else {
                throw new Error('Erro desconhecido')
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    return (
        <>
            <ExperimentStatus steps={steps} completeds={completeds} />
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.0rem', sm: '1.2rem' } }}>
                {headerTitle}
            </Typography>
            {children}
            {steps.length === completeds.length && (
                <div className={styles.buttonContainer} >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFinish}
                    >
                        {t("finish")}
                    </Button>
                </div>
            )}
        </>
    );
}

export { ExperimentTemplate, mountSteps }