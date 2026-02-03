import { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

// Mock data - será substituído pela API
const fetchParticipantsList = async (experimentId, accessToken) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: "p1",
      name: "Participante 001",
      email: "p001@example.com",
      status: "FINISHED",
      startDate: "2026-01-20",
      completionDate: "2026-01-20",
      completionTime: "15 min",
      progress: 100,
    },
    {
      id: "p2",
      name: "Participante 002",
      email: "p002@example.com",
      status: "IN_PROGRESS",
      startDate: "2026-01-22",
      completionDate: null,
      completionTime: null,
      progress: 60,
    },
    {
      id: "p3",
      name: "Participante 003",
      email: "p003@example.com",
      status: "NOT_STARTED",
      startDate: null,
      completionDate: null,
      completionTime: null,
      progress: 0,
    },
  ];
};

const ParticipantsOverview = ({ overview, experimentId, accessToken, t }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      // TODO: Substituir por chamada real da API
      // const { data } = await api.get(
      //   `experiments2/${experimentId}/participants`,
      //   { headers: { Authorization: `Bearer ${accessToken}` } }
      // );
      const data = await fetchParticipantsList(experimentId, accessToken);
      setParticipants(data);
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportParticipants = async () => {
    setExporting(true);
    try {
      // TODO: Implementar chamada real da API
      // await api.get(`experiments2/${experimentId}/export-participants`, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      //   responseType: 'blob'
      // });

      await new Promise((resolve) => setTimeout(resolve, 500));
      const csvContent = [
        "ID,Nome,Email,Status,Data Início,Data Conclusão,Tempo de Conclusão,Progresso",
        ...participants.map(
          (p) =>
            `${p.id},${p.name},${p.email},${p.status},${p.startDate || ""},${p.completionDate || ""},${p.completionTime || ""},${p.progress}%`,
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `participants_${experimentId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting participants:", error);
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "FINISHED":
        return "success";
      case "IN_PROGRESS":
        return "warning";
      case "NOT_STARTED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "FINISHED":
        return t("finished") || "Finalizado";
      case "IN_PROGRESS":
        return t("in_progress") || "Em Andamento";
      case "NOT_STARTED":
        return t("not_started") || "Não Iniciado";
      default:
        return status;
    }
  };

  // Auto-load participants on mount
  useState(() => {
    loadParticipants();
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          {t("participants_list") || "Lista de Participantes"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={
            exporting ? <CircularProgress size={16} /> : <DownloadIcon />
          }
          onClick={handleExportParticipants}
          disabled={exporting || participants.length === 0}
        >
          {exporting
            ? t("exporting") || "Exportando..."
            : t("export_csv") || "Exportar CSV"}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("participant") || "Participante"}</TableCell>
                <TableCell>{t("email") || "Email"}</TableCell>
                <TableCell>{t("status") || "Status"}</TableCell>
                <TableCell>{t("start_date") || "Data Início"}</TableCell>
                <TableCell>
                  {t("completion_date") || "Data Conclusão"}
                </TableCell>
                <TableCell>
                  {t("completion_time") || "Tempo de Conclusão"}
                </TableCell>
                <TableCell>{t("progress") || "Progresso"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(participant.status)}
                      color={getStatusColor(participant.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{participant.startDate || "-"}</TableCell>
                  <TableCell>{participant.completionDate || "-"}</TableCell>
                  <TableCell>{participant.completionTime || "-"}</TableCell>
                  <TableCell>{participant.progress}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && participants.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="textSecondary">
            {t("no_participants") || "Nenhum participante encontrado"}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ParticipantsOverview;
