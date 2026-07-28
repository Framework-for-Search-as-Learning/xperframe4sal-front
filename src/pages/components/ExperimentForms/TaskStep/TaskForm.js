/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useEffect, useRef, useState } from 'react';
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
  Autocomplete,
  FormHelperText,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  SEARCH_ENGINES,
  RULES_EXPERIMENT_TYPES,
  SCORE_TYPES,
} from '../constants/experimentConstants';
import { api } from '../../../../config/axios';
import {
  getDefaultModel,
  getFirstProviderValue,
  getProviderByValue,
  normalizeLlmModelsResponse,
  normalizeLlmProviders,
} from './llmProviderCatalog';

const CustomContainer = styled('div')(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  overflow: 'hidden',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: '#94a3b8',
  },
  '&:focus-within': {
    borderColor: '#0284c7',
    boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.15)',
  },
  '& .ql-toolbar': {
    backgroundColor: '#f8fafc',
    border: 'none',
    borderBottom: '1px solid #e2e8f0',
    fontFamily: theme.typography.fontFamily,
  },
  '& .ql-container': {
    minHeight: '150px',
    border: 'none',
    fontFamily: theme.typography.fontFamily,
  },
  '& .ql-editor': {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: '#1e293b',
    '&.ql-blank::before': {
      color: '#94a3b8',
      fontStyle: 'normal',
    },
  },
}));

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
  const stripHtml = (html) => html.replace(/<[^>]*>/g, '').trim();
  const [isDescEmpty, setIsDescEmpty] = useState(() => stripHtml(config.description || '').length === 0);
  const [llmProviders, setLlmProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState('');
  const [modelSuggestions, setModelSuggestions] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState('');
  const { origin, llmProvider, llm } = config;
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const accessToken = user?.accessToken;
  const setLlmRef = useRef(config.setLlm);
  const setLlmProviderRef = useRef(config.setLlmProvider);
  const llmRef = useRef(llm);
  const llmProviderValueRef = useRef(llmProvider);

  const [enableSurveys, setEnableSurveys] = useState(
    () => (config.linkedSurveyRefs || []).length > 0
  );

  useEffect(() => {
    if ((config.linkedSurveyRefs || []).length > 0) {
      setEnableSurveys(true);
    }
  }, [config.linkedSurveyRefs]);

  useEffect(() => {
    setLlmRef.current = config.setLlm;
    setLlmProviderRef.current = config.setLlmProvider;
  }, [config.setLlm, config.setLlmProvider]);

  useEffect(() => {
    llmRef.current = llm;
    llmProviderValueRef.current = llmProvider;
  }, [llm, llmProvider]);

  useEffect(() => {
    if (origin !== 'llm') return;

    let isMounted = true;

    const loadProviders = async () => {
      setProvidersLoading(true);
      setProvidersError('');

      try {
        const response = await api.get('/llm-session/providers', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const providers = normalizeLlmProviders(response.data);

        if (!isMounted) return;

        setLlmProviders(providers);

        if (providers.length === 0) {
          setProvidersError('Nenhum provider de IA foi retornado pela API.');
          setModelSuggestions([]);
          return;
        }

        const selectedProvider = getProviderByValue(providers, llmProviderValueRef.current);
        if (!selectedProvider) {
          const nextProvider = getFirstProviderValue(providers);
          setLlmProviderRef.current(nextProvider);
          if (!llmRef.current) {
            setLlmRef.current(getDefaultModel(providers, nextProvider));
          }
        } else if (!llmRef.current) {
          setLlmRef.current(getDefaultModel(providers, selectedProvider.value));
        }
      } catch (error) {
        console.error('Erro ao carregar providers de IA:', error);
        if (isMounted) {
          setLlmProviders([]);
          setModelSuggestions([]);
          setProvidersError('Não foi possível carregar os providers de IA.');
        }
      } finally {
        if (isMounted) {
          setProvidersLoading(false);
        }
      }
    };

    loadProviders();

    return () => {
      isMounted = false;
    };
  }, [origin, accessToken]);

  useEffect(() => {
    if (origin !== 'llm') return;

    let isMounted = true;

    const loadModels = async () => {
      if (!llmProvider) {
        setModelSuggestions([]);
        setModelsError('');
        return;
      }

      setModelsLoading(true);
      setModelsError('');

      try {
        const response = await api.get(`/llm-session/providers/${llmProvider}/models`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const modelCatalog = normalizeLlmModelsResponse(response.data);
        const models = modelCatalog.suggestedModels;

        if (isMounted) {
          setModelSuggestions(models);
          if (!llmRef.current) {
            setLlmRef.current(modelCatalog.defaultModel || models[0] || '');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar modelos de IA:', error);
        if (isMounted) {
          setModelSuggestions([]);
          setModelsError('Não foi possível carregar os modelos do provider selecionado.');
        }
      } finally {
        if (isMounted) {
          setModelsLoading(false);
        }
      }
    };

    loadModels();

    return () => {
      isMounted = false;
    };
  }, [origin, llmProvider, accessToken]);

  const getApiKeyFieldInfo = () => {
    if (config.origin !== 'llm' || !config.llmProvider) return null;
    return { label: 'API Key', placeholder: 'sk-or-...' };
  };

  const apiKeyInfo = getApiKeyFieldInfo();

  const renderRulesSection = () => {
    if (experimentType !== 'between-subject' || btypeExperiment !== 'rules_based') return null;

    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 2 }}>
          Regras de Separação de Grupo
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="sep-rule-label">{t('Separation_rule')}</InputLabel>
              <Select
                labelId="sep-rule-label"
                value={config.rulesExp || ''}
                onChange={(e) => config.setRulesExp(e.target.value)}
                label={t('Separation_rule')}
              >
                {RULES_EXPERIMENT_TYPES.map((stype) => (
                  <MenuItem key={stype.value} value={stype.value}>
                    {stype.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="select-survey-label">{t('select_survey')}</InputLabel>
              <Select
                labelId="select-survey-label"
                value={config.survey || ''}
                onChange={config.setSurvey}
                label={t('select_survey')}
              >
                {experimentSurveys?.length > 0 ? (
                  experimentSurveys.map((survey) => (
                    <MenuItem key={survey.id} value={survey}>
                      {survey.title}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>{t('no_survey_available')}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {config.rulesExp === 'question' && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="select-question-label">{t('select_question')}</InputLabel>
                <Select
                  labelId="select-question-label"
                  value={(config.questions ?? []).map((q) => q.id)}
                  onChange={(e) => {
                    const selectedIds = e.target.value;
                    const selectedObjs =
                      config.survey?.questions
                        ?.filter((q) => selectedIds.includes(q.id))
                        .map((q) => ({ id: q.id })) || [];
                    config.setQuestions({ target: { value: selectedObjs } });
                  }}
                  label={t('select_question')}
                  multiple
                  renderValue={(selectedIds) =>
                    config.survey?.questions
                      ?.filter((q) => selectedIds.includes(q.id))
                      .map((q) => q.statement || 'Sem enunciado')
                      .join(', ') || ''
                  }
                >
                  {config.survey?.questions && config.survey.questions.length > 0 ? (
                    config.survey.questions
                      .filter(
                        (q) =>
                          (q.type === 'multiple-selection' || q.type === 'multiple-choices') &&
                          q.hasscore,
                      )
                      .map((question) => (
                        <MenuItem key={question.id} value={question.id}>
                          <Checkbox
                            size="small"
                            checked={(config.questions ?? []).some((q) => q.id === question.id)}
                          />
                          {question.statement || 'Sem enunciado'}
                        </MenuItem>
                      ))
                  ) : (
                    <MenuItem disabled>{t('no_questions_available')}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="survey-th-label">{t('select_survey_th')}</InputLabel>
              <Select
                labelId="survey-th-label"
                value={scoreType || ''}
                onChange={(e) => setScoreType(e.target.value)}
                label={t('select_survey_th')}
              >
                {SCORE_TYPES.map((stype) => (
                  <MenuItem key={stype.value} value={stype.value}>
                    {t(stype.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {scoreType === 'unic' ? (
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('score_Threshold_unic')}
                value={config.threshold || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  config.setThreshold(value);
                  config.setThresholdMx(value);
                }}
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} sm={config.rulesExp === 'score' ? 4 : 2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t('score_Threshold_min')}
                  value={config.threshold || ''}
                  onChange={(e) => {
                    const minValue = Number(e.target.value);
                    if (minValue <= config.thresholdMx) {
                      config.setThreshold(minValue);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={config.rulesExp === 'score' ? 4 : 2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t('score_Threshold_max')}
                  value={config.thresholdMx || ''}
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
      </Box>
    );
  };

  const hasExtraInteractionFields = Boolean(config.origin);

  return (
    <form onSubmit={onSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <TextField
          size="small"
          label={t('task_title')}
          error={!config.isTitleValid}
          helperText={!config.isTitleValid ? t('invalid_name_message') : ''}
          variant="outlined"
          fullWidth
          value={config.title || ''}
          onChange={config.setTitle}
          required
        />

        <Box
          sx={{
            p: 2.5,
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 2 }}>
            Configuração da Interface de Interação
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={hasExtraInteractionFields ? 6 : 12}>
              <FormControl fullWidth size="small">
                <InputLabel id="origin-label">{t('select_source')}</InputLabel>
                <Select
                  labelId="origin-label"
                  value={config.origin || ''}
                  onChange={(e) => {
                    config.setOrigin(e.target.value);
                    config.setLlmProvider('');
                    config.setLlm('');
                  }}
                  label={t('select_source')}
                  required
                >
                  <MenuItem value="llm">Chat</MenuItem>
                  <MenuItem value="search-engine">{t('search_engine')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {config.origin === 'llm' ? (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="llm-provider-label">{t('select_llm_provider')}</InputLabel>
                  <Select
                    labelId="llm-provider-label"
                    value={config.llmProvider || ''}
                    onChange={(e) => {
                      const provider = e.target.value;
                      config.setLlmProvider(provider);
                      config.setLlm('');
                    }}
                    label={t('select_llm_provider')}
                    required
                    disabled={providersLoading || llmProviders.length === 0}
                  >
                    {providersLoading && (
                      <MenuItem disabled value="">
                        Carregando providers...
                      </MenuItem>
                    )}
                    {llmProviders.map((provider) => (
                      <MenuItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {(providersError || (!providersLoading && llmProviders.length === 0)) && (
                    <FormHelperText error>
                      {providersError || 'Nenhum provider de IA disponível.'}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            ) : config.origin === 'search-engine' ? (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="search-engine-label">{t('select_search_engine')}</InputLabel>
                  <Select
                    labelId="search-engine-label"
                    value={config.searchEngine || ''}
                    onChange={(e) => config.setSearchEngine(e.target.value)}
                    label={t('select_search_engine')}
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

            {config.origin === 'llm' && config.llmProvider && (
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  fullWidth
                  options={modelSuggestions}
                  value={config.llm || ''}
                  inputValue={config.llm || ''}
                  loading={modelsLoading}
                  loadingText="Carregando modelos..."
                  noOptionsText="Nenhum modelo sugerido para este provider."
                  onChange={(_, value) => config.setLlm(value || '')}
                  onInputChange={(_, value) => config.setLlm(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label={t('select_llm')}
                      required
                      error={Boolean(modelsError)}
                      helperText={
                        modelsError ||
                        'Selecione uma sugestão ou digite outro modelo suportado.'
                      }
                    />
                  )}
                />
              </Grid>
            )}

            {config.origin === 'llm' && config.llmProvider && apiKeyInfo && (
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  label={apiKeyInfo.label}
                  variant="outlined"
                  fullWidth
                  value={config.geminiKey || ''}
                  onChange={(e) => config.setGeminiKey(e.target.value)}
                  placeholder={apiKeyInfo.placeholder}
                  helperText="Mantenha mascarada para preservar a chave atual ou insira nova."
                  required
                />
              </Grid>
            )}

            {config.origin === 'llm' && config.llmProvider && (
              <Grid item xs={12}>
                <TextField
                  size="small"
                  label={t('system_instruction')}
                  placeholder={t('system_instruction_placeholder')}
                  helperText={t('system_instruction_help')}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={config.systemInstruction || ''}
                  onChange={(e) => config.setSystemInstruction(e.target.value)}
                />
              </Grid>
            )}

            {config.origin === 'search-engine' && config.searchEngine === 'google' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Google API Key"
                    variant="outlined"
                    fullWidth
                    value={config.googleKey || ''}
                    onChange={(e) => config.setGoogleKey(e.target.value)}
                    placeholder="Enter Google API Key"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Google CX (Search Engine ID)"
                    variant="outlined"
                    fullWidth
                    value={config.cx || ''}
                    onChange={(e) => config.setCx(e.target.value)}
                    placeholder="Enter Google CX"
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>

        {renderRulesSection()}

        {experimentSurveys?.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
              backgroundColor: enableSurveys ? '#f8fafc' : 'transparent',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={enableSurveys}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setEnableSurveys(isChecked);
                    if (!isChecked) {
                      config.setLinkedSurveyRefs([]);
                    }
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155' }}>
                    Vincular Questionários
                  </Typography>
                  <Chip
                    label="Opcional"
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      color: '#64748b',
                      borderColor: '#cbd5e1',
                    }}
                  />
                </Box>
              }
            />

            {enableSurveys && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="linked-surveys-label">{t('linked_surveys_for_task')}</InputLabel>
                  <Select
                    labelId="linked-surveys-label"
                    multiple
                    value={config.linkedSurveyRefs || []}
                    onChange={(e) => config.setLinkedSurveyRefs(e.target.value)}
                    label={t('linked_surveys_for_task')}
                    renderValue={(selected) =>
                      experimentSurveys
                        .filter((s) => selected.includes(s._id || s.uuid))
                        .map((s) => s.title)
                        .join(', ')
                    }
                  >
                    {experimentSurveys.map((survey) => {
                      const surveyId = survey._id || survey.uuid;
                      return (
                        <MenuItem key={surveyId} value={surveyId}>
                          <Checkbox
                            size="small"
                            checked={(config.linkedSurveyRefs || []).includes(surveyId)}
                          />
                          {survey.title}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        )}

        <TextField
          size="small"
          label={t('task_summary')}
          error={!config.isSummaryValid}
          helperText={!config.isSummaryValid ? t('invalid_name_message') : ''}
          variant="outlined"
          fullWidth
          multiline
          rows={2}
          value={config.summary || ''}
          onChange={config.setSummary}
          required
        />

        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: '#475569', display: 'block', mb: 0.8 }}
          >
            {t('task_Desc1') || 'Descrição detalhada da Tarefa *'}
          </Typography>
          <CustomContainer>
            <ReactQuill
              value={config.description || ''}
              onChange={(value) => {
                config.setDescription(value);
                setIsDescEmpty(stripHtml(value).length === 0);
              }}
              placeholder={t('task_Desc1')}
            />
          </CustomContainer>
        </Box>

        <Divider sx={{ my: 0.5, borderColor: '#f1f5f9' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            pb: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#cbd5e1',
              color: '#475569',
              px: 2.5,
              '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: '#94a3b8',
              },
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            disableElevation
            type="submit"
            disabled={isDescEmpty || !config.isValidForm || isLoading}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              backgroundColor: '#0284c7',
              '&:hover': {
                backgroundColor: '#0369a1',
              },
            }}
          >
            {config.mode === 'create' ? t('create') : t('save')}
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default TaskForm;