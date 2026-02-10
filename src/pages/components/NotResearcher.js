import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/axios";
import styles from "../../style/researcher.module.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LoadingIndicator } from "../../components/LoadIndicator";
import { useTranslation } from "react-i18next";

// Constants
const EXPERIMENT_STATUS = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  FINISHED: "FINISHED",
});

const STATUS_CONFIG = {
  active: {
    color: "#2e7d32",
    Icon: ToggleOnIcon,
    labelKey: "Ativo",
  },
  inactive: {
    color: "#757575",
    Icon: ToggleOffIcon,
    labelKey: "Inativo",
  },
};

const STATUS_REFRESH_INTERVAL = 30000; // 30 seconds

// Helper functions
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
    label: t?.(config.labelKey) ?? (inactive ? "Inativo" : "Ativo"),
    Icon: config.Icon,
    color: config.color,
  };
};

// Sub-component for Status Display
const StatusDisplay = ({ statusColor, StatusIcon, statusLabel }) => (
  <Box className={styles.statusWrapper}>
    <Box
      className={styles.statusContainer}
      sx={{ display: "flex", alignItems: "center", gap: 1 }}
    >
      <StatusIcon sx={{ fontSize: 25, color: statusColor }} />
      <Typography variant="body2" sx={{ color: "#424242" }}>
        Status: {statusLabel}
      </Typography>
    </Box>
  </Box>
);

// Sub-component for Experiment Accordion
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
  const {
    isInactive,
    label: statusLabel,
    Icon: StatusIcon,
    color: statusColor,
  } = getStatusConfig(experiment.status, t);

  return (
    <Accordion
      sx={{ marginBottom: "5px" }}
      elevation={3}
      expanded={expanded === `panel-${index}`}
      onChange={onExpand(`panel-${index}`)}
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
        <StatusDisplay
          statusColor={statusColor}
          StatusIcon={StatusIcon}
          statusLabel={statusLabel}
        />
        <Box sx={{ textAlign: "right" }}>
          <Button
            variant="contained"
            color="primary"
            style={{ margin: "16px" }}
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
  const { t } = useTranslation();

  const [experiments, setExperiments] = useState(null);
  const [expanded, setExpanded] = useState(`panel-0`);
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useState(JSON.parse(localStorage.getItem("user")));

  // Fetch experiments and their current status
  const fetchExperiments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userExperimentsData } = await api.get(
        `user-experiment/user/${user.id}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
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

  // Refresh experiment statuses without showing loading
  const refreshExperimentStatuses = useCallback(async () => {
    if (!experiments?.length) return;

    try {
      const updatedExperiments = await Promise.all(
        experiments.map(async (exp) => {
          try {
            const { data } = await api.get(
              `experiment/${exp.experiment._id}`,
              {
                headers: { Authorization: `Bearer ${user.accessToken}` },
              },
            );
            return data;
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

  // Initial fetch
  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  // Auto-refresh statuses
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
      const { data: experimentData } = await api.get(
        `experiment/${experiment._id}`,
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );

      if (experimentData.status !== EXPERIMENT_STATUS.IN_PROGRESS) {
        // Update local state with the new status
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
          { status: EXPERIMENT_STATUS.IN_PROGRESS, startDate: new Date() },
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
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

      {!experiments && isLoading && <LoadingIndicator size={70} />}

      {!experiments && !isLoading && (
        <Typography variant="body1">{t("loading_experiments")}</Typography>
      )}

      {experiments?.length === 0 && (
        <Box className={styles.emptyState}>
          <Typography variant="h6">{t("no_experiments")}</Typography>
        </Box>
      )}

      {experiments?.length > 0 &&
        experiments.map((experiment, index) => (
          <ExperimentItem
            key={experiment.experiment._id}
            experiment={experiment.experiment}
            userExperimentId={experiment._id}
            userExperimentStatus={experiment.status}
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
