import { useState } from "react";
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

const QuestionnaireAnalysis = ({
  questionnaires,
  experimentId,
  accessToken,
  t,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleExportQuestionnaireData = async (questionnaireId) => {
    setExporting(true);
    try {
      // TODO: Implementar chamada real da API
      // await api.get(
      //   `experiments2/${experimentId}/questionnaires/${questionnaireId}/export`,
      //   {
      //     headers: { Authorization: `Bearer ${accessToken}` },
      //     responseType: 'blob'
      //   }
      // );

      const questionnaire = questionnaires.find(
        (q) => q.id === questionnaireId,
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create CSV
      const csvRows = ["Questão,Tipo,Opção,Respostas"];
      questionnaire.questions.forEach((question) => {
        Object.entries(question.responses).forEach(([option, count]) => {
          csvRows.push(
            `"${question.text}",${question.type},"${option}",${count}`,
          );
        });
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `questionnaire_${questionnaireId}_data.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting questionnaire:", error);
    } finally {
      setExporting(false);
    }
  };

  const renderQuestionChart = (question) => {
    const chartData = Object.entries(question.responses).map(
      ([key, value]) => ({
        name: key,
        value: value,
      }),
    );

    if (question.type === "multiple_choice") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="value"
              fill="#1976d2"
              name={t("responses") || "Respostas"}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (question.type === "likert") {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  fill="#1976d2"
                  name={t("responses") || "Respostas"}
                />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      );
    }

    return null;
  };

  const calculateStats = (question) => {
    const total = Object.values(question.responses).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (question.type === "likert") {
      const weightedSum = Object.entries(question.responses).reduce(
        (sum, [key, count]) => sum + parseInt(key) * count,
        0,
      );
      const average = (weightedSum / total).toFixed(2);

      return {
        total,
        average,
        mode: Object.entries(question.responses).reduce((a, b) =>
          a[1] > b[1] ? a : b,
        )[0],
      };
    }

    return {
      total,
      mode: Object.entries(question.responses).reduce((a, b) =>
        a[1] > b[1] ? a : b,
      )[0],
    };
  };

  if (!questionnaires || questionnaires.length === 0) {
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
      {questionnaires.map((questionnaire, qIndex) => (
        <Accordion
          key={questionnaire.id}
          expanded={expanded === `panel-${qIndex}`}
          onChange={handleChange(`panel-${qIndex}`)}
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
                <Typography variant="h6">{questionnaire.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {questionnaire.responses} {t("responses") || "respostas"} •{" "}
                  {questionnaire.questions.length}{" "}
                  {t("questions") || "questões"}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    exporting ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DownloadIcon />
                    )
                  }
                  onClick={() =>
                    handleExportQuestionnaireData(questionnaire.id)
                  }
                  disabled={exporting}
                >
                  {exporting
                    ? t("exporting") || "Exportando..."
                    : t("export_data") || "Exportar Dados"}
                </Button>
              </Box>

              {questionnaire.questions.map((question, qIdx) => {
                const stats = calculateStats(question);

                return (
                  <Card key={question.id} sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {qIdx + 1}. {question.text}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        {t("type") || "Tipo"}: {question.type} •{" "}
                        {t("total_responses") || "Total de respostas"}:{" "}
                        {stats.total}
                      </Typography>

                      {question.type === "likert" && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>{t("average") || "Média"}:</strong>{" "}
                            {stats.average} / {question.scale}
                          </Typography>
                          <Typography variant="body2">
                            <strong>{t("mode") || "Moda"}:</strong> {stats.mode}
                          </Typography>
                        </Box>
                      )}

                      {question.type === "multiple_choice" && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>
                              {t("most_selected") || "Mais selecionada"}:
                            </strong>{" "}
                            {stats.mode}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ mt: 3 }}>{renderQuestionChart(question)}</Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default QuestionnaireAnalysis;
