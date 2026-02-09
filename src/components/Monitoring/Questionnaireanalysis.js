import {useState} from "react";
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

const QuestionnaireAnalysis = ({surveysStats, experimentId, accessToken, t}) => {
    const [expanded, setExpanded] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Normalização: lida com array vindo do endpoint de experimento
    // ou objeto único vindo do endpoint de survey individual
    const surveys = surveysStats?.surveys
        ? surveysStats.surveys
        : (surveysStats?.questions ? [surveysStats] : []);

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

            const blob = new Blob([csvRows.join("\n")], {type: "text/csv;charset=utf-8;"});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `survey_${survey.surveyId || "data"}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting:", error);
        } finally {
            setExporting(false);
        }
    };

    const renderQuestionChart = (question) => {
        // Mapeia o array 'options' para o formato do Recharts
        const chartData = question.options.map((opt) => ({
            name: opt.statement,
            value: opt.count,
        }));

        // Define se exibe pizza baseado no tipo (multiple-choices ou likert)
        const showPie = ["multiple-choices", "multiple-selection", "likert"].includes(question.type);

        return (
            <Grid container spacing={2}>
                <Grid item xs={12} md={showPie ? 6 : 12}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
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
                                    label={({name, percent}) =>
                                        `${name}: ${(percent * 100).toFixed(0)}%`
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
                                <Tooltip/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                )}
            </Grid>
        );
    };

    if (surveys.length === 0) {
        return (
            <Paper sx={{p: 3}}>
                <Typography color="textSecondary" align="center">
                    {t("no_questionnaires") || "Nenhum questionário disponível"}
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            {surveys.map((survey, sIdx) => (
                <Accordion
                    key={survey.surveyId || sIdx}
                    expanded={expanded === `panel-${sIdx}`}
                    onChange={handleChange(`panel-${sIdx}`)}
                    sx={{mb: 2}}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            pr: 2
                        }}>
                            <Box>
                                <Typography variant="h6">{survey.title || survey.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {survey.type?.toUpperCase()} • {survey.questions.length} {t("questions") || "questões"}
                                </Typography>
                            </Box>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{mb: 3, display: "flex", justifyContent: "flex-end"}}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={exporting ? <CircularProgress size={16}/> : <DownloadIcon/>}
                                onClick={() => handleExportCSV(survey)}
                                disabled={exporting}
                            >
                                {t("export_data") || "Exportar Dados"}
                            </Button>
                        </Box>

                        {survey.questions.map((question, qIdx) => (
                            <Card key={qIdx} sx={{mb: 3}}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {qIdx + 1}. {question.statement}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        {t("type") || "Tipo"}: {t(question.type)} •{" "}
                                        {t("total_responses") || "Total de respostas"}: {question.totalAnswers}
                                    </Typography>

                                    <Box sx={{mt: 3}}>
                                        {renderQuestionChart(question)}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default QuestionnaireAnalysis;