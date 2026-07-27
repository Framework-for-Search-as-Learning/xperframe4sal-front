/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../config/axios';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
  Divider,
  Box,
  Chip,
  Paper,
  Stack,
} from '@mui/material';

import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

import { CustomSnackbar } from '../../components/CustomSnackbar';
import { LoadingIndicator } from '../../components/LoadIndicator';

import { useTranslation } from 'react-i18next';
import { ExperimentTemplate, mountSteps } from './ExperimentTemplate';

const SurveyType = {
  PRE: 'pre',
  POST: 'post',
  OTHER: 'other',
};

const Questionnaires = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { experimentId } = useParams();

  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [steps, setSteps] = useState([]);
  const [experiment, setExperiment] = useState(null);
  const [userExperiment, setUserExperiment] = useState(null);
  const [surveys, setSurveys] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [preSurveys, setPreSurveys] = useState([]);
  const [postSurveys, setPostSurveys] = useState([]);
  const [answeredPreSurveys, setAnsweredPreSurveys] = useState({});
  const [answeredPostSurveys, setAnsweredPostSurveys] = useState({});
  const [, setIsSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [message, setMessage] = useState('success');
  const [shouldActivateTask, setShouldActivateTask] = useState(false);
  const [expanded, setExpanded] = useState(`panel-0`);
  const [hasFinishedTasks, setHasFinishedTasks] = useState(false);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setIsLoading(true);

        const [experimentResponse, userExperimentResponse, userTasksResponse] = await Promise.all([
          api.get(`experiment/${experimentId}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }),
          api.get(`user-experiment?experimentId=${experimentId}&userId=${user.id}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }),
          api.get(`user-task/user/${user.id}/experiment/${experimentId}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }),
        ]);

        let experimentResult = experimentResponse.data;
        let userExperimentResult = userExperimentResponse?.data;

        if (!userExperimentResult) {
          navigate(`/experiments`);
          return;
        }

        if (!userExperimentResult.stepsCompleted) {
          userExperimentResult.stepsCompleted = {};
        }

        if (!userExperimentResult.stepsCompleted['icf']) {
          navigate(`/experiments/${experimentId}/icf`);
          return;
        }

        const tasksFinished = !!userExperimentResult?.stepsCompleted['task'];
        setHasFinishedTasks(tasksFinished);

        const userTasksData = userTasksResponse?.data || [];
        const taskRefs = userTasksData.map((ut) => ut.task?.linkedSurveyRefs);
        const featureEnabled = taskRefs.some((refs) => Array.isArray(refs));
        const linkedSurveyIds = new Set(taskRefs.flatMap((refs) => refs || []));

        const surveysResponse = await api.get(`survey/experiment/${experimentId}`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        let surveyList = [];
        let localPre = [];
        let localPost = [];
        let localAnsweredPre = {};
        let localAnsweredPost = {};

        for (const survey of surveysResponse.data) {
          if (!survey.isActive) continue;
          if (
            featureEnabled &&
            !linkedSurveyIds.has(String(survey._id)) &&
            !linkedSurveyIds.has(survey.uuid)
          )
            continue;

          surveyList.push(survey);

          const response = await api.get(`survey-answer?userId=${user.id}&surveyId=${survey._id}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          });

          const hasAnswered = !!response?.data;

          if (survey.type === SurveyType.PRE) {
            localPre.push(survey);
            if (hasAnswered) localAnsweredPre[survey._id] = true;
          } else if (survey.type === SurveyType.POST) {
            localPost.push(survey);
            if (hasAnswered) localAnsweredPost[survey._id] = true;
          }
        }

        setPreSurveys(localPre);
        setPostSurveys(localPost);
        setAnsweredPreSurveys(localAnsweredPre);
        setAnsweredPostSurveys(localAnsweredPost);

        const stepsResponse = await api.get(`experiment/${experimentId}/step`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const experimentSteps = mountSteps(stepsResponse.data, userExperimentResult.stepsCompleted);

        setExperiment(experimentResult);
        setUserExperiment(userExperimentResult);
        setSteps(experimentSteps);

        if (surveyList.length === 0 && !tasksFinished) {
          navigate(`/experiments/${experimentId}/tasks`);
          return;
        }

        setSurveys(surveyList);

        const allPreAnswered = localPre.every((survey) => localAnsweredPre[survey._id]);
        setShouldActivateTask(allPreAnswered);

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setOpen(true);
        setIsSuccess(false);
        setSeverity('error');
        setMessage(error?.message || String(error));
        console.log(error);
      }
    };

    fetchSurveyData();
  }, [experimentId, user?.id, user?.accessToken, navigate]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleEnterTasks = () => {
    navigate(`/experiments/${experimentId}/tasks`);
  };

  const handleFinishExperiment = async () => {
    try {
      await api.patch(
        `user-experiment/${userExperiment._id}`,
        { hasFinished: true },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      setOpen(true);
      setSeverity('success');
      setMessage(t('experiment_finished_success'));
      setTimeout(() => {
        navigate('/experiments');
      }, 1500);
    } catch (error) {
      setOpen(true);
      setSeverity('error');
      setMessage(t('experiment_finish_error'));
    }
  };

  const handleEnterSurvey = (e) => {
    navigate(`/experiments/${experimentId}/surveys/${e}`, {
      state: {
        survey: surveys.filter((s) => s._id === e)[0],
        experiment: experiment,
      },
    });
  };

  const renderSurveyAccordion = (survey, index, isAnswered) => {
    const isUniqueAndAnswered = isAnswered && survey?.uniqueAnswer;

    return (
      <Accordion
        key={survey._id}
        elevation={0}
        expanded={expanded === `panel-${index}`}
        onChange={handleChange(`panel-${index}`)}
        disabled={isUniqueAndAnswered}
        sx={{
          mb: 1.5,
          border: '1px solid #e2e8f0',
          borderRadius: '10px !important',
          overflow: 'hidden',
          '&:before': { display: 'none' },
          backgroundColor: isUniqueAndAnswered ? '#f8fafc' : '#ffffff',
          boxShadow: expanded === `panel-${index}` ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel-${index}bh-content`}
          id={`panel-${index}bh-header`}
          sx={{
            px: 2.5,
            py: 0.5,
            '&:hover': { backgroundColor: isUniqueAndAnswered ? 'transparent' : '#f8fafc' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5, pr: 1 }}>
            <AssignmentIcon color={isAnswered ? 'disabled' : 'primary'} fontSize="small" />

            <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1, color: '#0f172a' }}>
              {survey.title}
            </Typography>

            {isAnswered && (
              <Chip
                icon={<CheckCircleOutlineIcon fontSize="small" />}
                label={t('already_answered')}
                color="success"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <Divider />
        <AccordionDetails sx={{ p: 2.5, backgroundColor: '#fafafa' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            {survey.description || t('no_description_available')}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {isAnswered && !survey?.uniqueAnswer && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => handleEnterSurvey(survey._id)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {t('edit_label')}
              </Button>
            )}

            {!isAnswered && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<MeetingRoomIcon />}
                onClick={() => handleEnterSurvey(survey._id)}
                sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                {t('Access')}
              </Button>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const currentSurveyList = hasFinishedTasks ? postSurveys : preSurveys;
  const currentAnsweredMap = hasFinishedTasks ? answeredPostSurveys : answeredPreSurveys;
  const isPostSurveysFinished = postSurveys.filter((s) => !answeredPostSurveys[s._id]).length === 0;

  return (
    <ExperimentTemplate headerTitle={t('questionnaire_list_header')} steps={steps} hideFinishButton>
      <CustomSnackbar open={open} time={1500} message={message} severity={severity} />

      {/* ESTADOS DE CARREGAMENTO */}
      {isLoading && !surveys && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
          <LoadingIndicator size={50} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t('loading_surveys')}
          </Typography>
        </Box>
      )}

      {surveys?.length === 0 && !isLoading && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px dashed #cbd5e1',
            backgroundColor: '#ffffff',
            mb: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {t('no_surveys')}
          </Typography>
        </Paper>
      )}

      {/* LISTA DE QUESTIONÁRIOS */}
      <Box sx={{ mt: 1 }}>
        {currentSurveyList?.map((survey, index) =>
          renderSurveyAccordion(survey, index, !!currentAnsweredMap[survey._id]),
        )}
      </Box>

      {/* CARD DE PRÓXIMO PASSO DA ETAPA (IR PARA TAREFAS OU FINALIZAR) */}
      {!isLoading && currentSurveyList && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: shouldActivateTask || isPostSurveysFinished ? '#bbf7d0' : '#e2e8f0',
            backgroundColor: shouldActivateTask || isPostSurveysFinished ? '#f0fdf4' : '#f8fafc',
            transition: 'all 0.3s ease',
          }}
        >
          {!hasFinishedTasks ? (
            /* ETAPA PRÉ-TAREFA */
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: shouldActivateTask ? '#dcfce7' : '#e2e8f0',
                    color: shouldActivateTask ? '#16a34a' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {shouldActivateTask ? <RocketLaunchIcon /> : <LockIcon />}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a' }}>
                    {shouldActivateTask
                      ? t('pre_surveys_completed_title')
                      : t('pre_surveys_pending_title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {shouldActivateTask
                      ? t('pre_surveys_completed_subtitle')
                      : t('pre_surveys_pending_subtitle')}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleEnterTasks}
                disabled={!shouldActivateTask}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.2,
                  borderRadius: 2.5,
                  minWidth: { xs: '100%', sm: 'auto' },
                  boxShadow: shouldActivateTask ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none',
                }}
              >
                {t('go_to_tasks')}
              </Button>
            </Stack>
          ) : (
            /* ETAPA PÓS-TAREFA (FINALIZAÇÃO) */
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: isPostSurveysFinished ? '#dcfce7' : '#e2e8f0',
                    color: isPostSurveysFinished ? '#16a34a' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a' }}>
                    {isPostSurveysFinished
                      ? t('post_surveys_completed_title')
                      : t('post_surveys_pending_title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isPostSurveysFinished
                      ? t('post_surveys_completed_subtitle')
                      : t('post_surveys_pending_subtitle')}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<CheckCircleIcon />}
                onClick={handleFinishExperiment}
                disabled={!isPostSurveysFinished || !userExperiment}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.2,
                  borderRadius: 2.5,
                  minWidth: { xs: '100%', sm: 'auto' },
                  boxShadow: isPostSurveysFinished ? '0 4px 14px rgba(22, 163, 74, 0.35)' : 'none',
                }}
              >
                {t('finish_experiment')}
              </Button>
            </Stack>
          )}
        </Paper>
      )}
    </ExperimentTemplate>
  );
};

export default Questionnaires;
