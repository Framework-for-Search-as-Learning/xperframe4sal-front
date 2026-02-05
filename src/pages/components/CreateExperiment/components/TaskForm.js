import React, { useMemo, useEffect } from "react";
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
    LLM_PROVIDERS,
    LLM_MODELS_BY_PROVIDER,
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
    // Get available models based on selected provider
    const availableModels = useMemo(() => {
        if (!config.llmProvider) return [];
        return LLM_MODELS_BY_PROVIDER[config.llmProvider] || [];
    }, [config.llmProvider]);

    // Reset model when provider changes
    useEffect(() => {
        if (config.llmProvider && config.llm) {
            // Check if current model is valid for selected provider
            const isValidModel = availableModels.some(model => model.value === config.llm);
            if (!isValidModel) {
                config.setLlm(""); // Reset if model not available for this provider
            }
        }
    }, [config.llmProvider]); // Only run when provider changes

    // Determine which API key field to show based on provider and model
    const getApiKeyFieldInfo = () => {
        if (config.origin !== "llm" || !config.llmProvider) return null;

        switch (config.llmProvider) {
            case "openai":
                return { label: "OpenAI API Key", placeholder: "sk-..." };
            case "anthropic":
                return { label: "Anthropic API Key", placeholder: "sk-ant-..." };
            case "google":
                return { label: "Google AI API Key", placeholder: "AIza..." };
            case "cohere":
                return { label: "Cohere API Key", placeholder: "..." };
            case "mistral":
                return { label: "Mistral API Key", placeholder: "..." };
            default:
                return null;
        }
    };

    const apiKeyInfo = getApiKeyFieldInfo();

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

            {/* SOURCE & PROVIDER SECTION */}
            <Grid container spacing={2} alignItems="flex-start">
                {/* Linha 1: Source + Provider/Search Engine */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
                        <InputLabel id="origin-label">{t("select_source")}</InputLabel>
                        <Select
                            fullWidth
                            labelId="origin-label"
                            value={config.origin}
                            onChange={(e) => {
                                config.setOrigin(e.target.value);
                                // Reset provider and model when changing source
                                config.setLlmProvider("");
                                config.setLlm("");
                            }}
                            label={t("select_source")}
                            required
                        >
                            <MenuItem value="llm">Chat</MenuItem>
                            <MenuItem value="search-engine">{t("search_engine")}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Condicional: LLM Provider OU Search Engine */}
                {config.origin === "llm" ? (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
                            <InputLabel id="llm-provider-label">
                                {t("select_llm_provider")}
                            </InputLabel>
                            <Select
                                fullWidth
                                labelId="llm-provider-label"
                                value={config.llmProvider || ""}
                                onChange={(e) => {
                                    config.setLlmProvider(e.target.value);
                                    // Reset model when provider changes
                                    config.setLlm("");
                                }}
                                label={t("select_llm_provider")}
                                required
                            >
                                {LLM_PROVIDERS.map((provider) => (
                                    <MenuItem key={provider.value} value={provider.value}>
                                        {provider.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                ) : config.origin === "search-engine" ? (
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
                                required
                            >
                                {SEARCH_ENGINES.map((engine) => (
                                    <MenuItem key={engine.value} value={engine.value}>
                                        {engine.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                ) : null}

                {/* Linha 2: LLM Model (DINÂMICO baseado no provider) */}
                {config.origin === "llm" && config.llmProvider && (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal" sx={{ minWidth: 120 }}>
                            <InputLabel id="llm-select-label">{t("select_llm")}</InputLabel>
                            <Select
                                fullWidth
                                labelId="llm-select-label"
                                value={config.llm}
                                onChange={(e) => config.setLlm(e.target.value)}
                                label={t("select_llm")}
                                required
                            >
                                {availableModels.length > 0 ? (
                                    availableModels.map((model) => (
                                        <MenuItem key={model.value} value={model.value}>
                                            {model.label}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>
                                        {t("no_models_available") || "Nenhum modelo disponível"}
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                {/* API KEY - Dinâmica baseada no provider */}
                {config.origin === "llm" && config.llmProvider && apiKeyInfo && (
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label={apiKeyInfo.label}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={config.geminiKey} // Você pode criar campos específicos ou usar genérico
                            onChange={(e) => config.setGeminiKey(e.target.value)}
                            placeholder={apiKeyInfo.placeholder}
                            required
                        />
                    </Grid>
                )}

                {/* Google Search API Keys */}
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
                                required
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
                                required
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