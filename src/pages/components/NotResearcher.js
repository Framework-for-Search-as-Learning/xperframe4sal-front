import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/axios";
import styles from '../../style/researcher.module.css'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Typography,
    Divider,
} from "@mui/material";
import BlockIcon from '@mui/icons-material/Block'; 
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
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
    
        const resolveStatus = (s, exp) => {
                const raw = (s ?? exp?.status ?? '').toString().trim().toLowerCase();
                const inactiveValues = ['finished', 'inactive', 'inativo', 'completed', 'done', 'false', '0'];
                const isInactive = inactiveValues.includes(raw);
                const label = isInactive ? (t ? t('inactive') : 'Inativo') : (t ? t('active') : 'Ativo');
                const Icon = isInactive ? BlockIcon : PlayCircleOutlineIcon;
                const color = isInactive ? '#757575' : '#2e7d32';
                return { isInactive, label, Icon, color };
        };


    useEffect(() => {
        const fetchExperimentData = async () => {
            setIsLoading(true);
            try {
                let response = await api.get(
                    `user-experiments2?userId=${user.id}`,
                    { headers: { Authorization: `Bearer ${user.accessToken}` } }
                );
                const userExperimentsData = response.data;
                let experimentList = [];
                if (userExperimentsData?.length > 0) {
                    setUserExperiments(userExperimentsData);
                    for (let i = 0; i < userExperimentsData.length; i++) {
                        if (!userExperimentsData[i].hasFinished) {
                            response = await api.get(
                                `experiments2/${userExperimentsData[i].experiment_id}`,
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

    const handleClick = async (experimentId) => {

        const res = await api.get(
            `experiments2/${experimentId}/status`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
            }
        );

        const status = res.data

        if(status !== "IN_PROGRESS") {
            location.reload();
            return;
        }
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
                <div className={styles.emptyState}>
                    <Typography variant="h6">{t("no_experiments")}</Typography>
                </div>
            )}

            {experiments &&
                experiments.map((experiment, index) => {
                    const { isInactive, label: statusLabel, Icon: StatusIcon, color: statusColor } = resolveStatus(null, experiment);
                    return (
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
                            <div className={styles.statusWrapper}>
                                <div className={styles.statusContainer}>
                                    <StatusIcon sx={{ fontSize: 18, color: statusColor }} />
                                    <Typography variant="body2" sx={{ color: '#424242' }}>
                                        Status: {statusLabel}
                                    </Typography>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{ margin: "16px" }}
                                    onClick={() => handleClick(experiment._id)}
                                    disabled={isInactive}
                                >
                                    {t("Access")}
                                </Button>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                    );
                })}
        </>
    );
};

export default NotResearcher;
