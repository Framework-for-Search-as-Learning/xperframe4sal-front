import React, { useEffect, useState } from 'react';
import { api } from "../config/axios.js";
import { Button, Box } from '@mui/material';
import { ConfirmDialog } from '../components/ConfirmDialog.js';
import { CustomSnackbar } from '../components/CustomSnackbar';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EditAccount from '../components/Account/EditAccount.js';
import EditPassword from '../components/Account/EditPassword.js';

const Account = () => {
  const { t } = useTranslation();
  const storedUser = localStorage.getItem('user');
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [message, setMessage] = useState('success');
  const [redirect, setRedirect] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  const handleDeleteAllData = async () => {
    try {
      setConfirmDialogOpen(false);
      await api.patch(`users/${user.id}/delete-data`);
      setShowSnackBar(true);
      setIsSuccess(true);
      setSeverity('success');
      setMessage(null);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const openDeleteDialog = () => {
    setConfirmDialogOpen(true);
  }

  const closeDeleteDialog = () => {
    setConfirmDialogOpen(false);
  }

  const handleCloseSuccessSnackbar = async () => {
    setShowSnackBar(false);
    if (isSuccess) {
      setIsSuccess(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      setRedirect(true);
    }
  };

  useEffect(() => {
    if (redirect) {
      navigate(`/experiments`);
    }
  }, [redirect, navigate]);

  return (
    <>
      <CustomSnackbar open={showSnackBar} handleClose={handleCloseSuccessSnackbar} time={1500} message={message} severity={severity} slide={true} variant="filled" showLinear={true} />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteAllData}
        title={t('Tem certeza?')}
        content={t('Você terá todos os seus dados de experimentos apagados.')}
      />
      <Box sx={{ flexFlow: 1, textAlign: 'right' }}>
        <Button color='error' variant='contained' onClick={openDeleteDialog}>
          {t('Apagar todos meus dados')}
        </Button>
      </Box>
      <EditAccount
        t={t}
        user={user}
        isLoading={isLoading}
        alertMessage={alertMessage}
        messageType={messageType}
        setUser={setUser}
        setMessageType={setMessageType}
        setIsLoading={setIsLoading}
        setAlertMessage={setAlertMessage}
      />
      {/*
      <EditPassword
        t={t}
        user={user}
        isLoading={isLoading}
        alertMessage={alertMessage}
        messageType={messageType}
        setUser={setUser}
        setMessageType={setMessageType}
        setIsLoading={setIsLoading}
        setAlertMessage={setAlertMessage}
      />
      */}
    </>
  );
};

export { Account };