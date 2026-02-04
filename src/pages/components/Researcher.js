import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/axios";
import { Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import EditUser from "./EditUser";
import { ExperimentAccordion } from "../../components/Researcher/ExperimentAccordion";
import styles from "../../style/researcher.module.css";
import { LoadingState } from "../../components/Researcher/LoadingState";
import { TabView, TabPanel } from "primereact/tabview";

const experimentStatus = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  FINISHED: "FINISHED",
});

const Researcher = () => {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState(null);
  const [experimentsOwner, setOwnerExperiments] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const fetchAllExperiments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: ownedExperiments } = await api.get(
        `experiments2/owner/${user.id}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        },
      );

      const { data: participatedExperiments } = await api.get(
        `user-experiments2/user/${user.id}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        },
      );

      setExperiments(participatedExperiments);
      setOwnerExperiments(ownedExperiments);

      if (ownedExperiments.length > 0) {
        setActiveTab(0);
        setExpanded(`panel-owner-0`);
      } else if (participatedExperiments.length > 0) {
        setActiveTab(1);
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

  const handleAccessExperiment = async (experiment, userExperimentId, userExperimentStatus) => {
    if(userExperimentStatus === experimentStatus.NOT_STARTED) {
      await api.patch(`user-experiments2/${userExperimentId}`, { status: experimentStatus.IN_PROGRESS, startDate: new Date()},
      {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
    }
    navigate(`/experiments/${experiment._id}/surveys`);
  };

  const handleViewStats = (experimentId) => {
    navigate(`/experiments/${experimentId}/monitoring`);
  };

  const handleExportExperiment = async (experimentId) => {
    try {
      const response = await api.get(`experiments2/export/${experimentId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/x-yaml" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `experiment_export_${experimentId}.yaml`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      setError(t("export_error") || "Erro ao exportar experimento");
    }
  };

  const handleImportExperiment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".yaml") && !file.name.endsWith(".yml")) {
      setError(t("import_invalid_file"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post(
        `experiments2/import/${user.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      event.target.value = "";

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const translatedErrors = response.data.map(
          (errorKey) => t(errorKey) || errorKey,
        );
        setError(translatedErrors.join("\n"));
        return;
      }

      await fetchAllExperiments();

      if (response.data && response.data._id) {
        navigate(`/EditExperiment/${response.data._id}`);
      }
    } catch (error) {
      console.error("Import error:", error);
      if (
        error.response &&
        error.response.data &&
        Array.isArray(error.response.data)
      ) {
        const translatedErrors = error.response.data.map(
          (errorKey) => t(errorKey) || errorKey,
        );
        setError(translatedErrors.join("\n"));
      } else {
        setError(t("import_error"));
      }
      event.target.value = "";
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExperiment = (experimentId) => {
    const experiment = experimentsOwner?.find(
      (exp) => exp._id === experimentId,
    );

    // Só bloqueia edição se o status for IN_PROGRESS
    if (experiment && experiment.status === experimentStatus.IN_PROGRESS) {
      setError(
        t("cannot_edit_active_experiment") ||
          "Não é possível editar um experimento ativo. Desative-o primeiro.",
      );
      return;
    }

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

  const handleEditExperimentStatus = async (experimentId, currentStatus) => {
    const newStatus =
      currentStatus === experimentStatus.FINISHED
        ? experimentStatus.IN_PROGRESS
        : experimentStatus.FINISHED;

    try {
      await api.patch(
        `experiments2/${experimentId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        },
      );

      fetchAllExperiments();
    } catch (error) {
      setError(t("error_updating_status") || "Erro ao atualizar status");
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
    <div className={styles.researcherContainer}>
      <div className={styles.headerRow}>
        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        >
          <TabPanel header={t("researcher_experiments_title")} />
          <TabPanel header={t("available_experiments_title")} />
        </TabView>

        <div className={styles.buttonContainer}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleImportExperiment}
          >
            {t("import")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateExperiment}
          >
            {t("create_experiment_button")}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".yaml,.yml"
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className={styles.experimentList}>
        {isLoading && <LoadingState />}
        {error && (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        )}

        {activeTab === 0 && (
          <>
            {experimentsOwner?.length > 0 ? (
              experimentsOwner.map((experiment, index) => (
                <ExperimentAccordion
                  key={experiment._id}
                  experiment={experiment}
                  status={experiment.status}
                  expanded={expanded === `panel-owner-${index}`}
                  onChange={handleChange(`panel-owner-${index}`)}
                  onAccess={handleExportExperiment}
                  onEdit={handleEditExperiment}
                  onEditStatus={handleEditExperimentStatus}
                  onDelete={handleDeleteExperiment}
                  onEdituser={handleEditUser}
                  onViewStats={handleViewStats}
                  isOwner={true}
                  t={t}
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                <Typography variant="h6">{t("no_experiments")}</Typography>
                <Typography variant="body2">
                  Crie seu primeiro experimento no botão acima.
                </Typography>
              </div>
            )}
          </>
        )}

        {activeTab === 1 &&
          (experiments?.length > 0 ? (
            experiments.map((experiment, index) => (
              <ExperimentAccordion
                key={experiment.experiment._id}
                userExperimentId={experiment._id}
                userExperimentStatus={experiment.status}
                experiment={experiment.experiment}
                status={experiment.experiment.status}
                expanded={expanded === `panel-${index}`}
                onChange={handleChange(`panel-${index}`)}
                onAccess={handleAccessExperiment}
                onEdit={handleEditExperiment}
                onEdituser={handleEditUser}
                isOwner={false}
                t={t}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <Typography variant="h6">{t("no_experiments")}</Typography>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Researcher;
