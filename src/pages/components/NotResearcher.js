/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/axios";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Typography,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { LoadingIndicator } from "../../components/LoadIndicator";

import { useTranslation } from "react-i18next";

const NotResearcher = () => {
    const navigate = useNavigate();
    const [experiments, setExperiments] = useState(null);
    const [expanded, setExpanded] = useState(`panel-0`);
    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation();

    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const [userExperiments, setUserExperiments] = useState(null);

    useEffect(() => {
        const fetchExperimentData = async () => {
            setIsLoading(true);
            try {
                let response = await api.get(
                    `user-experiments?userId=${user.id}`,
                    { headers: { Authorization: `Bearer ${user.accessToken}` } }
                );
                const userExperimentsData = response.data;
                let experimentList = [];
                if (userExperimentsData?.length > 0) {
                    setUserExperiments(userExperimentsData);
                    for (let i = 0; i < userExperimentsData.length; i++) {
                        if (!userExperimentsData[i].hasFinished) {
                            response = await api.get(
                                `experiments/${userExperimentsData[i].experiment_id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${user.accessToken}`,
                                    },
                                }
                            );
                            experimentList.push(response.data);
                        }
                    }
                }
                setExperiments(experimentList);
            } catch (error) {
                /**
                 * TODO:
                 */
            }
            setIsLoading(false);
        };

        fetchExperimentData();
    }, [user?.id, user?.accessToken]);

    const handleClick = (experimentId) => {
        navigate(`/experiments/${experimentId}/surveys`);
    };

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>
                {t("see_experiment_list_title")}
            </Typography>

            {!experiments && (
                <Typography variant="body1">
                    {t("loading_experiments")}
                </Typography>
            )}

            {!experiments && isLoading && <LoadingIndicator size={70} />}

            {experiments?.length === 0 && (
                <Typography variant="body1">{t("no_experiments")}</Typography>
            )}

            {experiments &&
                experiments.map((experiment, index) => (
                    <Accordion
                        sx={{ marginBottom: "5px" }}
                        key={experiment._id}
                        elevation={3}
                        expanded={expanded === `panel-${index}`}
                        onChange={handleChange(`panel-${index}`)}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${index}bh-content`}
                            id={`panel-${index}bh-header`}
                            sx={{
                                "&:hover": {
                                    backgroundColor: "lightgray",
                                },
                            }}
                            title={t("accordion_summary_hover")}
                        >
                            <Typography>{experiment.name}</Typography>
                        </AccordionSummary>
                        <Divider />
                        <AccordionDetails>
                            <Typography
                                dangerouslySetInnerHTML={{
                                    __html: experiment.summary,
                                }}
                            />
                            <div style={{ textAlign: "right" }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{ margin: "16px" }}
                                    onClick={() => handleClick(experiment._id)}
                                >
                                    {t("Access")}
                                </Button>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                ))}
        </>
    );
};

export default NotResearcher;
