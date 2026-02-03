import { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import TimelineIcon from "@mui/icons-material/Timeline";
import ChatIcon from "@mui/icons-material/Chat";
import FolderIcon from "@mui/icons-material/Folder";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const InteractionMetrics = ({ metrics, experimentId, accessToken, t }) => {
  const [exporting, setExporting] = useState(false);

  const handleExportMetrics = async () => {
    setExporting(true);
    try {
      // TODO: Implementar chamada real da API
      // await api.get(`experiments2/${experimentId}/export-metrics`, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      //   responseType: 'blob'
      // });

      await new Promise((resolve) => setTimeout(resolve, 500));
      const jsonData = JSON.stringify(metrics, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `interaction_metrics_${experimentId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting metrics:", error);
    } finally {
      setExporting(false);
    }
  };

  if (!metrics) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="textSecondary" align="center">
          {t("no_metrics") || "Nenhuma métrica disponível"}
        </Typography>
      </Paper>
    );
  }

  // Preparar dados para gráficos
  const resourceAccessData =
    metrics.resourceAccess?.mostAccessedResources?.map((resource) => ({
      name: resource.name,
      acessos: resource.accessCount,
    })) || [];

  const timePerResourceData = Object.entries(
    metrics.timeMetrics?.averageTimePerResource || {},
  ).map(([resource, time]) => ({
    name: resource,
    tempo: parseInt(time) || 0,
  }));

  return (
    <Box>
      {/* Header with Export Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          {t("interaction_metrics") || "Métricas de Interação"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={
            exporting ? <CircularProgress size={16} /> : <DownloadIcon />
          }
          onClick={handleExportMetrics}
          disabled={exporting}
        >
          {exporting
            ? t("exporting") || "Exportando..."
            : t("export_metrics") || "Exportar Métricas"}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TimelineIcon sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} />
                <Box>
                  <Typography variant="h5" color="primary">
                    {metrics.totalSessions || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t("total_sessions") || "Total de Sessões"}
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
                <AccessTimeIcon
                  sx={{ fontSize: 40, color: "#2e7d32", mr: 2 }}
                />
                <Box>
                  <Typography variant="h5" color="success.main">
                    {metrics.averageSessionTime || "0 min"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t("avg_session_time") || "Tempo Médio de Sessão"}
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
                <ChatIcon sx={{ fontSize: 40, color: "#ed6c02", mr: 2 }} />
                <Box>
                  <Typography variant="h5" color="warning.main">
                    {metrics.totalMessages || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t("total_messages") || "Total de Mensagens"}
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
                <FolderIcon sx={{ fontSize: 40, color: "#9c27b0", mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: "#9c27b0" }}>
                    {metrics.averageMessagesPerSession?.toFixed(1) || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t("avg_messages_per_session") || "Msgs Médias por Sessão"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Resource Access Charts */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t("resource_access") || "Acesso a Recursos"}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t("average_depth") || "Profundidade Média"}:{" "}
          {metrics.resourceAccess?.averageDepth || 0} •{" "}
          {t("max_depth") || "Profundidade Máxima"}:{" "}
          {metrics.resourceAccess?.maxDepth || 0}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              {t("most_accessed_resources") || "Recursos Mais Acessados"}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceAccessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="acessos"
                  fill="#1976d2"
                  name={t("access_count") || "Número de Acessos"}
                />
              </BarChart>
            </ResponsiveContainer>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              {t("access_distribution") || "Distribuição de Acessos"}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceAccessData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="acessos"
                >
                  {resourceAccessData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </Paper>

      {/* Time Metrics */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t("time_per_resource") || "Tempo Médio por Recurso"}
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timePerResourceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              label={{ value: "Minutos", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="tempo"
              fill="#2e7d32"
              name={t("average_time_minutes") || "Tempo Médio (min)"}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Detailed Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("detailed_metrics") || "Métricas Detalhadas"}
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>{t("resource") || "Recurso"}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{t("access_count") || "Acessos"}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{t("average_time") || "Tempo Médio"}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.resourceAccess?.mostAccessedResources?.map(
                (resource, index) => (
                  <TableRow key={index}>
                    <TableCell>{resource.name}</TableCell>
                    <TableCell align="right">{resource.accessCount}</TableCell>
                    <TableCell align="right">
                      {metrics.timeMetrics?.averageTimePerResource?.[
                        resource.name
                      ] || "-"}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default InteractionMetrics;
