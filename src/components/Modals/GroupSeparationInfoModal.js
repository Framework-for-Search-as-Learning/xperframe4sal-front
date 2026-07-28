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
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import GavelIcon from '@mui/icons-material/Gavel';
import EditIcon from '@mui/icons-material/Edit';
import BalanceIcon from '@mui/icons-material/Balance';
import { useTranslation } from 'react-i18next';

const METHOD_KEYS = [
  { label: 'random', explanation: 'explanation_random', icon: ShuffleIcon },
  { label: 'rules_based', explanation: 'explanation_rules', icon: GavelIcon },
  { label: 'manual', explanation: 'explanation_manual', icon: EditIcon },
  { label: 'balanced', explanation: 'explanation_balanced', icon: BalanceIcon },
];

const GroupSeparationInfoModal = ({ open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Cabeçalho do Modal */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.2rem' }}>
          {t('step_design')}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: '#94a3b8', '&:hover': { color: '#475569', backgroundColor: '#f1f5f9' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Conteúdo com Hierarquia Semântica */}
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        {/* SEÇÃO 1: INTRA-SUJEITOS */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '8px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
              }}
            >
              <PsychologyIcon fontSize="small" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {t('within-subject')}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
            {t('explanation_within')}
          </Typography>
        </Box>

        {/* SEÇÃO 2: ENTRE-SUJEITOS (COM MÉTODOS ANINHADOS) */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
              }}
            >
              <AltRouteIcon fontSize="small" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {t('between-subject')}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, mb: 2 }}>
            {t('explanation_between')}
          </Typography>

          <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

          {/* Subseção de Métodos de Alocação */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#64748b',
              letterSpacing: '0.05em',
              display: 'block',
              mb: 1.5,
            }}
          >
            Métodos de Alocação de Grupos:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {METHOD_KEYS.map(({ label, explanation, icon: Icon }) => (
              <Box
                key={label}
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#94a3b8' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Icon sx={{ fontSize: 18, color: '#64748b' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {t(label)}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.5 }}>
                  {t(explanation)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>

      {/* Ações do Modal */}
      <DialogActions sx={{ p: 2, pt: 0, borderTop: 'none' }}>
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            backgroundColor: '#0284c7',
            '&:hover': { backgroundColor: '#0369a1' },
          }}
        >
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupSeparationInfoModal;