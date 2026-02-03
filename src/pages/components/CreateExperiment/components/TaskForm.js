import React from "react";
import {
  TextField,
  Button,
  FormControl,
  Box,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  styled,
} from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  LLM_TYPES,
  SEARCH_ENGINES,
  RULES_EXPERIMENT_TYPES,
  SCORE_TYPES,
} from "../constants/experimentConstants";

// Styled Components
const CustomContainer = styled("div")(({ theme }) => ({
  backgroundColor: "#fafafa",
  borderRadius: "8px",
  padding: "0px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  "& .ql-toolbar": {
    backgroundColor: "#f5f5f5",
    borderRadius: "8px 8px 0 0",
  },
  "& .ql-container": {
    minHeight: "200px",
    borderRadius: "0 0 8px 8px",
  },
  "& .ql-editor": {
    fontFamily: theme.typography.fontFamily,
    lineHeight: 1.6,
    color: "#444",
  },
}));

/**
 * Task Form Component - Used for both Create and Edit
 */
const TaskForm = ({
  config,
  onSubmit,
  onCancel,
  isLoading,
  experimentType,
  btypeExperiment,
  experimentSurveys,
  scoreType,
  setScoreType,
  t,
}) => {
  // Render Rules Section (for between-subject + rules_based)
  const renderRulesSection = () => {
    if (experimentType !== "between-subject" || btypeExperiment !== "rules_based")
      return null;

    return (
      <Grid container spacing={2} alignItems="center">
        {/* Rule Type Selector */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
            <InputLabel>{t("Separation_rule")}</InputLabel>
            <Select
              fullWidth
              value={config.rulesExp}
              onChange={(e) => config.setRulesExp(e.target.value)}
              label={t("Separation_rule")}
            >
              {RULES_EXPERIMENT_TYPES.map((stype) => (
                <MenuItem key={stype.value} value={stype.value}>
                  {stype.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Survey Selector */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
            <InputLabel>{t("select_survey")}</InputLabel>
            <Select
              fullWidth
              value={config.survey}
              onChange={config.setSurvey}
              label={t("select_survey")}
            >
              {experimentSurveys?.length > 0 ? (
                experimentSurveys.map((survey) => (
                  <MenuItem key={survey.id} value={survey}>
                    {survey.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>{t("no_survey_available")}</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* Questions Selector (Only if Rule is 'question') */}
        {config.rulesExp === "question" && (
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
              <InputLabel>{t("select_question")}</InputLabel>
              <Select
                fullWidth
                value={config.questions}
                onChange={config.setQuestions}
                label={t("select_question")}
                multiple
                renderValue={(selected) =>
                  config.survey?.questions
                    .filter((q) => selected.includes(q))
                    .map((q) => q.statement || "Sem enunciado")
                    .join(", ")
                }
              >
                {config.survey?.questions && config.survey.questions.length > 0 ? (
                  config.survey.questions
                    .filter(
                      (q) =>
                        (q.type === "multiple-selection" ||
                          q.type === "multiple-choices") &&
                        q.hasscore
                    )
                    .map((question) => (
                      <MenuItem key={question.id} value={question}>
                        <Checkbox checked={config.questions.includes(question)} />
                        {question.statement || "Sem enunciado"}
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>{t("no_questions_available")}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Score Type Logic (Unic vs Min/Max) */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
            <InputLabel>{t("select_survey_th")}</InputLabel>
            <Select
              fullWidth
              value={scoreType}
              onChange={(e) => setScoreType(e.target.value)}
              label={t("select_survey_th")}
            >
              {SCORE_TYPES.map((stype) => (
                <MenuItem key={stype.value} value={stype.value}>
                  {t(stype.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {scoreType === "unic" ? (
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label={t("score_Threshold_unic")}
              value={config.threshold}
              onChange={(e) => {
                const value = Number(e.target.value);
                config.setThreshold(value);
                config.setThresholdMx(value);
              }}
            />
          </Grid>
        ) : (
          <>
            <Grid item xs={12} sm={config.rulesExp === "score" ? 4 : 2}>
              <TextField
                fullWidth
                margin="normal"
                type="number"
                label={t("score_Threshold_min")}
                value={config.threshold}
                onChange={(e) => {
                  const minValue = Number(e.target.value);
                  if (minValue <= config.thresholdMx) {
                    config.setThreshold(minValue);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={config.rulesExp === "score" ? 4 : 2}>
              <TextField
                fullWidth
                margin="normal"
                type="number"
                label={t("score_Threshold_max")}
                value={config.thresholdMx}
                onChange={(e) => {
                  const maxValue = Number(e.target.value);
                  if (maxValue >= config.threshold) {
                    config.setThresholdMx(maxValue);
                  }
                }}
                inputProps={{ min: config.threshold }}
              />
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  return (
    <form onSubmit={onSubmit}>
      <TextField
        label={t("task_title")}
        error={!config.isTitleValid}
        helperText={!config.isTitleValid ? t("invalid_name_message") : ""}
        variant="outlined"
        fullWidth
        margin="normal"
        value={config.title}
        onChange={config.setTitle}
        required
      />

      {/* SOURCE & KEYS SECTION */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
            <InputLabel id="origin-label">{t("select_source")}</InputLabel>
            <Select
              fullWidth
              labelId="origin-label"
              value={config.origin}
              onChange={(e) => config.setOrigin(e.target.value)}
              label={t("select_source")}
            >
              <MenuItem value="llm">Large Language Model</MenuItem>
              <MenuItem value="search-engine">{t("search_engine")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* LLM Selection */}
        {config.origin === "llm" && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
              <InputLabel id="llm-select-label">{t("select_llm")}</InputLabel>
              <Select
                fullWidth
                labelId="llm-select-label"
                value={config.llm}
                onChange={(e) => config.setLlm(e.target.value)}
                label={t("select_llm")}
              >
                {LLM_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
                <optgroup label={t("more_soon")}></optgroup>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Search Engine Selection */}
        {config.origin === "search-engine" && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
              <InputLabel id="search-engine-label">
                {t("select_search_engine")}
              </InputLabel>
              <Select
                fullWidth
                labelId="search-engine-label"
                value={config.searchEngine}
                onChange={(e) => config.setSearchEngine(e.target.value)}
                label={t("select_search_engine")}
              >
                {SEARCH_ENGINES.map((engine) => (
                  <MenuItem key={engine.value} value={engine.value}>
                    {engine.label}
                  </MenuItem>
                ))}
                <optgroup label={t("more_soon")}></optgroup>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* --- API KEY INPUTS --- */}

        {/* Case 1: LLM (Gemini Key) */}
        {config.origin === "llm" && config.llm === "gemini" && (
          <Grid item xs={12}>
            <TextField
              label="Gemini API Key"
              variant="outlined"
              fullWidth
              margin="normal"
              value={config.geminiKey}
              onChange={(e) => config.setGeminiKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
            />
          </Grid>
        )}

        {/* Case 2: Search Engine (Google Key & CX) */}
        {config.origin === "search-engine" && config.searchEngine === "google" && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Google API Key"
                variant="outlined"
                fullWidth
                margin="normal"
                value={config.googleKey}
                onChange={(e) => config.setGoogleKey(e.target.value)}
                placeholder="Enter Google API Key"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Google CX (Search Engine ID)"
                variant="outlined"
                fullWidth
                margin="normal"
                value={config.cx}
                onChange={(e) => config.setCx(e.target.value)}
                placeholder="Enter Google CX"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Dynamic Rules Section based on Experiment Type */}
      {renderRulesSection()}

      <TextField
        label={t("task_summary")}
        error={!config.isSummaryValid}
        helperText={!config.isSummaryValid ? t("invalid_name_message") : ""}
        variant="outlined"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={config.summary}
        onChange={config.setSummary}
        required
      />

      <div style={{ width: "100%", marginTop: "16.5px", marginBottom: "16px" }}>
        <CustomContainer>
          <ReactQuill
            value={config.description}
            onChange={config.setDescription}
            placeholder={t("task_Desc1")}
          />
        </CustomContainer>
      </div>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          width: "100%",
          mt: 2,
        }}
      >
        <Button variant="contained" onClick={onCancel} color="primary">
          {t("cancel")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!config.isValidForm || isLoading}
        >
          {config.mode === "create" ? t("create") : t("save")}
        </Button>
      </Box>
    </form>
  );
};

export default TaskForm;
