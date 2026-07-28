/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TaskForm from './TaskForm';

const TaskDialog = ({
  open,
  onClose,
  mode,
  config,
  onSubmit,
  isLoading,
  experimentType,
  btypeExperiment,
  experimentSurveys,
  scoreType,
  setScoreType,
  t,
}) => {
  const isCreate = mode === 'create';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: isCreate ? '#e0f2fe' : '#fef3c7',
              color: isCreate ? '#0284c7' : '#d97706',
              flexShrink: 0,
            }}
          >
            <AssignmentIcon fontSize="medium" />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
              {isCreate ? (t('task_creation') || 'Criação de Tarefas') : (t('edit_task') || 'Editar Tarefa')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3, lineHeight: 1.2 }}>
              {isCreate
                ? 'Preencha os detalhes da nova tarefa e vincule os questionários'
                : 'Atualize as configurações e descrições desta tarefa'}
            </Typography>
          </Box>
        </Box>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: '#94a3b8',
            mt: -0.5,
            mr: -1,
            '&:hover': { color: '#475569', backgroundColor: '#f1f5f9' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2, backgroundColor: '#ffffff', overflowY: 'auto' }}>
        <TaskForm
          config={config}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          experimentType={experimentType}
          btypeExperiment={btypeExperiment}
          experimentSurveys={experimentSurveys}
          scoreType={scoreType}
          setScoreType={setScoreType}
          t={t}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;