import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../config/axios";
import {
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DownloadIcon from "@mui/icons-material/Download";

// Componentes de visualização
import ParticipantsOverview from "../components/Monitoring/ParticipantsOverview";
import QuestionnaireAnalysis from "../components/Monitoring/Questionnaireanalysis";
import InteractionLogs from "../components/Monitoring/Interactionlogs";
import InteractionMetrics from "../components/Monitoring/Interactionmetrics";

// Mock data function - será substituído pela API real
const fetchExperimentMonitoringData = async (experimentId, data) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    experiment: {
      _id: experimentId,
      name: data.name,
      description: data.summary,
      status: data.status,
      createdAt: new Date(data.createdAt).toLocaleString,
    },
    overview: {
      totalParticipants: 25,
      completedParticipants: 15,
      inProgressParticipants: 7,
      notStartedParticipants: 3,
      completionRate: 60,
      averageCompletionTime: "25 min",
      lastResponseDate: "2026-02-03",
    },
    questionnaires: [
      {
        id: "q1",
        name: "Questionário Pré-experimento",
        responses: 20,
        questions: [
          {
            id: "q1_1",
            text: "Qual sua experiência com a tecnologia?",
            type: "multiple_choice",
            options: ["Iniciante", "Intermediário", "Avançado"],
            responses: {
              Iniciante: 8,
              Intermediário: 10,
              Avançado: 2,
            },
          },
          {
            id: "q1_2",
            text: "Quantas horas por dia você usa o computador?",
            type: "multiple_choice",
            options: ["0-2h", "2-4h", "4-6h", "6+h"],
            responses: {
              "0-2h": 3,
              "2-4h": 7,
              "4-6h": 6,
              "6+h": 4,
            },
          },
        ],
      },
      {
        id: "q2",
        name: "Questionário Pós-experimento",
        responses: 15,
        questions: [
          {
            id: "q2_1",
            text: "Como você avalia a experiência?",
            type: "likert",
            scale: 5,
            responses: {
              1: 1,
              2: 2,
              3: 5,
              4: 4,
              5: 3,
            },
          },
        ],
      },
    ],
    interactionMetrics: {
      totalSessions: 120,
      averageSessionTime: "18 min",
      totalMessages: 450,
      averageMessagesPerSession: 3.75,
      resourceAccess: {
        averageDepth: 2.3,
        maxDepth: 5,
        mostAccessedResources: [
          { name: "Tutorial Inicial", accessCount: 80 },
          { name: "Documentação", accessCount: 65 },
          { name: "FAQ", accessCount: 45 },
        ],
      },
      timeMetrics: {
        averageTimePerResource: {
          "Tutorial Inicial": "5 min",
          Documentação: "12 min",
          FAQ: "3 min",
        },
      },
    },
  };
};

const ExperimentMonitoring = () => {
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingData, setExportingData] = useState(false);

  const loadMonitoringData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`experiments2/${experimentId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });

      const monitoringData = await fetchExperimentMonitoringData(
        experimentId,
        data,
      );
      setData(monitoringData);
    } catch (err) {
      console.error("Error loading monitoring data:", err);
      setError(
        t("error_loading_monitoring") ||
          "Erro ao carregar dados de monitoramento",
      );
    } finally {
      setLoading(false);
    }
  }, [experimentId, user.accessToken, t]);

  useEffect(() => {
    loadMonitoringData();
  }, [loadMonitoringData]);

  const handleExportAllData = async () => {
    setExportingData(true);
    try {
      // TODO: Implementar chamada real da API
      // const response = await api.get(
      //   `experiments2/${experimentId}/export-all-data`,
      //   {
      //     headers: { Authorization: `Bearer ${user.accessToken}` },
      //     responseType: 'blob'
      //   }
      // );

      // Mock export
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockData = JSON.stringify(data, null, 2);
      const blob = new Blob([mockData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `experiment_${experimentId}_full_data.json`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting data:", err);
      setError(t("error_exporting_data") || "Erro ao exportar dados");
    } finally {
      setExportingData(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/experiments")}
        >
          {t("back") || "Voltar"}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/experiments")}
          sx={{ mb: 2 }}
        >
          {t("back") || "Voltar"}
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              <AssessmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {t("experiment_monitoring") || "Monitoramento do Experimento"}
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {data?.experiment?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {data?.experiment?.description}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={
              exportingData ? <CircularProgress size={20} /> : <DownloadIcon />
            }
            onClick={handleExportAllData}
            disabled={exportingData}
          >
            {exportingData
              ? t("exporting") || "Exportando..."
              : t("export_all_data") || "Exportar Todos os Dados"}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* <PeopleIcon sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} /> */}
                <Box>
                  <Typography variant="h4" color="primary">
                    {data?.overview?.totalParticipants || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t("total_participants") || "Total de Participantes"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* <CheckCircleIcon
                  sx={{ fontSize: 40, color: "#2e7d32", mr: 2 }}
                /> */}
                <Box>
                  <Typography variant="h4" color="primary">
                    {data?.overview?.completedParticipants || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t("completed") || "Finalizaram"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* <HourglassEmptyIcon
                  sx={{ fontSize: 40, color: "#ed6c02", mr: 2 }}
                /> */}
                <Box>
                  <Typography variant="h4" color="primary">
                    {data?.overview?.inProgressParticipants || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t("in_progress") || "Em Andamento"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* <AssessmentIcon
                  sx={{ fontSize: 40, color: "#1976d2", mr: 2 }}
                /> */}
                <Box>
                  <Typography variant="h4" color="primary">
                    {data?.overview?.completionRate || 0}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t("completion_rate") || "Taxa de Conclusão"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for detailed views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={t("participants") || "Participantes"} />
          <Tab label={t("questionnaires") || "Questionários"} />
          <Tab label={t("interaction_metrics") || "Métricas de Interação"} />
          <Tab label={t("interaction_logs") || "Logs de Interação"} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <ParticipantsOverview
            overview={data?.overview}
            experimentId={experimentId}
            accessToken={user.accessToken}
            t={t}
          />
        )}

        {activeTab === 1 && (
          <QuestionnaireAnalysis
            questionnaires={data?.questionnaires}
            experimentId={experimentId}
            accessToken={user.accessToken}
            t={t}
          />
        )}

        {activeTab === 2 && (
          <InteractionMetrics
            metrics={data?.interactionMetrics}
            experimentId={experimentId}
            accessToken={user.accessToken}
            t={t}
          />
        )}

        {activeTab === 3 && (
          <InteractionLogs
            experimentId={experimentId}
            accessToken={user.accessToken}
            t={t}
          />
        )}
      </Box>
    </Box>
  );
};

export default ExperimentMonitoring;
