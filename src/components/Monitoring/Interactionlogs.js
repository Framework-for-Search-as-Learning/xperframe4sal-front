import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Mock data function
const fetchInteractionLogs = async (
  experimentId,
  accessToken,
  filters,
  page,
  rowsPerPage,
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const allLogs = [
    {
      id: "log1",
      timestamp: "2026-02-03 14:30:25",
      participantId: "p001",
      participantName: "Participante 001",
      eventType: "PAGE_VIEW",
      resource: "Tutorial Inicial",
      duration: "5 min",
      metadata: {
        pageUrl: "/tutorial/inicio",
        sessionId: "sess_123",
        userAgent: "Chrome 120",
      },
    },
    {
      id: "log2",
      timestamp: "2026-02-03 14:25:10",
      participantId: "p001",
      participantName: "Participante 001",
      eventType: "CHAT_MESSAGE",
      resource: "Chat",
      duration: "2 min",
      metadata: {
        messageCount: 5,
        sessionId: "sess_123",
      },
    },
    {
      id: "log3",
      timestamp: "2026-02-03 14:20:00",
      participantId: "p002",
      participantName: "Participante 002",
      eventType: "RESOURCE_ACCESS",
      resource: "Documentação",
      duration: "12 min",
      metadata: {
        depth: 3,
        resourcePath: "/docs/avancado/api",
        sessionId: "sess_456",
      },
    },
    {
      id: "log4",
      timestamp: "2026-02-03 14:15:30",
      participantId: "p003",
      participantName: "Participante 003",
      eventType: "SESSION_START",
      resource: "Sistema",
      duration: null,
      metadata: {
        sessionId: "sess_789",
        ip: "192.168.1.100",
      },
    },
    {
      id: "log5",
      timestamp: "2026-02-03 14:10:15",
      participantId: "p001",
      participantName: "Participante 001",
      eventType: "QUESTIONNAIRE_SUBMIT",
      resource: "Questionário Pré-experimento",
      duration: "8 min",
      metadata: {
        questionnaireId: "q1",
        completionRate: 100,
      },
    },
  ];

  // Aplicar filtros
  let filteredLogs = allLogs;

  if (filters.eventType && filters.eventType !== "ALL") {
    filteredLogs = filteredLogs.filter(
      (log) => log.eventType === filters.eventType,
    );
  }

  if (filters.participantId) {
    filteredLogs = filteredLogs.filter((log) =>
      log.participantName
        .toLowerCase()
        .includes(filters.participantId.toLowerCase()),
    );
  }

  // Simular paginação
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;

  return {
    logs: filteredLogs.slice(start, end),
    total: filteredLogs.length,
  };
};

