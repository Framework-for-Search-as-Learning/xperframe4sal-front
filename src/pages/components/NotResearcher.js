import {useEffect, useState, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {api} from "../../config/axios";
import styles from "../../style/researcher.module.css";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Typography,
    Divider,
    Box,
    Tooltip,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {LoadingIndicator} from "../../components/LoadIndicator";
import {useTranslation} from "react-i18next";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const EXPERIMENT_STATUS = Object.freeze({
    NOT_STARTED: "NOT_STARTED",
    IN_PROGRESS: "IN_PROGRESS",
    FINISHED: "FINISHED",
});

const STATUS_CONFIG = {
    active: {
        color: "#2e7d32",
        Icon: CheckCircleIcon,
        labelKey: "experiment_status_active",
        tooltipKey: "experiment_status_active_tooltip",
    },
    inactive: {
        color: "#757575",
        Icon: CancelIcon,
        labelKey: "experiment_status_inactive",
        tooltipKey: "experiment_status_inactive_tooltip",
    },
};

const STATUS_REFRESH_INTERVAL = 30000;

const normalizeStatus = (status) => {
    return (status ?? "").toString().trim().toUpperCase();
};

const isStatusInactive = (status) => {
    const normalized = normalizeStatus(status);
    return normalized === EXPERIMENT_STATUS.FINISHED;
};

const getStatusConfig = (status, t) => {
    const inactive = isStatusInactive(status);
    const config = inactive ? STATUS_CONFIG.inactive : STATUS_CONFIG.active;

    return {
        isInactive: inactive,
        label: t(config.labelKey),
        tooltip: t(config.tooltipKey),
        Icon: config.Icon,
        color: config.color,
    };
};

const StatusDisplay = ({statusColor, StatusIcon, statusLabel, statusTooltip}) => (
    <Box className={styles.statusWrapper}>
        <Box
            className={styles.statusContainer}
            sx={{display: "flex", alignItems: "center", gap: 1}}
        >
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                <StatusIcon sx={{fontSize: 20, color: statusColor}}/>
                <Typography variant="body2" sx={{color: "#424242"}}>
                    {statusLabel}
                </Typography>
            </Box>
            <Tooltip title={statusTooltip} arrow placement="top" enterDelay={200}>
                <InfoOutlinedIcon
                    sx={{
                        fontSize: 18,
                        color: '#757575',
                        cursor: 'pointer',
                        ml: 0.5
                    }}
                />
            </Tooltip>
        </Box>
    </Box>
);

const ExperimentItem = ({
                            experiment,
                            userExperimentId,
                            userExperimentStatus,
                            index,
                            expanded,
                            onExpand,
                            onAccess,
                            t,
                        }) => {
    if (!experiment) {
        console.warn("ExperimentItem: experiment is undefined");
        return null;
    }
    const {
        isInactive,
        label: statusLabel,
        tooltip: statusTooltip,
        Icon: StatusIcon,
        color: statusColor,
    } = getStatusConfig(experiment.status, t);

    return (
        <Accordion
            sx={{marginBottom: '5px', border: '1px solid #e0e0e0'}}
            elevation={0}
            expanded={expanded === `panel-${index}`}
            onChange={onExpand(`panel-${index}`)}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls={`panel-${index}bh-content`}
                id={`panel-${index}bh-header`}
                sx={{'&:hover': {backgroundColor: '#f5f5f5'}}}
                title={t("accordion_summary_hover")}
            >
                <Typography>{experiment.name}</Typography>
            </AccordionSummary>
            <Divider/>
            <AccordionDetails>
                <Typography
                    dangerouslySetInnerHTML={{
                        __html: experiment.summary,
                    }}
                />
                <StatusDisplay
                    statusColor={statusColor}
                    StatusIcon={StatusIcon}
                    statusLabel={statusLabel}
                    statusTooltip={statusTooltip}
                />
                <Box sx={{textAlign: "right"}}>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{margin: "16px"}}
                        onClick={() =>
                            onAccess(experiment, userExperimentId, userExperimentStatus)
                        }
                        disabled={isInactive}
                    >
                        {t("Access")}
                    </Button>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

const NotResearcher = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();

    const [experiments, setExperiments] = useState(null);
    const [expanded, setExpanded] = useState(`panel-0`);
    const [isLoading, setIsLoading] = useState(false);
    const [user] = useState(JSON.parse(localStorage.getItem("user")));

    const fetchExperiments = useCallback(async () => {
        setIsLoading(true);
        try {
            const {data: userExperimentsData} = await api.get(
                `user-experiment/user/${user.id}`,
                {
                    headers: {Authorization: `Bearer ${user.accessToken}`},
                },
            );

            if (!userExperimentsData?.length) {
                setExperiments([]);
                return;
            }

            setExperiments(userExperimentsData);
        } catch (error) {
            console.error("Error fetching experiments:", error);
            setExperiments([]);
        } finally {
            setIsLoading(false);
        }
    }, [user.id, user.accessToken]);

    const refreshExperimentStatuses = useCallback(async () => {
        if (!experiments?.length) return;

        try {
            const updatedExperiments = await Promise.all(
                experiments.map(async (exp) => {
                    try {
                        const {data} = await api.get(
                            `experiment/${exp.experiment._id}`,
                            {
                                headers: {Authorization: `Bearer ${user.accessToken}`},
                            },
                        );
                        return {
                            ...exp,
                            experiment: data
                        };
                    } catch (error) {
                        console.error(`Error refreshing experiment ${exp._id}:`, error);
                        return exp;
                    }
                }),
            );

            setExperiments(updatedExperiments);
        } catch (error) {
            console.error("Error refreshing statuses:", error);
        }
    }, [experiments, user.accessToken]);

    useEffect(() => {
        fetchExperiments();
    }, [fetchExperiments]);

    useEffect(() => {
        if (!experiments?.length) return;

        const intervalId = setInterval(
            refreshExperimentStatuses,
            STATUS_REFRESH_INTERVAL,
        );

        return () => clearInterval(intervalId);
    }, [experiments, refreshExperimentStatuses]);

    const handleAccessExperiment = async (
        experiment,
        userExperimentId,
        userExperimentStatus,
    ) => {
        try {
            const {data: experimentData} = await api.get(
                `experiment/${experiment._id}`,
                {headers: {Authorization: `Bearer ${user.accessToken}`}},
            );

            if (experimentData.status !== EXPERIMENT_STATUS.IN_PROGRESS) {
                setExperiments((prev) =>
                    prev.map((exp) =>
                        exp.experiment._id === experiment._id
                            ? {
                                ...exp,
                                experiment: {
                                    ...exp.experiment,
                                    status: experimentData.status,
                                },
                            }
                            : exp,
                    ),
                );
                return;
            }

            if (userExperimentStatus === EXPERIMENT_STATUS.NOT_STARTED) {
                await api.patch(
                    `user-experiment/${userExperimentId}`,
                    {status: EXPERIMENT_STATUS.IN_PROGRESS, startDate: new Date()},
                    {
                        headers: {Authorization: `Bearer ${user.accessToken}`},
                    },
                );
            }

            navigate(`/experiments/${experiment._id}/surveys`);
        } catch (error) {
            console.error("Error accessing experiment:", error);
        }
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>
                {t("see_experiment_list_title")}
            </Typography>

            {!experiments && isLoading && <LoadingIndicator size={70}/>}

            {!experiments && !isLoading && (
                <Typography variant="body1">{t("loading_experiments")}</Typography>
            )}

            {experiments?.length === 0 && (
                <Box className={styles.emptyState}>
                    <Typography variant="h6">{t("no_experiments")}</Typography>
                </Box>
            )}

            {experiments?.length > 0 &&
                experiments
                    .filter(exp => exp?.experiment)
                    .map((experiment, index) => (
                        <ExperimentItem
                            key={experiment.experiment?._id}
                            experiment={experiment.experiment}
                            userExperimentId={experiment?._id}
                            userExperimentStatus={experiment?.status}
                            index={index}
                            expanded={expanded}
                            onExpand={handleAccordionChange}
                            onAccess={handleAccessExperiment}
                            t={t}
                        />
                    ))}
        </>
    );
};

export default NotResearcher;
