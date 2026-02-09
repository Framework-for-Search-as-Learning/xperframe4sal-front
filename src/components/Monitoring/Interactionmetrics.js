import {useState} from "react";
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
    Chip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const InteractionMetrics = ({tasksExecution, experimentId, accessToken, t}) => {
    const [exporting, setExporting] = useState(false);

    const handleExportMetrics = async () => {
        setExporting(true);
        try {
            const jsonData = JSON.stringify(tasksExecution, null, 2);
            const blob = new Blob([jsonData], {type: "application/json"});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `tasks_execution_${experimentId}_${new Date().toISOString().split("T")[0]}.json`;
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

    const formatTime = (milliseconds) => {
        if (!milliseconds || milliseconds === 0) return "0s";

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

    // Calcula estatísticas agregadas
    const calculateStats = () => {
        if (!tasksExecution || tasksExecution.length === 0) {
            return {
                totalTasks: 0,
                totalExecutions: 0,
                searchTasks: 0,
                llmTasks: 0,
                averageExecutionTime: 0,
                totalResourcesAccessed: 0,
                totalQueries: 0,
                totalMessages: 0,
            };
        }

        let totalExecutions = 0;
        let searchTasks = 0;
        let llmTasks = 0;
        let totalExecutionTime = 0;
        let totalResourcesAccessed = 0;
        let totalQueries = 0;
        let totalMessages = 0;

        tasksExecution.forEach((task) => {
            totalExecutions += task.executions.length;

            task.executions.forEach((execution) => {
                totalExecutionTime += execution.executionTime || 0;

                if (execution.taskType === "search-engine") {
                    searchTasks++;
                    if (execution.searchDetails) {
                        totalResourcesAccessed += execution.searchDetails.resourcesAccessedDepth || 0;
                        totalQueries += execution.searchDetails.queriesCount || 0;
                    }
                } else if (execution.taskType === "llm") {
                    llmTasks++;
                    if (execution.llmDetails) {
                        totalMessages += execution.llmDetails.totalMessages || 0;
                    }
                }
            });
        });

        return {
            totalTasks: tasksExecution.length,
            totalExecutions,
            searchTasks,
            llmTasks,
            averageExecutionTime: totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0,
            totalResourcesAccessed,
            totalQueries,
            totalMessages,
        };
    };

    const stats = calculateStats();

    // Prepara dados para gráficos
    const prepareTaskTypeData = () => {
        return [
            {name: t("search_tasks") || "Tarefas de Busca", value: stats.searchTasks},
            {name: t("llm_tasks") || "Tarefas LLM", value: stats.llmTasks},
        ];
    };

    const prepareExecutionTimeData = () => {
        if (!tasksExecution) return [];

        return tasksExecution.map((task) => {
            const avgTime = task.executions.length > 0
                ? task.executions.reduce((sum, ex) => sum + (ex.executionTime || 0), 0) / task.executions.length
                : 0;

            return {
                name: task.taskTitle.substring(0, 30) + (task.taskTitle.length > 30 ? "..." : ""),
                tempo: Math.round(avgTime / 1000), // Converte para segundos
                execucoes: task.executions.length,
            };
        });
    };

    if (!tasksExecution || tasksExecution.length === 0) {
        return (
            <Paper sx={{p: 3}}>
                <Typography color="textSecondary" align="center">
                    {t("no_tasks_execution") || "Nenhuma execução de tarefa disponível"}
                </Typography>
            </Paper>
        );
    }

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
                    {t("tasks_execution_metrics") || "Métricas de Execução de Tarefas"}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={
                        exporting ? <CircularProgress size={16}/> : <DownloadIcon/>
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
            <Grid container spacing={3} sx={{mb: 4}}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{display: "flex", alignItems: "center"}}>
                                <AssignmentIcon sx={{fontSize: 40, color: "#1976d2", mr: 2}}/>
                                <Box>
                                    <Typography variant="h5" color="primary">
                                        {stats.totalTasks}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {t("total_tasks") || "Total de Tarefas"}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{display: "flex", alignItems: "center"}}>
                                <AccessTimeIcon sx={{fontSize: 40, color: "#2e7d32", mr: 2}}/>
                                <Box>
                                    <Typography variant="h5" color="success.main">
                                        {formatTime(stats.averageExecutionTime)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {t("avg_execution_time") || "Tempo Médio"}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{display: "flex", alignItems: "center"}}>
                                <SearchIcon sx={{fontSize: 40, color: "#ed6c02", mr: 2}}/>
                                <Box>
                                    <Typography variant="h5" color="warning.main">
                                        {stats.totalResourcesAccessed}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {t("resources_accessed") || "Recursos Acessados"}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{display: "flex", alignItems: "center"}}>
                                <ChatIcon sx={{fontSize: 40, color: "#9c27b0", mr: 2}}/>
                                <Box>
                                    <Typography variant="h5" sx={{color: "#9c27b0"}}>
                                        {stats.totalMessages}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {t("total_messages") || "Total de Mensagens"}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{mb: 4}}/>

            {/* Task Type Distribution */}
            <Paper sx={{p: 3, mb: 4}}>
                <Typography variant="h6" gutterBottom>
                    {t("task_type_distribution") || "Distribuição por Tipo de Tarefa"}
                </Typography>

                <Grid container spacing={3} sx={{mt: 2}}>
                    <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={prepareTaskTypeData()}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Bar
                                    dataKey="value"
                                    fill="#1976d2"
                                    name={t("executions") || "Execuções"}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={prepareTaskTypeData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({name, percent}) =>
                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {prepareTaskTypeData().map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                </Grid>
            </Paper>

            {/* Execution Time by Task */}
            <Paper sx={{p: 3, mb: 4}}>
                <Typography variant="h6" gutterBottom>
                    {t("avg_time_by_task") || "Tempo Médio por Tarefa"}
                </Typography>

                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={prepareExecutionTimeData()}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={150}
                            interval={0}
                        />
                        <YAxis label={{value: "Segundos", angle: -90, position: "insideLeft"}}/>
                        <Tooltip
                            formatter={(value, name) => {
                                if (name === "tempo") return [`${value}s`, t("avg_time") || "Tempo Médio"];
                                return [value, t("executions") || "Execuções"];
                            }}
                        />
                        <Legend/>
                        <Bar
                            dataKey="tempo"
                            fill="#2e7d32"
                            name={t("avg_time_seconds") || "Tempo Médio (s)"}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>

            {/* Detailed Table */}
            <Paper sx={{p: 3}}>
                <Typography variant="h6" gutterBottom>
                    {t("detailed_tasks") || "Detalhes por Tarefa"}
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>{t("task") || "Tarefa"}</strong></TableCell>
                                <TableCell><strong>{t("type") || "Tipo"}</strong></TableCell>
                                <TableCell align="right">
                                    <strong>{t("executions") || "Execuções"}</strong>
                                </TableCell>
                                <TableCell align="right">
                                    <strong>{t("avg_time") || "Tempo Médio"}</strong>
                                </TableCell>
                                <TableCell align="right">
                                    <strong>{t("resources_queries") || "Recursos/Consultas"}</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasksExecution.map((task) => {
                                const avgTime = task.executions.length > 0
                                    ? task.executions.reduce((sum, ex) => sum + (ex.executionTime || 0), 0) / task.executions.length
                                    : 0;

                                const firstExecution = task.executions[0];
                                const taskType = firstExecution?.taskType || "-";

                                let additionalInfo = "-";
                                if (taskType === "search-engine") {
                                    const totalResources = task.executions.reduce(
                                        (sum, ex) => sum + (ex.searchDetails?.resourcesAccessedDepth || 0), 0
                                    );
                                    const totalQueries = task.executions.reduce(
                                        (sum, ex) => sum + (ex.searchDetails?.queriesCount || 0), 0
                                    );
                                    additionalInfo = `${totalResources} recursos / ${totalQueries} consultas`;
                                } else if (taskType === "llm") {
                                    const totalMessages = task.executions.reduce(
                                        (sum, ex) => sum + (ex.llmDetails?.totalMessages || 0), 0
                                    );
                                    additionalInfo = `${totalMessages} mensagens`;
                                }

                                return (
                                    <TableRow key={task.taskId}>
                                        <TableCell>{task.taskTitle}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={taskType === "search-engine" ? "Busca" : "LLM"}
                                                color={taskType === "search-engine" ? "primary" : "secondary"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">{task.executions.length}</TableCell>
                                        <TableCell align="right">{formatTime(avgTime)}</TableCell>
                                        <TableCell align="right">{additionalInfo}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default InteractionMetrics;