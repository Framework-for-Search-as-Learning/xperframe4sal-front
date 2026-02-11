import {useState, useEffect} from "react";
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
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
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
    LineChart,
    Line,
} from "recharts";
import {api} from "../../config/axios";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const InteractionMetrics = ({tasksExecution, participants, experimentId, accessToken, t,}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [exporting, setExporting] = useState(false);
    const [selectedTask, setSelectedTask] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [userTaskDetails, setUserTaskDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState({});

    useEffect(() => {
        if (activeTab === 1 && tasksExecution?.length > 0 && !selectedTask) {
            setSelectedTask(tasksExecution[0].taskId);
        }
    }, [activeTab, tasksExecution, selectedTask]);

    useEffect(() => {
        if (activeTab === 2 && participants?.length > 0 && !selectedUser) {
            setSelectedUser(participants[0].id);
            loadUserTaskDetails(participants[0].id);
        }
    }, [activeTab, participants, selectedUser]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleTaskChange = (event) => {
        setSelectedTask(event.target.value);
    };

    const handleUserChange = (event) => {
        const userId = event.target.value;
        setSelectedUser(userId);
        loadUserTaskDetails(userId);
    };

    const loadUserTaskDetails = async (userId) => {
        if (userTaskDetails[userId]) return;

        setLoadingDetails((prev) => ({...prev, [userId]: true}));
        try {
            const detailsPromises = tasksExecution.map(async (task) => {
                try {
                    const { data } = await api.get(`user-task/execution-details/user/${userId}/task/${task.taskId}`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    return {taskId: task.taskId, data};
                } catch (error) {
                    console.error(`Error loading details for task ${task.taskId}:`, error);
                    return {taskId: task.taskId, data: []};
                }
            });

            const results = await Promise.all(detailsPromises);
            const detailsByTask = {};
            results.forEach((result) => {
                detailsByTask[result.taskId] = result.data;
            });

            setUserTaskDetails((prev) => ({...prev, [userId]: detailsByTask}));
        } catch (error) {
            console.error("Error loading user task details:", error);
        } finally {
            setLoadingDetails((prev) => ({...prev, [userId]: false}));
        }
    };

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

    const getSelectedTaskData = () => {
        return tasksExecution?.find((task) => task.taskId === selectedTask);
    };

    const getUserDetails = () => {
        if (!selectedUser) return null;
        return userTaskDetails[selectedUser];
    };

    const isLoadingUserDetails = () => {
        if (!selectedUser) return false;
        return loadingDetails[selectedUser] || false;
    };

    if (!tasksExecution || tasksExecution.length === 0) {
        return (<Paper sx={{p: 3}}>
            <Typography color="textSecondary" align="center">
                {t("no_tasks_execution") || "Nenhuma execução de tarefa disponível"}
            </Typography>
        </Paper>);
    }

    return (<Box>
        <Paper sx={{mb: 3}}>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
            >
                <Tab label={t("summary") || "Resumo"}/>
                <Tab label={t("by_task") || "Por Tarefa"}/>
                <Tab label={t("by_participant") || "Por Participante"}/>
            </Tabs>
        </Paper>

        {activeTab === 0 && (<ResumoTab
            stats={stats}
            tasksExecution={tasksExecution}
            handleExportMetrics={handleExportMetrics}
            exporting={exporting}
            formatTime={formatTime}
            t={t}
        />)}

        {activeTab === 1 && (<PorTarefaTab
            tasksExecution={tasksExecution}
            selectedTask={selectedTask}
            handleTaskChange={handleTaskChange}
            getSelectedTaskData={getSelectedTaskData}
            formatTime={formatTime}
            t={t}
        />)}

        {activeTab === 2 && (<PorParticipanteTab
            participants={participants}
            tasksExecution={tasksExecution}
            selectedUser={selectedUser}
            handleUserChange={handleUserChange}
            getUserDetails={getUserDetails}
            isLoadingUserDetails={isLoadingUserDetails}
            formatTime={formatTime}
            t={t}
        />)}
    </Box>);
};

const ResumoTab = ({stats, tasksExecution, handleExportMetrics, exporting, formatTime, t}) => {
    const prepareTaskTypeData = () => {
        return [{
            name: t("search_tasks") || "Tarefas de Busca", value: stats.searchTasks
        }, {name: t("llm_tasks") || "Tarefas Chat", value: stats.llmTasks},];
    };

    const prepareExecutionTimeData = () => {
        return tasksExecution.map((task) => {
            const avgTime = task.executions.length > 0 ? task.executions.reduce((sum, ex) => sum + (ex.executionTime || 0), 0) / task.executions.length : 0;

            return {
                name: task.taskTitle.substring(0, 30) + (task.taskTitle.length > 30 ? "..." : ""),
                tempo: Math.round(avgTime / 1000),
                execucoes: task.executions.length,
            };
        });
    };

    return (<Box>
        <Box
            sx={{
                display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3,
            }}
        >
            <Typography variant="h6">
                {t("tasks_execution_metrics") || "Métricas de Execução de Tarefas"}
            </Typography>
            <Button
                variant="outlined"
                startIcon={exporting ? <CircularProgress size={16}/> : <DownloadIcon/>}
                onClick={handleExportMetrics}
                disabled={exporting}
            >
                {exporting ? t("exporting") || "Exportando..." : t("export_metrics") || "Exportar Métricas"}
            </Button>
        </Box>

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
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {prepareTaskTypeData().map((entry, index) => (<Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />))}
                            </Pie>
                            <Tooltip/>
                        </PieChart>
                    </ResponsiveContainer>
                </Grid>
            </Grid>
        </Paper>

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
                    <YAxis
                        label={{value: "Segundos", angle: -90, position: "insideLeft"}}
                    />
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

        <Paper sx={{p: 3}}>
            <Typography variant="h6" gutterBottom>
                {t("detailed_tasks") || "Detalhes por Tarefa"}
            </Typography>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <strong>{t("task") || "Tarefa"}</strong>
                            </TableCell>
                            <TableCell>
                                <strong>{t("type") || "Tipo"}</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>{t("executions") || "Execuções"}</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>{t("avg_time") || "Tempo Médio"}</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>
                                    {t("resources_queries") || "Recursos/Consultas"}
                                </strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasksExecution.map((task) => {
                            const avgTime = task.executions.length > 0 ? task.executions.reduce((sum, ex) => sum + (ex.executionTime || 0), 0) / task.executions.length : 0;

                            const firstExecution = task.executions[0];
                            const taskType = firstExecution?.taskType || "-";

                            let additionalInfo = "-";
                            if (taskType === "search-engine") {
                                const totalResources = task.executions.reduce((sum, ex) => sum + (ex.searchDetails?.resourcesAccessedDepth || 0), 0);
                                const totalQueries = task.executions.reduce((sum, ex) => sum + (ex.searchDetails?.queriesCount || 0), 0);
                                additionalInfo = `${totalResources} recursos / ${totalQueries} consultas`;
                            } else if (taskType === "llm") {
                                const totalMessages = task.executions.reduce((sum, ex) => sum + (ex.llmDetails?.totalMessages || 0), 0);
                                additionalInfo = `${totalMessages} mensagens`;
                            }

                            return (<TableRow key={task.taskId}>
                                <TableCell>{task.taskTitle}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={taskType === "search-engine" ? "Busca" : "Chat"}
                                        color={taskType === "search-engine" ? "primary" : "secondary"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">{task.executions.length}</TableCell>
                                <TableCell align="right">{formatTime(avgTime)}</TableCell>
                                <TableCell align="right">{additionalInfo}</TableCell>
                            </TableRow>);
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    </Box>);
};

const PorTarefaTab = ({tasksExecution, selectedTask, handleTaskChange, getSelectedTaskData, formatTime, t}) => {
    const taskData = getSelectedTaskData();

    if (!taskData) return null;

    const taskType = taskData.executions[0]?.taskType;
    const isSearchTask = taskType === "search-engine";

    const avgTime = taskData.executions.length > 0 ? taskData.executions.reduce((sum, ex) => sum + (ex.executionTime || 0), 0) / taskData.executions.length : 0;

    const totalResources = isSearchTask ? taskData.executions.reduce((sum, ex) => sum + (ex.searchDetails?.resourcesAccessedDepth || 0), 0) : 0;

    const totalQueries = isSearchTask ? taskData.executions.reduce((sum, ex) => sum + (ex.searchDetails?.queriesCount || 0), 0) : 0;

    const totalMessages = !isSearchTask ? taskData.executions.reduce((sum, ex) => sum + (ex.llmDetails?.totalMessages || 0), 0) : 0;

    const executionTimeData = taskData.executions.map((exec, idx) => ({
        name: `Ex ${idx + 1}`, tempo: Math.round((exec.executionTime || 0) / 1000),
    }));

    return (<Box>
        <Box sx={{mb: 3}}>
            <FormControl fullWidth>
                <InputLabel>{t("select_task") || "Selecione uma tarefa"}</InputLabel>
                <Select
                    value={selectedTask}
                    label={t("select_task") || "Selecione uma tarefa"}
                    onChange={handleTaskChange}
                >
                    {tasksExecution.map((task) => (<MenuItem key={task.taskId} value={task.taskId}>
                        {task.taskTitle}
                    </MenuItem>))}
                </Select>
            </FormControl>
        </Box>

        <Card sx={{mb: 3}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {taskData.taskTitle}
                </Typography>
                <Chip
                    label={isSearchTask ? "Busca" : "Chat"}
                    color={isSearchTask ? "primary" : "secondary"}
                    size="small"
                    sx={{mb: 2}}
                />

                <Grid container spacing={2} sx={{mt: 1}}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{p: 2, bgcolor: "grey.50", borderRadius: 1}}>
                            <Typography variant="body2" color="textSecondary">
                                {t("executions") || "Execuções"}
                            </Typography>
                            <Typography variant="h5" color="primary">
                                {taskData.executions.length}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{p: 2, bgcolor: "grey.50", borderRadius: 1}}>
                            <Typography variant="body2" color="textSecondary">
                                {t("avg_time") || "Tempo Médio"}
                            </Typography>
                            <Typography variant="h5" color="primary">
                                {formatTime(avgTime)}
                            </Typography>
                        </Box>
                    </Grid>
                    {isSearchTask && (<>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{p: 2, bgcolor: "grey.50", borderRadius: 1}}>
                                <Typography variant="body2" color="textSecondary">
                                    {t("total_resources") || "Total de Recursos"}
                                </Typography>
                                <Typography variant="h5" color="primary">
                                    {totalResources}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{p: 2, bgcolor: "grey.50", borderRadius: 1}}>
                                <Typography variant="body2" color="textSecondary">
                                    {t("total_queries") || "Total de Consultas"}
                                </Typography>
                                <Typography variant="h5" color="primary">
                                    {totalQueries}
                                </Typography>
                            </Box>
                        </Grid>
                    </>)}
                    {!isSearchTask && (<Grid item xs={12} sm={6} md={3}>
                        <Box sx={{p: 2, bgcolor: "grey.50", borderRadius: 1}}>
                            <Typography variant="body2" color="textSecondary">
                                {t("total_messages") || "Total de Mensagens"}
                            </Typography>
                            <Typography variant="h5" color="primary">
                                {totalMessages}
                            </Typography>
                        </Box>
                    </Grid>)}
                </Grid>
            </CardContent>
        </Card>

        <Paper sx={{p: 3, mb: 3}}>
            <Typography variant="h6" gutterBottom>
                {t("execution_times") || "Tempos de Execução"}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={executionTimeData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="name"/>
                    <YAxis label={{value: "Segundos", angle: -90, position: "insideLeft"}}/>
                    <Tooltip formatter={(value) => [`${value}s`, t("time") || "Tempo"]}/>
                    <Legend/>
                    <Line
                        type="monotone"
                        dataKey="tempo"
                        stroke="#1976d2"
                        name={t("execution_time") || "Tempo de Execução (s)"}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Paper>

        <Paper sx={{p: 3}}>
            <Typography variant="h6" gutterBottom>
                {t("executions_list") || "Lista de Execuções"}
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>{t("execution_time") || "Tempo de Execução"}</TableCell>
                            {isSearchTask && (<>
                                <TableCell align="center">
                                    {t("resources") || "Recursos"}
                                </TableCell>
                                <TableCell align="center">
                                    {t("queries") || "Consultas"}
                                </TableCell>
                            </>)}
                            {!isSearchTask && (<TableCell align="center">
                                {t("messages") || "Mensagens"}
                            </TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {taskData.executions.map((exec, idx) => (<TableRow key={exec.userTaskId || idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{formatTime(exec.executionTime)}</TableCell>
                            {isSearchTask && (<>
                                <TableCell align="center">
                                    {exec.searchDetails?.resourcesAccessedDepth || 0}
                                </TableCell>
                                <TableCell align="center">
                                    {exec.searchDetails?.queriesCount || 0}
                                </TableCell>
                            </>)}
                            {!isSearchTask && (<TableCell align="center">
                                {exec.llmDetails?.totalMessages || 0}
                            </TableCell>)}
                        </TableRow>))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    </Box>);
};

const PorParticipanteTab = ({ participants, tasksExecution, selectedUser, handleUserChange, getUserDetails, isLoadingUserDetails, formatTime, t }) => {
    const userDetails = getUserDetails();
    const selectedParticipant = participants?.find((p) => p.id === selectedUser);

    return (<Box>
        <Box sx={{mb: 3}}>
            <FormControl fullWidth>
                <InputLabel>
                    {t("select_participant") || "Selecione um participante"}
                </InputLabel>
                <Select
                    value={selectedUser}
                    label={t("select_participant") || "Selecione um participante"}
                    onChange={handleUserChange}
                >
                    {participants?.map((participant) => (<MenuItem key={participant.id} value={participant.id}>
                        {participant.name} ({participant.email})
                    </MenuItem>))}
                </Select>
            </FormControl>
        </Box>

        {isLoadingUserDetails() ? (<Box sx={{display: "flex", justifyContent: "center", py: 4}}>
            <CircularProgress/>
        </Box>) : userDetails ? (<Box>
            <Card sx={{mb: 3}}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {selectedParticipant?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {selectedParticipant?.email}
                    </Typography>
                </CardContent>
            </Card>

            {tasksExecution.map((task) => {
                const taskDetails = userDetails[task.taskId];
                if (!taskDetails || taskDetails.length === 0) return null;

                return (<Accordion key={task.taskId} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Box sx={{width: "100%"}}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {task.taskTitle}
                            </Typography>
                            <Chip
                                label={taskDetails[0]?.taskType === "search-engine" ? "Busca" : "Chat"}
                                color={taskDetails[0]?.taskType === "search-engine" ? "primary" : "secondary"}
                                size="small"
                                sx={{mt: 0.5}}
                            />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {taskDetails.map((detail, idx) => (
                            <Card key={detail.userTaskId} sx={{mb: 2, bgcolor: "grey.50"}}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="textSecondary">
                                                {t("execution_time") || "Tempo de Execução"}
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatTime(detail.executionTime)}
                                            </Typography>
                                        </Grid>

                                        {detail.taskType === "search-engine" && detail.searchDetails && (<>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    {t("resources_accessed") || "Recursos Acessados"}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {detail.searchDetails.resourcesAccessedDepth}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    {t("queries_made") || "Consultas Realizadas"}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {detail.searchDetails.queriesCount}
                                                </Typography>
                                            </Grid>

                                            {detail.searchDetails.resources && detail.searchDetails.resources.length > 0 && (
                                                <Grid item xs={12}>
                                                    <Divider sx={{my: 1}}/>
                                                    <Typography
                                                        variant="subtitle2"
                                                        gutterBottom
                                                        sx={{mt: 2}}
                                                    >
                                                        {t("browsing_history") || "Histórico de Navegação"}
                                                    </Typography>
                                                    <TableContainer>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>
                                                                        {t("title") || "Título"}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {t("time_spent") || "Tempo Gasto"}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {t("visit_time") || "Hora da Visita"}
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {detail.searchDetails.resources.map((resource, rIdx) => (
                                                                    <TableRow key={rIdx}>
                                                                        <TableCell>
                                                                            <Box
                                                                                sx={{
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: 1,
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    variant="body2">
                                                                                    {resource.title}
                                                                                </Typography>
                                                                                <a
                                                                                    href={resource.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                >
                                                                                    <OpenInNewIcon
                                                                                        fontSize="small"
                                                                                        color="primary"
                                                                                    />
                                                                                </a>
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {formatTime(resource.timeSpent)}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {new Date(resource.visitTime).toLocaleString("pt-BR")}
                                                                        </TableCell>
                                                                    </TableRow>))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Grid>)}
                                        </>)}

                                        {detail.taskType === "llm" && detail.llmDetails && (<>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    {t("total_messages") || "Total de Mensagens"}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {detail.llmDetails.totalMessages}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    {t("prompts_count") || "Prompts do Usuário"}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {detail.llmDetails.promptsCount}
                                                </Typography>
                                            </Grid>
                                        </>)}
                                    </Grid>
                                </CardContent>
                            </Card>))}
                    </AccordionDetails>
                </Accordion>);
            })}
        </Box>) : (<Paper sx={{p: 3}}>
            <Typography color="textSecondary" align="center">
                {t("no_task_details") || "Nenhum detalhe de tarefa encontrado para este participante"}
            </Typography>
        </Paper>)}
    </Box>);
};

export default InteractionMetrics;