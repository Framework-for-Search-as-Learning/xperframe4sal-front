/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../config/axios.js';
import { ResultModal } from '../../components/ResultModal.js';
import { Tooltip, IconButton, Box } from '@mui/material';
// import Pause from '@mui/icons-material/Pause';
import Stop from '@mui/icons-material/Stop';
// import PlayArrow from '@mui/icons-material/PlayArrow';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { ConfirmDialog } from '../../components/ConfirmDialog.js';
import { CustomSnackbar } from '../../components/CustomSnackbar.js';
import { useTranslation } from 'react-i18next';
import { Google } from '../../components/SearchEngines/Google.js';
import { Chatbot } from '../../components/Chatbot/Chatbot.js';
import { TaskInstructionModal } from '../../components/TaskInstructionModal.js';
import useCookies from '../../lib/useCookies.js';

async function updateUserExperimentStatus(userExperiment, user, api) {
  try {
    userExperiment.stepsCompleted = Object.assign(userExperiment.stepsCompleted, { task: true });
    await api.patch(`user-experiment/${userExperiment._id}`, userExperiment, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

const Task = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { experimentId, taskId } = useParams();
  const [task, setTask] = useState(location?.state?.task);
  const [userTask, setUserTask] = useState(null);
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [nextPath, setNextPath] = useState(null);
  const [isShowingResultModal, setIsShowingResultModal] = useState(false);
  const [urlResultModal, setUrlResultModal] = useState('');
  const [titleResultModal, setTitleResultModal] = useState('');
  const [session, setSession] = useState({});
  const [clickedResultRank, setClickedResultRank] = useState(null);
  const [finished, setFinished] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [message, setMessage] = useState('success');
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);

  const history = useCookies('history');

  const sessionRef = useRef({});
  const clickedResultRankRef = useRef(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    clickedResultRankRef.current = clickedResultRank;
  }, [clickedResultRank]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskResponse, userTaskResponse] = await Promise.all([
          api.get(`/task/${taskId}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }),
          api.get(`/user-task?taskId=${taskId}&userId=${user.id}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }),
        ]);

        const taskResult = taskResponse?.data;
        const userTaskResult = userTaskResponse?.data;
        setTask(taskResult);
        setUserTask(userTaskResult);
        setFinished(userTaskResult.hasFinishedTask);
      } catch (error) {
        setOpen(true);
        setIsSuccess(false);
        setSeverity('error');
        setMessage(error.message);
      }
    };

    fetchData();
  }, [taskId, user?.accessToken, user?.id]);

  useEffect(() => {
    if (finished) {
      navigate(`/experiments/${experimentId}/surveys`);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [finished, experimentId, navigate]);

  const openFinishDialog = () => setConfirmDialogOpen(true);
  const closeFinishDialog = () => setConfirmDialogOpen(false);

  const handleFinishTask = async () => {
    try {
      const userTaskBackup = await api.patch(
        `user-task/${userTask._id}/finish`,
        { ...userTask, metadata: history.getCookie() },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      history.clearCookie();

      const allUserTasksResponse = await api.get(
        `user-task/user/${user.id}/experiment/${experimentId}`,
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      const allUserTasks = allUserTasksResponse.data;

      const otherUnfinishedTasks = allUserTasks.filter(
        (t) => t._id !== userTask._id && t.task.isActive && !t.hasFinishedTask,
      );

      if (otherUnfinishedTasks.length === 0) {
        const userExperiment = await api.get(
          `user-experiment?experimentId=${experimentId}&userId=${user.id}`,
          { headers: { Authorization: `Bearer ${user.accessToken}` } },
        );
        await updateUserExperimentStatus(userExperiment?.data, user, api);
        setNextPath(`/experiments/${experimentId}/surveys`);
      } else {
        setNextPath(`/experiments/${experimentId}/tasks`);
      }

      setConfirmDialogOpen(false);
      setUserTask(userTaskBackup.data);
      setShowSnackBar(true);
      setIsSuccess(true);
      setSeverity('success');
      setMessage(t('task_search_success'));
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleCloseSuccessSnackbar = async () => {
    setShowSnackBar(false);
    if (isSuccess) {
      setIsSuccess(false);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRedirect(true);
    }
  };

  useEffect(() => {
    if (redirect) {
      navigate(nextPath || `/experiments/${experimentId}/surveys`);
    }
  }, [redirect, navigate, experimentId, nextPath]);

  const closeModal = async () => {
    setUrlResultModal('');
    setTitleResultModal('');
    setIsShowingResultModal(false);
    document.body.style.overflow = 'auto';

    const currentSession = sessionRef.current;
    const currentRank = clickedResultRankRef.current;

    if (!currentSession?._id || currentRank === null || currentRank === undefined) {
      console.warn('close-page ignorado: session ou rank inválido');
      return;
    }

    try {
      const response = await api.patch(
        `/user-task-session/${currentSession._id}/close-page/${currentRank}`,
        currentSession,
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      setSession(response.data);
      sessionRef.current = response.data;
    } catch (error) {
      console.error('Erro ao fechar página:', error);
    }
  };

  useEffect(() => {
    const handlePopState = async () => {
      const currentSession = sessionRef.current;
      const currentRank = clickedResultRankRef.current;

      setUrlResultModal('');
      setTitleResultModal('');
      setIsShowingResultModal(false);
      document.body.style.overflow = 'auto';

      if (!currentSession?._id || currentRank === null || currentRank === undefined) {
        console.warn('close-page ignorado: session ou rank inválido');
        return;
      }

      try {
        const sessionResult = await api.patch(
          `/user-task-session/${currentSession._id}/close-page/${currentRank}`,
          currentSession,
          { headers: { Authorization: `Bearer ${user.accessToken}` } },
        );
        setSession(sessionResult.data);
        sessionRef.current = sessionResult.data;
      } catch (error) {
        console.error('Erro ao fechar página via popstate:', error);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user.accessToken]);

  return (
    <div style={{ minWidth: '326px' }}>
      {/* Barriga / puxador centralizado no topo */}
      <Box
        sx={{
          position: 'fixed',
          top: 64,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 64,
          height: 26,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          zIndex: 1300,
        }}
      >
        <Tooltip title={t('view_task_instructions')} placement="bottom">
          <IconButton
            size="small"
            onClick={() => setInstructionModalOpen(true)}
            sx={{
              pointerEvents: 'auto',
              backgroundColor: '#155293',
              color: '#fff',
              width: 64,
              height: 22,
              borderRadius: '0 0 14px 14px',
              boxShadow: '0 2px 6px rgba(0,0,0,.18)',
              transition: 'height .18s ease, background-color .18s',
              '&:hover': {
                backgroundColor: '#1b62ad',
                height: 26,
              },
            }}
          >
            <InfoOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Controles (Stop) à direita */}
      <Box sx={{ display: 'flex', position: 'fixed', zIndex: 3, right: 10 }}>
        <CustomSnackbar
          open={showSnackBar}
          handleClose={handleCloseSuccessSnackbar}
          time={1500}
          message={message}
          severity={severity}
          slide={true}
          variant="filled"
          showLinear={true}
        />
        <Box sx={{ flexGrow: 1, marginBottom: 2, zIndex: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {/* {userTask?.isPaused || paused ? (
            <Tooltip title={t('iniciar')} placement="bottom-start">
              <IconButton
                size="large"
                style={{ backgroundColor: 'white', marginRight: 5, border: '2px solid #dfe1e5' }}
                sx={{ zIndex: 2 }}
                color="success"
                onClick={handleResumeTask}
              >
                <PlayArrow color="success" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={t('pausar')} placement="bottom-start">
              <IconButton
                size="large"
                sx={{ zIndex: 2 }}
                color="primary"
                style={{ backgroundColor: 'white', marginRight: 5, border: '2px solid #dfe1e5' }}
                onClick={handlePauseTask}
              >
                <Pause />
              </IconButton>
            </Tooltip>
          )} */}
          <Tooltip title={t('finalizar')} placement="bottom-start">
            <IconButton
              size="large"
              color="secondary"
              sx={{ zIndex: 2 }}
              style={{ backgroundColor: 'white', border: '2px solid #dfe1e5' }}
              onClick={openFinishDialog}
            >
              <Stop />
            </IconButton>
          </Tooltip>
        </Box>
        <TaskInstructionModal
          open={instructionModalOpen}
          onClose={() => setInstructionModalOpen(false)}
          task={task}
        />
        <ConfirmDialog
          open={confirmDialogOpen}
          onClose={closeFinishDialog}
          onConfirm={handleFinishTask}
          title={t('tem_certeza')}
          content={t('finalizar_tarefa')}
        />
      </Box>

      {task.search_source === 'search-engine' && (
        <Google
          user={user}
          taskId={taskId}
          api={api}
          session={session}
          setSession={setSession}
          setUrlResultModal={setUrlResultModal}
          setTitleResultModal={setTitleResultModal}
          setIsShowingResultModal={setIsShowingResultModal}
          setClickedResultRank={setClickedResultRank}
        />
      )}
      {task.search_source === 'llm' && <Chatbot taskId={taskId} user={user} />}

      {isShowingResultModal && (
        <ResultModal
          show={isShowingResultModal}
          onClose={closeModal}
          pageUrl={urlResultModal}
          title={titleResultModal}
        />
      )}
    </div>
  );
};

export default Task;