const InteractionLogs = ({ experimentId, accessToken, t }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [filters, setFilters] = useState({
    eventType: "ALL",
    participantId: "",
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    loadLogs();
  }, [page, rowsPerPage, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // TODO: Substituir por chamada real da API
      // const { data } = await api.get(
      //   `experiments2/${experimentId}/interaction-logs`,
      //   {
      //     headers: { Authorization: `Bearer ${accessToken}` },
      //     params: { ...filters, page, limit: rowsPerPage }
      //   }
      // );
      const data = await fetchInteractionLogs(
        experimentId,
        accessToken,
        filters,
        page,
        rowsPerPage,
      );
      setLogs(data.logs);
      setTotalLogs(data.total);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportLogs = async () => {
    setExporting(true);
    try {
      // TODO: Implementar chamada real da API
      // await api.get(`experiments2/${experimentId}/export-logs`, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      //   params: filters,
      //   responseType: 'blob'
      // });

      await new Promise((resolve) => setTimeout(resolve, 500));

      const csvContent = [
        "Timestamp,Participante,Tipo de Evento,Recurso,Duração,Metadata",
        ...logs.map(
          (log) =>
            `${log.timestamp},${log.participantName},${log.eventType},${log.resource},${log.duration || "N/A"},"${JSON.stringify(log.metadata).replace(/"/g, '""')}"`,
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `interaction_logs_${experimentId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting logs:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      PAGE_VIEW: "primary",
      CHAT_MESSAGE: "secondary",
      RESOURCE_ACCESS: "info",
      SESSION_START: "success",
      SESSION_END: "error",
      QUESTIONNAIRE_SUBMIT: "warning",
    };
    return colors[eventType] || "default";
  };

  const getEventTypeLabel = (eventType) => {
    const labels = {
      PAGE_VIEW: t("page_view") || "Visualização de Página",
      CHAT_MESSAGE: t("chat_message") || "Mensagem no Chat",
      RESOURCE_ACCESS: t("resource_access") || "Acesso a Recurso",
      SESSION_START: t("session_start") || "Início de Sessão",
      SESSION_END: t("session_end") || "Fim de Sessão",
      QUESTIONNAIRE_SUBMIT:
        t("questionnaire_submit") || "Envio de Questionário",
    };
    return labels[eventType] || eventType;
  };

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">{t("filters") || "Filtros"}</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label={t("event_type") || "Tipo de Evento"}
              value={filters.eventType}
              onChange={(e) => handleFilterChange("eventType", e.target.value)}
              size="small"
            >
              <MenuItem value="ALL">{t("all") || "Todos"}</MenuItem>
              <MenuItem value="PAGE_VIEW">
                {t("page_view") || "Visualização de Página"}
              </MenuItem>
              <MenuItem value="CHAT_MESSAGE">
                {t("chat_message") || "Mensagem no Chat"}
              </MenuItem>
              <MenuItem value="RESOURCE_ACCESS">
                {t("resource_access") || "Acesso a Recurso"}
              </MenuItem>
              <MenuItem value="SESSION_START">
                {t("session_start") || "Início de Sessão"}
              </MenuItem>
              <MenuItem value="SESSION_END">
                {t("session_end") || "Fim de Sessão"}
              </MenuItem>
              <MenuItem value="QUESTIONNAIRE_SUBMIT">
                {t("questionnaire_submit") || "Envio de Questionário"}
              </MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label={t("participant") || "Participante"}
              value={filters.participantId}
              onChange={(e) =>
                handleFilterChange("participantId", e.target.value)
              }
              size="small"
              placeholder={t("search_participant") || "Buscar participante..."}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t("start_date") || "Data Início"}
                value={filters.startDate}
                onChange={(date) => handleFilterChange("startDate", date)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t("end_date") || "Data Fim"}
                value={filters.endDate}
                onChange={(date) => handleFilterChange("endDate", date)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={
              exporting ? <CircularProgress size={16} /> : <DownloadIcon />
            }
            onClick={handleExportLogs}
            disabled={exporting || logs.length === 0}
          >
            {exporting
              ? t("exporting") || "Exportando..."
              : t("export_logs") || "Exportar Logs"}
          </Button>
        </Box>
      </Paper>

      {/* Logs Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("interaction_logs") || "Logs de Interação"}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("timestamp") || "Data/Hora"}</TableCell>
                    <TableCell>{t("participant") || "Participante"}</TableCell>
                    <TableCell>{t("event_type") || "Tipo"}</TableCell>
                    <TableCell>{t("resource") || "Recurso"}</TableCell>
                    <TableCell>{t("duration") || "Duração"}</TableCell>
                    <TableCell align="center">
                      {t("actions") || "Ações"}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.participantName}</TableCell>
                      <TableCell>
                        <Chip
                          label={getEventTypeLabel(log.eventType)}
                          color={getEventTypeColor(log.eventType)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.duration || "-"}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(log)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalLogs}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t("rows_per_page") || "Linhas por página:"}
            />
          </>
        )}

        {!loading && logs.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="textSecondary">
              {t("no_logs_found") || "Nenhum log encontrado"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("log_details") || "Detalhes do Log"}</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    {t("timestamp") || "Data/Hora"}
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.timestamp}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    {t("participant") || "Participante"}
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.participantName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    {t("event_type") || "Tipo de Evento"}
                  </Typography>
                  <Chip
                    label={getEventTypeLabel(selectedLog.eventType)}
                    color={getEventTypeColor(selectedLog.eventType)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    {t("resource") || "Recurso"}
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.resource}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    {t("duration") || "Duração"}
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.duration || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {t("metadata") || "Metadados"}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.100" }}>
                    <pre style={{ margin: 0, fontSize: "0.875rem" }}>
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            {t("close") || "Fechar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InteractionLogs;
