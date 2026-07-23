/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const EXPERIMENT_TYPE_KEYS = [{ label: 'within-subject', explanation: 'explanation_within' }];

const METHOD_KEYS = [
  { label: 'random', explanation: 'explanation_random' },
  { label: 'rules_based', explanation: 'explanation_rules' },
  { label: 'manual', explanation: 'explanation_manual' },
  { label: 'balanced', explanation: 'explanation_balanced' },
];

const GroupSeparationInfoModal = ({ open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{t('step_design')}</DialogTitle>
      <DialogContent>
        <List>
          {[...EXPERIMENT_TYPE_KEYS, ...METHOD_KEYS].map(({ label, explanation }) => (
            <ListItem key={label} sx={{ display: 'block', px: 0 }}>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 600 }}>{t(label)}</Typography>
                }
                secondary={t(explanation)}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupSeparationInfoModal;
