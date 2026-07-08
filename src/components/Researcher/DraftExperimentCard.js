/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import React from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from '../../style/experimentAccordion.module.css';

const DraftExperimentCard = ({ draft, onContinue, onDiscard, t }) => {
  const title = draft?.ExperimentTitle?.trim() || t?.('draft_card_untitled');
  const savedAt = draft?.savedAt ? new Date(draft.savedAt).toLocaleString() : '';

  return (
    <Paper
      variant="outlined"
      sx={{
        padding: '16px',
        marginBottom: '5px',
        border: '1px dashed #f2912d',
        backgroundColor: '#fff8ef',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: '8px', flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 500 }}>{title}</Typography>
        <Chip
          label={t?.('draft_badge_label') ?? 'Draft'}
          size="small"
          sx={{ backgroundColor: '#f2912d', color: '#fff', fontWeight: 500 }}
        />
      </Box>

      {savedAt && (
        <Typography variant="body2" sx={{ color: '#757575', marginBottom: '16px' }}>
          {t?.('draft_card_last_saved', { date: savedAt }) ?? `Last saved on ${savedAt}`}
        </Typography>
      )}

      <Box className={styles.buttonContainer}>
        <Button
          variant="contained"
          size="small"
          className={styles.actionButton}
          startIcon={<EditNoteIcon />}
          onClick={onContinue}
          sx={{ boxShadow: 'none' }}
        >
          {t?.('draft_card_continue') ?? 'Continue draft'}
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          className={styles.actionButton}
          startIcon={<DeleteIcon />}
          onClick={onDiscard}
        >
          {t?.('draft_card_discard') ?? 'Discard'}
        </Button>
      </Box>
    </Paper>
  );
};

export { DraftExperimentCard };
