import {useState} from "react";
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

const ParticipantsOverview = ({participants, stats, experimentId, t}) => {
    const [exporting, setExporting] = useState(false);

    const handleExportParticipants = async () => {
        setExporting(true);
        try {
            const csvContent = [
                "ID,Nome,Email,Status,Data Início,Data Conclusão,Tempo Gasto (ms),Progresso (%)",
                ...participants.map((p) => {
                    const startDate = p.startDate
                        ? new Date(p.startDate).toLocaleString("pt-BR")
                        : "";
                    const completionDate = p.completionDate
                        ? new Date(p.completionDate).toLocaleString("pt-BR")
                        : "";
                    return `${p.id},"${p.name}","${p.email}",${p.status},"${startDate}","${completionDate}",${p.timeTaken || 0},${p.progress || 0}`;
                }),
            ].join("\n");

            const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `participants_${experimentId}_${new Date().toISOString().split("T")[0]}.csv`;
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

    const formatTime = (milliseconds) => {
        if (!milliseconds || milliseconds === 0) return "-";

        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}min`;
        } else if (minutes > 0) {
            return `${minutes}min ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    };

    if (!participants || participants.length === 0) {
        return (
            <Paper sx={{p: 3}}>
                <Typography color="textSecondary" align="center">
                    {t("no_participants") || "Nenhum participante encontrado"}
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{p: 3}}>
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
                        exporting ? <CircularProgress size={16}/> : <DownloadIcon/>
                    }
                    onClick={handleExportParticipants}
                    disabled={exporting}
                >
                    {exporting
                        ? t("exporting") || "Exportando..."
                        : t("export_csv") || "Exportar CSV"}
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t("participant") || "Participante"}</TableCell>
                            <TableCell>{t("email") || "Email"}</TableCell>
                            <TableCell>{t("status") || "Status"}</TableCell>
                            <TableCell>{t("start_date") || "Data Início"}</TableCell>
                            <TableCell>{t("completion_date") || "Data Conclusão"}</TableCell>
                            <TableCell>{t("time_taken") || "Tempo Gasto"}</TableCell>
                            <TableCell align="center">{t("progress") || "Progresso"}</TableCell>
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
                                <TableCell>
                                    {participant.startDate
                                        ? new Date(participant.startDate).toLocaleString("pt-BR")
                                        : "-"}
                                </TableCell>
                                <TableCell>
                                    {participant.completionDate
                                        ? new Date(participant.completionDate).toLocaleString("pt-BR")
                                        : "-"}
                                </TableCell>
                                <TableCell>{formatTime(participant.timeTaken)}</TableCell>
                                <TableCell align="center">
                                    {participant.progress !== undefined
                                        ? `${participant.progress.toFixed(1)}%`
                                        : "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {stats && (
                <Box sx={{mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1}}>
                    <Typography variant="subtitle2" gutterBottom>
                        {t("summary") || "Resumo"}
                    </Typography>
                    <Box sx={{display: "flex", gap: 3, flexWrap: "wrap"}}>
                        <Typography variant="body2">
                            <strong>{t("total") || "Total"}:</strong> {stats.totalParticipants}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                            <strong>{t("finished") || "Finalizados"}:</strong>{" "}
                            {stats.finishedParticipants}
                        </Typography>
                        <Typography variant="body2">
                            <strong>{t("completion_rate") || "Taxa de Conclusão"}:</strong>{" "}
                            {stats.completionPercentage?.toFixed(1)}%
                        </Typography>
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default ParticipantsOverview;