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
import AssessmentIcon from "@mui/icons-material/Assessment";
import DownloadIcon from "@mui/icons-material/Download";

import ParticipantsOverview from "../components/Monitoring/ParticipantsOverview";
import QuestionnaireAnalysis from "../components/Monitoring/Questionnaireanalysis";
import InteractionLogs from "../components/Monitoring/Interactionlogs";
import InteractionMetrics from "../components/Monitoring/Interactionmetrics";
import {useExperimentAuth} from "../hooks/useExperimentAuth";

const ExperimentMonitoring = () => {
    const { experimentId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const user = JSON.parse(localStorage.getItem("user"));

    const { isLoading: authLoading, isAuthorized, data: authData } = useExperimentAuth(experimentId, user);

    const [activeTab, setActiveTab] = useState(0);
    const [experimentData, setExperimentData] = useState(null);
    const [statsData, setStatsData] = useState(null);
    const [participantsData, setParticipantsData] = useState(null);
    const [surveysStatsData, setSurveysStatsData] = useState(null);
    const [tasksExecutionData, setTasksExecutionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportingData, setExportingData] = useState(false);

    const loadMonitoringData = useCallback(async () => {
        if (!isAuthorized) return;

        setLoading(true);
        setError(null);
        try {
            setExperimentData(authData);

            const [stats, participants, surveysStats, tasksExecution] = await Promise.all([
                api.get(`experiment/${experimentId}/stats`, { headers: { Authorization: `Bearer ${user.accessToken}` } }),
                api.get(`experiment/${experimentId}/participants`, { headers: { Authorization: `Bearer ${user.accessToken}` } }),
                api.get(`experiment/${experimentId}/surveys-stats`, { headers: { Authorization: `Bearer ${user.accessToken}` } }),
                api.get(`experiment/${experimentId}/tasks-execution`, { headers: { Authorization: `Bearer ${user.accessToken}` } })
            ]);

            setStatsData(stats.data);
            setParticipantsData(participants.data);
            setSurveysStatsData(surveysStats.data);
            setTasksExecutionData(tasksExecution.data);
        } catch (err) {
            console.error("Error loading monitoring data:", err);
            setError(
                t("error_loading_monitoring") ||
                "Erro ao carregar dados de monitoramento",
            );
        } finally {
            setLoading(false);
        }
    }, [experimentId, user.accessToken, t, isAuthorized, authData]);

    useEffect(() => {
        if (isAuthorized) {
            loadMonitoringData();
        }
    }, [isAuthorized, loadMonitoringData]);

    const handleExportAllData = async () => {
        setExportingData(true);
        try {
            const allData = {
                experiment: experimentData,
                stats: statsData,
                participants: participantsData,
                surveysStats: surveysStatsData,
                tasksExecution: tasksExecutionData,
                exportDate: new Date().toISOString(),
            };

            await new Promise((resolve) => setTimeout(resolve, 1000));
            const jsonData = JSON.stringify(allData, null, 2);
            const blob = new Blob([jsonData], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `experiment_${experimentId}_full_data_${new Date().toISOString().split('T')[0]}.json`;
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

    if (authLoading || (isAuthorized && loading)) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error || !isAuthorized) {
        if (!isAuthorized && !authLoading) return null;
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/experiments")}>
                    {t("back") || "Voltar"}
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
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
                            {experimentData?.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {experimentData?.summary?.replace(/<[^>]*>/g, '')}
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

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Box>
                                    <Typography variant="h4" color="primary">
                                        {statsData?.totalParticipants || 0}
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
                                <Box>
                                    <Typography variant="h4" color="primary">
                                        {statsData?.finishedParticipants || 0}
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
                                <Box>
                                    <Typography variant="h4" color="primary">
                                        {statsData?.inProgressParticipants || 0}
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
                                <Box>
                                    <Typography variant="h4" color="primary">
                                        {statsData?.completionPercentage?.toFixed(1) || 0}%
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
                    {/*<Tab label={t("interaction_logs") || "Logs de Interação"}/>*/}
                </Tabs>
            </Paper>

            <Box>
                {activeTab === 0 && (
                    <ParticipantsOverview
                        participants={participantsData}
                        stats={statsData}
                        experimentId={experimentId}
                        accessToken={user.accessToken}
                        t={t}
                    />
                )}

                {activeTab === 1 && (
                    <QuestionnaireAnalysis
                        surveysStats={surveysStatsData}
                        participants={participantsData}
                        accessToken={user.accessToken}
                        t={t}
                    />
                )}

                {activeTab === 2 && (
                    <InteractionMetrics
                        tasksExecution={tasksExecutionData}
                        participants={participantsData}
                        experimentId={experimentId}
                        accessToken={user.accessToken}
                        t={t}
                    />
                )}

                {/*{activeTab === 3 && (*/}
                {/*    <InteractionLogs*/}
                {/*        tasksExecution={tasksExecutionData}*/}
                {/*        participants={participantsData}*/}
                {/*        experimentId={experimentId}*/}
                {/*        accessToken={user.accessToken}*/}
                {/*        t={t}*/}
                {/*    />*/}
                {/*)}*/}
            </Box>
        </Box>
    );
};

export default ExperimentMonitoring;
