/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/axios';
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Box,
  TextField,
  InputAdornment,
  Paper,
  Stack,
  Chip,
  Container,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ScienceIcon from '@mui/icons-material/Science';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchIcon from '@mui/icons-material/Search';

import { useTranslation } from 'react-i18next';
import { ExperimentAccordion } from '../../components/Researcher/ExperimentAccordion';
import { DraftExperimentCard } from '../../components/Researcher/DraftExperimentCard';
import { LoadingState } from '../../components/Researcher/LoadingState';
import {
  clearExperimentDraft,
  clearExperimentDraftFromServer,
  isExperimentDraftMeaningful,
} from '../../hooks/useExperimentDraftAutosave';

const experimentStatus = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
});

const Researcher = () => {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState(null);
  const [experimentsOwner, setOwnerExperiments] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [experimentsWithParticipants, setExperimentsWithParticipants] = useState(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState(null);
  const [editWarningModalOpen, setEditWarningModalOpen] = useState(false);
  const [experimentToEdit, setExperimentToEdit] = useState(null);
  const [draft, setDraft] = useState(null);
  const [discardDraftModalOpen, setDiscardDraftModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const checkExperimentParticipants = useCallback(
    async (experimentId) => {
      try {
        const { data: participants } = await api.get(`experiment/${experimentId}/participants`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        return participants.some(
          (participant) =>
            participant.status === experimentStatus.IN_PROGRESS ||
            participant.status === experimentStatus.FINISHED,
        );
      } catch (error) {
        console.error('Error checking participants:', error);
        return false;
      }
    },
    [user.accessToken],
  );

  const checkAllExperimentsParticipants = useCallback(
    async (experiments) => {
      if (!experiments?.length) return;

      try {
        const checks = await Promise.all(
          experiments.map(async (exp) => {
            const hasParticipants = await checkExperimentParticipants(exp._id);
            return { id: exp._id, hasParticipants };
          }),
        );

        setExperimentsWithParticipants(
          new Set(checks.filter((check) => check.hasParticipants).map((check) => check.id)),
        );
      } catch (error) {
        console.error('Error checking all experiments:', error);
      }
    },
    [checkExperimentParticipants],
  );

  const fetchDraft = useCallback(async () => {
    try {
      const { data: serverDraft } = await api.get(`experiment-draft/${user.id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setDraft(
        serverDraft?.payload && isExperimentDraftMeaningful(serverDraft.payload)
          ? { ...serverDraft.payload, savedAt: serverDraft.lastChangeAt }
          : null,
      );
    } catch (error) {
      console.error('Error fetching experiment draft:', error);
    }
  }, [user.accessToken, user.id]);

  const fetchAllExperiments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    fetchDraft();

    try {
      const { data: ownedExperiments } = await api.get(`experiment/owner/${user.id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      const { data: participatedExperiments } = await api.get(`user-experiment/user/${user.id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      setExperiments(participatedExperiments);
      setOwnerExperiments(ownedExperiments);

      await checkAllExperimentsParticipants(ownedExperiments);

      if (ownedExperiments.length > 0) {
        setActiveTab(0);
        setExpanded(`panel-owner-0`);
      } else if (participatedExperiments.length > 0) {
        setActiveTab(1);
        setExpanded(`panel-0`);
      }
    } catch (err) {
      setError(t('error_loading_experiments'));
    } finally {
      setIsLoading(false);
    }
  }, [user.accessToken, user.id, t, checkAllExperimentsParticipants, fetchDraft]);

  useEffect(() => {
    fetchAllExperiments();
  }, [fetchAllExperiments]);

  useEffect(() => {
    if (!experiments?.length) return;

    const refreshInterval = setInterval(async () => {
      try {
        const updatedExperiments = await Promise.all(
          experiments.map(async (exp) => {
            try {
              const { data } = await api.get(`experiment/${exp.experiment._id}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
              });
              return {
                ...exp,
                experiment: data,
              };
            } catch (error) {
              console.error(`Error refreshing experiment ${exp.experiment._id}:`, error);
              return exp;
            }
          }),
        );

        setExperiments(updatedExperiments);
      } catch (error) {
        console.error('Error refreshing experiment statuses:', error);
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [experiments, user.accessToken]);

  const handleCreateExperiment = () => navigate('/experiments/new');

  const handleAccessExperiment = async (experiment, userExperimentId, userExperimentStatus) => {
    try {
      const { data: experimentData } = await api.get(`experiment/${experiment._id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      if (experimentData.status !== experimentStatus.IN_PROGRESS) {
        setExperiments(
          (prev) =>
            prev?.map((exp) =>
              exp.experiment._id === experiment._id
                ? {
                    ...exp,
                    experiment: {
                      ...exp.experiment,
                      status: experimentData.status,
                    },
                  }
                : exp,
            ) ?? prev,
        );
        return;
      }

      if (userExperimentStatus === experimentStatus.NOT_STARTED) {
        await api.patch(
          `user-experiment/${userExperimentId}`,
          { status: experimentStatus.IN_PROGRESS, startDate: new Date() },
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          },
        );
      }

      navigate(`/experiments/${experiment._id}/surveys`);
    } catch (error) {
      console.error('Error accessing experiment:', error);
      setError(t('error_accessing_experiment'));
    }
  };

  const handleViewStats = (experimentId) => {
    navigate(`/experiments/${experimentId}/monitoring`);
  };

  const handleExportExperiment = async (experimentId) => {
    try {
      const response = await api.get(`experiment/export/${experimentId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/x-yaml' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `experiment_export_${experimentId}.yaml`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      setError(t('export_error'));
    }
  };

  const handleImportExperiment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
      setError(t('import_invalid_file'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post(`experiment/import/${user.id}`, formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      event.target.value = '';

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const translatedErrors = response.data.map((errorKey) => t(errorKey) || errorKey);
        setError(translatedErrors.join('\n'));
        return;
      }

      await fetchAllExperiments();

      if (response.data && response.data._id) {
        navigate(`/experiments/${response.data._id}/edit`);
      }
    } catch (error) {
      console.error('Import error:', error);
      if (error.response && error.response.data && Array.isArray(error.response.data)) {
        const translatedErrors = error.response.data.map((errorKey) => t(errorKey) || errorKey);
        setError(translatedErrors.join('\n'));
      } else {
        setError(t('import_error'));
      }
      event.target.value = '';
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExperiment = async (experimentId) => {
    const experiment = experimentsOwner?.find((exp) => exp._id === experimentId);

    if (!experiment) return;

    const hasActiveParticipants = await checkExperimentParticipants(experimentId);

    if (hasActiveParticipants) {
      setExperimentToEdit(experiment);
      setEditWarningModalOpen(true);
      return;
    }

    navigate(`/experiments/${experimentId}/edit`);
  };

  const confirmEditExperiment = () => {
    if (!experimentToEdit) return;

    const experimentId = experimentToEdit._id;
    setEditWarningModalOpen(false);
    setExperimentToEdit(null);
    navigate(`/experiments/${experimentId}/edit`);
  };

  const cancelEditExperiment = () => {
    setEditWarningModalOpen(false);
    setExperimentToEdit(null);
  };

  const handleDeleteExperiment = (experimentId) => {
    const experiment = experimentsOwner?.find((exp) => exp._id === experimentId);
    setExperimentToDelete(experiment);
    setDeleteModalOpen(true);
  };

  const confirmDeleteExperiment = async () => {
    if (!experimentToDelete) return;

    try {
      await api.delete(`experiment/${experimentToDelete._id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      setDeleteModalOpen(false);
      setExperimentToDelete(null);

      fetchAllExperiments();
    } catch (error) {
      console.error('Error deleting experiment:', error);
      setError(t('error_deleting_experiment'));
      setDeleteModalOpen(false);
      setExperimentToDelete(null);
    }
  };

  const cancelDeleteExperiment = () => {
    setDeleteModalOpen(false);
    setExperimentToDelete(null);
  };

  const handleEditExperimentStatus = async (experimentId, currentStatus) => {
    const newStatus =
      currentStatus === experimentStatus.IN_PROGRESS
        ? experimentStatus.FINISHED
        : experimentStatus.IN_PROGRESS;

    try {
      await api.patch(
        `experiment/${experimentId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        },
      );

      setOwnerExperiments((prevExperiments) =>
        prevExperiments.map((exp) =>
          exp._id === experimentId ? { ...exp, status: newStatus } : exp,
        ),
      );

      setExperiments(
        (prevExperiments) =>
          prevExperiments?.map((exp) =>
            exp.experiment?._id === experimentId
              ? {
                  ...exp,
                  experiment: {
                    ...exp.experiment,
                    status: newStatus,
                  },
                }
              : exp,
          ) ?? prevExperiments,
      );
    } catch (error) {
      setError(t('error_updating_status'));
    }
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const handleEditUser = (experimentId) => {
    navigate(`/experiments/${experimentId}/participants`);
  };

  const handleContinueDraft = () => navigate('/experiments/new');

  const handleDiscardDraftClick = () => setDiscardDraftModalOpen(true);

  const cancelDiscardDraft = () => setDiscardDraftModalOpen(false);

  const confirmDiscardDraft = () => {
    clearExperimentDraft(user.id);
    clearExperimentDraftFromServer(user);
    setDraft(null);
    setDiscardDraftModalOpen(false);
  };

  const filteredOwnerExperiments = experimentsOwner?.filter((exp) =>
    exp.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredParticipatedExperiments = experiments?.filter((exp) =>
    exp.experiment?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', p: { xs: 2, sm: 3 } }}>        <Dialog open={deleteModalOpen} onClose={cancelDeleteExperiment}>
          <DialogTitle>{t('delete_experiment_title')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('delete_experiment_message')}
            </DialogContentText>
            {experimentToDelete && (
              <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
                {experimentToDelete.name}
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button onClick={cancelDeleteExperiment} variant="outlined">
              {t('cancel')}
            </Button>
            <Button onClick={confirmDeleteExperiment} color="error" variant="contained">
              {t('delete_confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={discardDraftModalOpen} onClose={cancelDiscardDraft}>
          <DialogTitle>{t('discard_draft_title')}</DialogTitle>
          <DialogContent>
            <DialogContentText>{t('discard_draft_message')}</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button onClick={cancelDiscardDraft} variant="outlined">
              {t('cancel')}
            </Button>
            <Button onClick={confirmDiscardDraft} color="error" variant="contained">
              {t('draft_card_discard')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editWarningModalOpen} onClose={cancelEditExperiment}>
          <DialogTitle>{t('edit_experiment_warning_title')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('edit_experiment_with_participants_warning')}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button onClick={cancelEditExperiment} variant="outlined">
              {t('cancel')}
            </Button>
            <Button onClick={confirmEditExperiment} color="warning" variant="contained">
              {t('continue_editing')}
            </Button>
          </DialogActions>
        </Dialog>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 3,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', lg: 'center' }}
            spacing={2}
          >
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => {
                setActiveTab(newValue);
                if (newValue === 0 && experimentsOwner?.length > 0) {
                  setExpanded('panel-owner-0');
                } else if (newValue === 1 && experiments?.length > 0) {
                  setExpanded('panel-0');
                } else {
                  setExpanded(null);
                }
              }}
              sx={{
                minHeight: '44px',
                '& .MuiTabs-indicator': { display: 'none' },
              }}
            >
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{t('researcher_experiments_title')}</span>
                    <Chip
                      label={experimentsOwner ? experimentsOwner.length : 0}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: activeTab === 0 ? '#e0f2fe' : '#f1f5f9',
                        color: activeTab === 0 ? '#0369a1' : '#64748b',
                      }}
                    />
                  </Stack>
                }
                sx={{
                  minHeight: '40px',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#64748b',
                  mr: 1,
                  '&.Mui-selected': {
                    color: '#0284c7',
                    backgroundColor: '#f0f9ff',
                  },
                }}
              />
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{t('available_experiments_title')}</span>
                    <Chip
                      label={experiments ? experiments.length : 0}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: activeTab === 1 ? '#e0f2fe' : '#f1f5f9',
                        color: activeTab === 1 ? '#0369a1' : '#64748b',
                      }}
                    />
                  </Stack>
                }
                sx={{
                  minHeight: '40px',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#64748b',
                  '&.Mui-selected': {
                    color: '#0284c7',
                    backgroundColor: '#f0f9ff',
                  },
                }}
              />
            </Tabs>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              <TextField
                placeholder={t('search_experiments')}
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 220 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    fontSize: '0.875rem',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<FileUploadIcon />}
                onClick={handleImportExperiment}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  backgroundColor: '#ffffff',
                  whiteSpace: 'nowrap',
                  height: '40px',
                  '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#94a3b8' },
                }}
              >
                {t('import')}
              </Button>

              <Button
                variant="contained"
                disableElevation
                startIcon={<AddIcon />}
                onClick={handleCreateExperiment}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  height: '40px',
                  whiteSpace: 'nowrap',
                  backgroundColor: '#0284c7',
                  '&:hover': { backgroundColor: '#0369a1' },
                }}
              >
                {t('create_experiment_button')}
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".yaml,.yml"
                style={{ display: 'none' }}
              />
            </Stack>
          </Stack>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading && <LoadingState />}
          {error && (
            <Paper sx={{ p: 2, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Paper>
          )}

          {activeTab === 0 && (
            <>
              {draft && (
                <DraftExperimentCard
                  draft={draft}
                  onContinue={handleContinueDraft}
                  onDiscard={handleDiscardDraftClick}
                  t={t}
                />
              )}
              {filteredOwnerExperiments?.length > 0 ? (
                filteredOwnerExperiments.map((experiment, index) => (
                  <ExperimentAccordion
                    key={experiment._id}
                    experiment={experiment}
                    status={experiment.status}
                    hasActiveParticipants={experimentsWithParticipants.has(experiment._id)}
                    expanded={expanded === `panel-owner-${index}`}
                    onChange={handleChange(`panel-owner-${index}`)}
                    onAccess={handleExportExperiment}
                    onEdit={handleEditExperiment}
                    onEditStatus={handleEditExperimentStatus}
                    onDelete={handleDeleteExperiment}
                    onEdituser={handleEditUser}
                    onViewStats={handleViewStats}
                    isOwner={true}
                    t={t}
                  />
                ))
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 6,
                    border: '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <ScienceIcon sx={{ fontSize: 56, color: '#0284c7', mb: 2, opacity: 0.8 }} />
                  <Typography variant="h6" fontWeight="700" color="#0f172a">
                    {t('experiments_empty_title')}
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>
                    Crie seu primeiro experimento para começar a coletar dados.
                  </Typography>
                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={<AddIcon />}
                    onClick={handleCreateExperiment}
                    sx={{ textTransform: 'none', borderRadius: '10px', px: 3, backgroundColor: '#0284c7' }}
                  >
                    {t('create_experiment_button')}
                  </Button>
                </Paper>
              )}
            </>
          )}

          {activeTab === 1 &&
            (filteredParticipatedExperiments?.length > 0 ? (
              filteredParticipatedExperiments.map((experiment, index) => (
                <ExperimentAccordion
                  key={experiment.experiment?._id}
                  userExperimentId={experiment?._id}
                  userExperimentStatus={experiment?.status}
                  experiment={experiment.experiment}
                  status={experiment.experiment?.status}
                  expanded={expanded === `panel-${index}`}
                  onChange={handleChange(`panel-${index}`)}
                  onAccess={handleAccessExperiment}
                  onEdit={handleEditExperiment}
                  onEdituser={handleEditUser}
                  isOwner={false}
                  t={t}
                />
              ))
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                }}
              >
                <InboxIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 1 }} />
                <Typography variant="h6" color="#0f172a" fontWeight="700">
                  {t('no_experiments')}
                </Typography>
              </Paper>
            ))}
        </Box>
    </Box>
  );
};

export default Researcher;