/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../config/axios';
import { Button, Box, Snackbar, Alert, Stack } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import UserList from './UserList';

const EditUserArea = ({ ExperimentId, experimentId }) => {
  const currentExpId = experimentId || ExperimentId?.experimentId;
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const { t } = useTranslation();
  const [usersInExperiment, setUsersInExperiment] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, type: 'success', message: '' });

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/join/${currentExpId}`;
    navigator.clipboard.writeText(link).then(() => setLinkCopied(true));
  };

  const fetchData = useCallback(async () => {
    if (!currentExpId || !user?.accessToken) return;
    try {
      const response = await api.get(`user-experiment/experiment/${currentExpId}/`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const usersInExperimentData = response.data;

      const allUsersResponse = await api.get(`user`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const allUsersData = allUsersResponse.data;

      const usersNotInExperiment = allUsersData.filter(
        (usr) => !usersInExperimentData.some((u) => u.id === usr.id),
      );

      setAllUsers(usersNotInExperiment);
      setUsersInExperiment(usersInExperimentData);
    } catch (error) {
      console.error('Erro ao buscar dados dos usuários:', error);
    }
  }, [user?.accessToken, currentExpId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addUserToExperiment = (userId) => {
    const userToAdd = allUsers.find((u) => u.id === userId);
    if (userToAdd) {
      setUsersInExperiment((prev) => [...prev, userToAdd]);
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const removeUserFromExperiment = (userId) => {
    const userToRemove = usersInExperiment.find((u) => u.id === userId);
    if (userToRemove) {
      setAllUsers((prev) => [...prev, userToRemove]);
      setUsersInExperiment((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const saveChanges = async () => {
    try {
      await api.patch(
        `user-experiment/update-users/${currentExpId}`,
        { newUsersId: usersInExperiment.map((usr) => usr.id) },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      setFeedback({ open: true, type: 'success', message: t('Success') });
    } catch (error) {
      setFeedback({ open: true, type: 'error', message: t('error')});
      console.error('Erro ao salvar alterações:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          width: '100%',
        }}
      >
        <UserList
          title={t('all_users')}
          users={allUsers}
          buttonAction={addUserToExperiment}
          buttonType="add"
        />
        <UserList
          title={t('users_in_experiment')}
          users={usersInExperiment}
          buttonAction={removeUserFromExperiment}
          buttonType="delete"
        />
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ pt: 1 }}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={handleCopyInviteLink}
          startIcon={<LinkIcon />}
          sx={{
            borderRadius: 2,
            px: 2.5,
            py: 0.8,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {t('copy_invite_link')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={saveChanges}
          startIcon={<SaveIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 0.8,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
            },
          }}
        >
          {t('save')}
        </Button>
      </Stack>

      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
          severity={feedback.type}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      <Snackbar
        open={linkCopied}
        autoHideDuration={2500}
        onClose={() => setLinkCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
          {t('invite_link_copied')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditUserArea;