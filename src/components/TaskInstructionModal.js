/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const TaskInstructionModal = ({ open, onClose, task }) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="task-instruction-dialog-title"
    >
      <DialogTitle id="task-instruction-dialog-title">
        {t('task_instructions_title')}
        {task?.title && (
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {task.title}
          </Typography>
        )}
      </DialogTitle>

      <Divider />

      <DialogContent>
        {task?.summary && (
          <>
            <Typography variant="overline" color="text.secondary">
              {t('task_summary')}
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
              {task.summary}
            </Typography>
          </>
        )}

        {task?.description && (
          <>
            <Typography variant="overline" color="text.secondary">
              {t('task_Desc')}
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: task.description }} style={{ marginTop: 4 }} />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" disableElevation>
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { TaskInstructionModal };
