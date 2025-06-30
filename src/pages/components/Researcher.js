import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/axios";
import { Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import EditUser from "./EditUser";
import { ExperimentAccordion } from "../../components/Researcher/ExperimentAccordion";
import { LoadingState } from "../../components/Researcher/LoadingState";

const Researcher = () => {
    const navigate = useNavigate();
    const [experiments, setExperiments] = useState(null);
    const [experimentsOwner, setOwnerExperiments] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const { t } = useTranslation();

    const fetchAllExperiments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            /*
      const { data: allExperiments } = await api.get('experiments2', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      */

            const { data: ownedExperiments } = await api.get(
                `experiments2/owner/${user.id}`,
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );

            const { data: participatedExperiments } = await api.get(
                `user-experiments2/user/${user.id}`,
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );

            /*
      const participatedExperiments = [];
      const ownedExperiments = [];
      */
            /*
            allExperiments.forEach((experiment) => {
                if (experiment.owner_id === user.id) {
                    ownedExperiments.push(experiment);
                } else if (experiment.userProps?.includes(user.id)) {
                    participatedExperiments.push(experiment);
                }
            });
            */

            setExperiments(participatedExperiments);
            setOwnerExperiments(ownedExperiments);

            if (ownedExperiments.length > 0) {
                setExpanded(`panel-owner-0`);
            } else if (participatedExperiments.length > 0) {
                setExpanded(`panel-0`);
            }
        } catch (err) {
            setError(t("error_loading_experiments"));
        } finally {
            setIsLoading(false);
        }
    }, [user.accessToken, user.id, t]);

    useEffect(() => {
        fetchAllExperiments();
    }, [fetchAllExperiments]);

    const handleCreateExperiment = () => navigate("/CreateExperiment");

    const handleAccessExperiment = (experimentId) => {
        navigate(`/experiments/${experimentId}/surveys`);
    };

    const handleEditExperiment = (experimentId) => {
        navigate(`/EditExperiment/${experimentId}`);
    };

    const handleDeleteExperiment = async (experimentId) => {
        try {
            await api.delete(`experiments2/${experimentId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            fetchAllExperiments();
        } catch (error) {
            setError(t("error_deleting_experiment"));
        }
    };

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : null);
    };

    const handleEditUser = (experimentId) => {
        setEditingUser(experimentId);
    };

    if (editingUser) {
        return <EditUser experimentId={editingUser} />;
    }

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    marginBottom: "16px",
                }}
            >
                <Typography variant="h6" gutterBottom>
                    {t("researcher_experiments_title")}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateExperiment}
                >
                    {t("create_experiment_button")}
                </Button>
            </div>

            {isLoading && <LoadingState />}
            {error && (
                <Typography
                    variant="body1"
                    color="error"
                    style={{ marginTop: "16px" }}
                >
                    {error}
                </Typography>
            )}

            {experimentsOwner?.length > 0
                ? experimentsOwner.map((experiment, index) => (
                      <ExperimentAccordion
                          key={experiment._id}
                          experiment={experiment}
                          expanded={expanded === `panel-owner-${index}`}
                          onChange={handleChange(`panel-owner-${index}`)}
                          onAccess={handleAccessExperiment}
                          onEdit={handleEditExperiment}
                          onDelete={handleDeleteExperiment}
                          onEdituser={handleEditUser}
                          isOwner={true}
                          t={t}
                      />
                  ))
                : !isLoading && <Typography>{t("no_experiments")}</Typography>}

            <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
                {t("see_experiment_list_title")}
            </Typography>

            {experiments?.length > 0
                ? experiments.map((experiment, index) => (
                      <ExperimentAccordion
                          key={experiment._id}
                          experiment={experiment}
                          expanded={expanded === `panel-${index}`}
                          onChange={handleChange(`panel-${index}`)}
                          onAccess={handleAccessExperiment}
                          onEdit={handleEditExperiment}
                          onEdituser={handleEditUser}
                          isOwner={false}
                          t={t}
                      />
                  ))
                : !isLoading && <Typography>{t("no_experiments")}</Typography>}
        </>
    );
};

export default Researcher;
