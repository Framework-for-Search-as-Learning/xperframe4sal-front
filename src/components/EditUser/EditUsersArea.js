/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../config/axios';
import { Button, Box, Snackbar } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { useTranslation } from 'react-i18next';
import { Messages } from 'primereact/messages';
import styles from '../../style/editUser.module.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import UserList from './UserList';

const EditUserArea = ({ ExperimentId }) => {
  const msgs = useRef(null);
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const { t } = useTranslation();
  const [usersInExperiment, setUsersInExperiment] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/join/${ExperimentId.experimentId}`;
    navigator.clipboard.writeText(link).then(() => setLinkCopied(true));
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(`user-experiment/experiment/${ExperimentId.experimentId}/`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const usersInExperimentData = response.data;

      const allUsersResponse = await api.get(`user`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const allUsersData = allUsersResponse.data;

      const usersNotInExperiment = allUsersData.filter(
        (usr) => !usersInExperimentData.some((user) => user.id === usr.id),
      );

      setAllUsers(usersNotInExperiment);
      setUsersInExperiment(usersInExperimentData);
    } catch (error) {
      console.error('Erro ao buscar dados dos usuários:', error);
    }
  }, [user.accessToken, ExperimentId.experimentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addUserToExperiment = (userId) => {
    const userToAdd = allUsers.find((user) => user.id === userId);
    if (userToAdd) {
      setUsersInExperiment((prev) => [...prev, userToAdd]);
      setAllUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  const removeUserFromExperiment = (userId) => {
    const userToRemove = usersInExperiment.find((user) => user.id === userId);
    if (userToRemove) {
      setAllUsers((prev) => [...prev, userToRemove]);
      setUsersInExperiment((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  const saveChanges = async () => {
    try {
      await api.patch(
        `user-experiment/update-users/${ExperimentId.experimentId}`,
        { newUsersId: usersInExperiment.map((usr) => usr.id) },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      if (msgs.current) {
        msgs.current.clear();
        setTimeout(() => {
          msgs.current.show({
            severity: 'success',
            summary: t('Success'),
            life: 3000,
          });
        }, 100);
      }
    } catch (error) {
      msgs.current.clear();
      if (msgs.current) {
        msgs.current.show({
          severity: 'error',
          summary: t('error'),
          life: 3000,
        });
      }
      console.error('Erro ao salvar alterações:', error);
    }
  };

  return (
    <>
      <div
        style={{
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          marginTop: '20px',
        }}
      >
        <div className={styles.container}>
          <div className={styles.userListContainer}>
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
          </div>
          <div className={styles.buttonContainer}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCopyInviteLink}
              startIcon={<LinkIcon />}
              sx={{ width: '200px', mr: 1 }}
            >
              {t('copy_invite_link')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={saveChanges}
              sx={{ width: '200px' }}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Messages ref={msgs} />
      </Box>
      <Snackbar
        open={linkCopied}
        autoHideDuration={2500}
        onClose={() => setLinkCopied(false)}
        message={t('invite_link_copied')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default EditUserArea;
