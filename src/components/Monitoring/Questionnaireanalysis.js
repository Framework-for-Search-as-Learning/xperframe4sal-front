import { useState, useEffect } from "react";
import {
    Paper,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
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
import { api } from "../../config/axios";

const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
];

const QuestionnaireAnalysis = ({ surveysStats, participants, experimentId, accessToken, t }) => {
    const [expanded, setExpanded] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [surveyAnswers, setSurveyAnswers] = useState({});
    const [loadingAnswers, setLoadingAnswers] = useState({});

    const surveys = surveysStats?.surveys
        ? surveysStats.surveys
        : surveysStats?.questions
            ? [surveysStats]
            : [];

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleExportCSV = async (survey) => {
        setExporting(true);
        try {
            const csvRows = ["Questão,Tipo,Opção,Respostas,Porcentagem"];
            survey.questions.forEach((q) => {
                q.options.forEach((opt) => {
                    csvRows.push(
                        `"${q.statement}",${q.type},"${opt.statement}",${opt.count},${opt.percentage}%`
                    );
                });
            });

            const blob = new Blob([csvRows.join("\n")], {
                type: "text/csv;charset=utf-8;",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `survey_${survey.surveyId || "data"}_${new Date().toISOString().split("T")[0]
                }.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting:", error);
        } finally {
            setExporting(false);
        }
    };

    const loadUserSurveyAnswers = async (userId, surveyId) => {
        const key = `${userId}-${surveyId}`;
        if (surveyAnswers[key]) return;

        setLoadingAnswers((prev) => ({ ...prev, [key]: true }));
        try {
            const { data } = await api.get(
                `survey-answer/user/${userId}/survey/${surveyId}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setSurveyAnswers((prev) => ({ ...prev, [key]: data }));
        } catch (error) {
            console.error("Error loading user survey answers:", error);
        } finally {
            setLoadingAnswers((prev) => ({ ...prev, [key]: false }));
        }
    };

    const renderQuestionChart = (question) => {
        const chartData = question.options.map((opt) => ({
            name: opt.statement,
            value: opt.count,
            percentage: opt.percentage,
        }));

        const showPie = [
            "multiple-choices",
            "multiple-selection",
            "likert",
        ].includes(question.type);

        return (
            <Grid container spacing={2}>
                <Grid item xs={12} md={showPie ? 6 : 12}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name, props) => [
                                    `${value} (${props.payload.percentage.toFixed(1)}%)`,
                                    t("responses") || "Respostas",
                                ]}
                            />
                            <Legend />
                            <Bar
                                dataKey="value"
                                fill="#1976d2"
                                name={t("responses") || "Respostas"}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Grid>
                {showPie && (
                    <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) =>
                                        `${name}: ${percentage.toFixed(1)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name, props) => [
                                        `${value} (${props.payload.percentage.toFixed(1)}%)`,
                                        name,
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                )}
            </Grid>
        );
    };

    if (surveys.length === 0) {
        return (
            <Paper sx={{ p: 3 }}>
                <Typography color="textSecondary" align="center">
                    {t("no_questionnaires") || "Nenhum questionário disponível"}
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            {surveys.map((survey, sIdx) => (
                <SurveyAccordion
                    key={survey.surveyId || sIdx}
                    survey={survey}
                    sIdx={sIdx}
                    expanded={expanded}
                    handleChange={handleChange}
                    handleExportCSV={handleExportCSV}
                    exporting={exporting}
                    renderQuestionChart={renderQuestionChart}
                    participants={participants}
                    surveyAnswers={surveyAnswers}
                    loadingAnswers={loadingAnswers}
                    loadUserSurveyAnswers={loadUserSurveyAnswers}
                    t={t}
                />
            ))}
        </Box>
    );
};

const SurveyAccordion = ({
    survey,
    sIdx,
    expanded,
    handleChange,
    handleExportCSV,
    exporting,
    renderQuestionChart,
    participants,
    surveyAnswers,
    loadingAnswers,
    loadUserSurveyAnswers,
    t,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedQuestion, setSelectedQuestion] = useState("");
    const [selectedUser, setSelectedUser] = useState("");

    useEffect(() => {
        if (activeTab === 1 && survey.questions.length > 0 && !selectedQuestion) {
            setSelectedQuestion(survey.questions[0].statement);
        }
    }, [activeTab, survey.questions, selectedQuestion]);

    useEffect(() => {
        if (activeTab === 2 && participants?.length > 0 && !selectedUser) {
            setSelectedUser(participants[0].id);
            loadUserSurveyAnswers(participants[0].id, survey.surveyId);
        }
    }, [activeTab, participants, selectedUser, survey.surveyId]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleQuestionChange = (event) => {
        setSelectedQuestion(event.target.value);
    };

    const handleUserChange = (event) => {
        const userId = event.target.value;
        setSelectedUser(userId);
        loadUserSurveyAnswers(userId, survey.surveyId);
    };

    const getSelectedQuestionData = () => {
        return survey.questions.find((q) => q.statement === selectedQuestion);
    };

    const getUserAnswers = () => {
        if (!selectedUser) return null;
        const key = `${selectedUser}-${survey.surveyId}`;
        return surveyAnswers[key];
    };

    const isLoadingUserAnswers = () => {
        if (!selectedUser) return false;
        const key = `${selectedUser}-${survey.surveyId}`;
        return loadingAnswers[key] || false;
    };

    return (
        <Accordion
            expanded={expanded === `panel-${sIdx}`}
            onChange={handleChange(`panel-${sIdx}`)}
            sx={{ mb: 2 }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        pr: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h6">
                            {survey.title || survey.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {survey.type?.toUpperCase()} • {survey.questions.length}{" "}
                            {t("questions") || "questões"}
                        </Typography>
                    </Box>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Box>
                    <Paper sx={{ mb: 2 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                        >
                            <Tab label={t("summary") || "Resumo"} />
                            <Tab label={t("question") || "Pergunta"} />
                            <Tab label={t("individual") || "Individual"} />
                        </Tabs>
                    </Paper>

                    {activeTab === 0 && (
                        <ResumoTab
                            survey={survey}
                            handleExportCSV={handleExportCSV}
                            exporting={exporting}
                            renderQuestionChart={renderQuestionChart}
                            t={t}
                        />
                    )}

                    {activeTab === 1 && (
                        <PerguntaTab
                            survey={survey}
                            selectedQuestion={selectedQuestion}
                            handleQuestionChange={handleQuestionChange}
                            getSelectedQuestionData={getSelectedQuestionData}
                            renderQuestionChart={renderQuestionChart}
                            t={t}
                        />
                    )}

                    {activeTab === 2 && (
                        <IndividualTab
                            survey={survey}
                            participants={participants}
                            selectedUser={selectedUser}
                            handleUserChange={handleUserChange}
                            getUserAnswers={getUserAnswers}
                            isLoadingUserAnswers={isLoadingUserAnswers}
                            t={t}
                        />
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

const ResumoTab = ({
    survey,
    handleExportCSV,
    exporting,
    renderQuestionChart,
    t,
}) => {
    return (
        <Box>
            <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                        exporting ? <CircularProgress size={16} /> : <DownloadIcon />
                    }
                    onClick={() => handleExportCSV(survey)}
                    disabled={exporting}
                >
                    {t("export_data") || "Exportar Dados"}
                </Button>
            </Box>

            {survey.questions.map((question, qIdx) => (
                <Card key={qIdx} sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {qIdx + 1}. {question.statement}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {t("type") || "Tipo"}: {question.type} •{" "}
                            {t("total_responses") || "Total de respostas"}:{" "}
                            {question.totalAnswers}
                        </Typography>

                        <Box sx={{ mt: 3 }}>{renderQuestionChart(question)}</Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

const PerguntaTab = ({
    survey,
    selectedQuestion,
    handleQuestionChange,
    getSelectedQuestionData,
    renderQuestionChart,
    t,
}) => {
    const questionData = getSelectedQuestionData();

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                    <InputLabel>{t("select_question") || "Selecione uma pergunta"}</InputLabel>
                    <Select
                        value={selectedQuestion}
                        label={t("select_question") || "Selecione uma pergunta"}
                        onChange={handleQuestionChange}
                    >
                        {survey.questions.map((q, idx) => (
                            <MenuItem key={idx} value={q.statement}>
                                {idx + 1}. {q.statement}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {questionData && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {questionData.statement}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {t("type") || "Tipo"}: {questionData.type} •{" "}
                            {t("total_responses") || "Total de respostas"}:{" "}
                            {questionData.totalAnswers} {t("responses") || "respostas"}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 3 }}>
                            {questionData.options.map((option, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 1,
                                        p: 1,
                                        bgcolor: "grey.50",
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography variant="body2">{option.statement}</Typography>
                                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                        <Typography variant="body2" fontWeight="bold">
                                            {option.count} {t("responses") || "respostas"}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="primary"
                                            fontWeight="bold"
                                        >
                                            {option.percentage.toFixed(1)}%
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ mt: 3 }}>{renderQuestionChart(questionData)}</Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

const IndividualTab = ({
    survey,
    participants,
    selectedUser,
    handleUserChange,
    getUserAnswers,
    isLoadingUserAnswers,
    t,
}) => {
    const userAnswersData = getUserAnswers();
    const selectedParticipant = participants?.find((p) => p.id === selectedUser);

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                    <InputLabel>{t("select_participant") || "Selecione um participante"}</InputLabel>
                    <Select
                        value={selectedUser}
                        label={t("select_participant") || "Selecione um participante"}
                        onChange={handleUserChange}
                    >
                        {participants?.map((participant) => (
                            <MenuItem key={participant.id} value={participant.id}>
                                {participant.name} ({participant.email})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {isLoadingUserAnswers() ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : userAnswersData ? (
                <Card>
                    <CardContent>
                        <Box sx={{ mb: 3, p: 2, bgcolor: "primary.50", borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {selectedParticipant?.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {selectedParticipant?.email}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                {t("answered_at") || "Respondido em"}:{" "}
                                {new Date(userAnswersData.createdAt).toLocaleString("pt-BR")}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {t("total_score") || "Pontuação total"}: {userAnswersData.score}
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            {t("answers") || "Respostas"}
                        </Typography>

                        {userAnswersData.answers.map((answer, idx) => (
                            <Card key={answer.id} sx={{ mb: 2, bgcolor: "grey.50" }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        {idx + 1}. {answer.questionStatement}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="textSecondary"
                                        display="block"
                                        gutterBottom
                                    >
                                        {t("type") || "Tipo"}: {answer.questionType} •{" "}
                                        {t("score") || "Pontuação"}: {answer.score}
                                    </Typography>

                                    {answer.questionType === "open" && (
                                        <Box sx={{ mt: 1, p: 2, bgcolor: "white", borderRadius: 1 }}>
                                            <Typography variant="body2">
                                                {answer.textAnswer || "-"}
                                            </Typography>
                                        </Box>
                                    )}

                                    {(answer.questionType === "multiple-choices" ||
                                        answer.questionType === "multiple-selection") &&
                                        answer.selectedOptions && (
                                            <Box sx={{ mt: 1 }}>
                                                {answer.selectedOptions.map((option, optIdx) => (
                                                    <Box
                                                        key={optIdx}
                                                        sx={{
                                                            p: 1.5,
                                                            mb: 1,
                                                            bgcolor: "white",
                                                            borderRadius: 1,
                                                            border: "2px solid",
                                                            borderColor: "primary.main",
                                                        }}
                                                    >
                                                        <Typography variant="body2">
                                                            {option.statement}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {t("score") || "Pontuação"}: {option.score}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <Paper sx={{ p: 3 }}>
                    <Typography color="textSecondary" align="center">
                        {t("no_answers_found") || "Nenhuma resposta encontrada para este participante"}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default QuestionnaireAnalysis;