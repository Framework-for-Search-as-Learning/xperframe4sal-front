import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/axios";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import EditUser from "./EditUser";
import { ExperimentAccordion } from "../../components/Researcher/ExperimentAccordion";
import styles from "../../style/researcher.module.css";
import { LoadingState } from "../../components/Researcher/LoadingState";
import { TabView, TabPanel } from "primereact/tabview";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AssessmentIcon from "@mui/icons-material/Assessment";

const experimentStatus = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  FINISHED: "FINISHED",
});

// Mock data function - será substituído pela API real
const fetchExperimentStats = async (experimentId, accessToken) => {
  // Simula delay da API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Retorna dados mockados
  return {
    totalParticipants: 2,
    completedParticipants: 1,
    inProgressParticipants: 0,
    notStartedParticipants: 1,
    completionRate: 50,
    averageCompletionTime: "15 min",
    lastResponseDate: "2026-01-28",
  };
};

// Mock function for exporting results
const exportExperimentResults = async (experimentId, accessToken) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simula download de arquivo CSV
  const mockData =
    "participant_id,completion_date,responses\n1,2026-01-20,completed\n2,2026-01-21,completed";
  const blob = new Blob([mockData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `experiment_results_${experimentId}.csv`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const ExperimentStatsModal = ({
  open,
  onClose,
  experimentId,
  experimentName,
  accessToken,
  t,
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (open && experimentId) {
      loadStats();
    }
  }, [open, experimentId]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Substituir por chamada real da API quando disponível
      // const { data } = await api.get(`experiments2/${experimentId}/stats`, {
      //   headers: { Authorization: `Bearer ${accessToken}` }
      // });
      const data = await fetchExperimentStats(experimentId, accessToken);
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
      setError(t("error_loading_stats") || "Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = async () => {
    setExporting(true);
    try {
      // TODO: Substituir por chamada real da API quando disponível
      // await api.get(`experiments2/${experimentId}/export-results`, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      //   responseType: 'blob'
      // });
      await exportExperimentResults(experimentId, accessToken);
    } catch (err) {
      console.error("Error exporting results:", err);
      setError(t("error_exporting_results") || "Erro ao exportar resultados");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssessmentIcon color="primary" />
          <Typography variant="h6">
            {t("Estatísticas do Experimento") || "Estatísticas do Experimento"}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {experimentName}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}

        {!loading && !error && stats && (
          <Box sx={{ py: 2 }}>
            {/* Total Participants */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <PeopleIcon sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} />
              <Box>
                <Typography variant="h4" color="primary">
                  {stats.totalParticipants}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t("Total de Participantes") || "Total de Participantes"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Completed Participants */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 32, color: "#2e7d32", mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="success.main">
                  {stats.completedParticipants}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t("Finalizaram") || "Finalizaram"}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {stats.completionRate}%
              </Typography>
            </Box>

            {/* In Progress */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <HourglassEmptyIcon
                sx={{ fontSize: 32, color: "#ed6c02", mr: 2 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="warning.main">
                  {stats.inProgressParticipants}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t("Em andamento") || "Em andamento"}
                </Typography>
              </Box>
            </Box>

            {/* Not Started */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PeopleIcon sx={{ fontSize: 32, color: "#757575", mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="textSecondary">
                  {stats.notStartedParticipants}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t("Não iniciaram") || "Não iniciaram"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          {t("close") || "Fechar"}
        </Button>
        <Button
          onClick={handleExportResults}
          variant="contained"
          color="primary"
          disabled={exporting || loading || !stats}
          startIcon={exporting ? <CircularProgress size={16} /> : null}
        >
          {exporting
            ? t("exporting") || "Exportando..."
            : t("Exportar Resultados") || "Exportar Resultados"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Researcher = () => {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState(null);
  const [experimentsOwner, setOwnerExperiments] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [statsModal, setStatsModal] = useState({
    open: false,
    experimentId: null,
    experimentName: null,
  });
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

      console.log("ownedExperiments: ", ownedExperiments);

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

  const handleAccessExperiment = (experimentId) => {
    navigate(`/experiments/${experimentId}/surveys`);
  };

  const handleViewStats = (experimentId, experimentName) => {
    setStatsModal({ open: true, experimentId, experimentName });
  };

  const handleCloseStatsModal = () => {
    setStatsModal({ open: false, experimentId: null, experimentName: null });
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
                key={experiment._id}
                experiment={experiment}
                status={experiment.status}
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

      {/* Stats Modal */}
      <ExperimentStatsModal
        open={statsModal.open}
        onClose={handleCloseStatsModal}
        experimentId={statsModal.experimentId}
        experimentName={statsModal.experimentName}
        accessToken={user.accessToken}
        t={t}
      />
    </div>
  );
};

export default Researcher;
