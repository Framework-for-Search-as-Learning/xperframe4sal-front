/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  Typography,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import React, { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ScienceIcon from '@mui/icons-material/Science';
import styles from '../../style/experimentAccordion.module.css';

const EXPERIMENT_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
});

const STATUS_CONFIG_OWNER = {
  active: {
    color: '#2e7d32',
    Icon: ToggleOnIcon,
    labelKey: 'experiment_status_active_owner',
    tooltipKey: 'experiment_toggle_deactivate',
  },
  inactive: {
    color: '#757575',
    Icon: ToggleOffIcon,
    labelKey: 'experiment_status_inactive_owner',
    tooltipKey: 'experiment_toggle_activate',
  },
};

const STATUS_CONFIG_PARTICIPANT = {
  active: {
    color: '#2e7d32',
    Icon: CheckCircleIcon,
    labelKey: 'experiment_status_active',
    tooltipKey: 'experiment_status_active_tooltip',
  },
  inactive: {
    color: '#757575',
    Icon: CancelIcon,
    labelKey: 'experiment_status_inactive',
    tooltipKey: 'experiment_status_inactive_tooltip',
  },
};

const normalizeStatus = (status) => {
  return (status ?? '').toString().trim().toUpperCase();
};

const isStatusInactive = (status) => {
  const normalized = normalizeStatus(status);
  return normalized === EXPERIMENT_STATUS.FINISHED || normalized === EXPERIMENT_STATUS.NOT_STARTED;
};

const getStatusConfig = (status, isOwner, t) => {
  const inactive = isStatusInactive(status);
  const configSet = isOwner ? STATUS_CONFIG_OWNER : STATUS_CONFIG_PARTICIPANT;
  const config = inactive ? configSet.inactive : configSet.active;

  return {
    isInactive: inactive,
    label: t?.(config.labelKey) ?? (inactive ? 'Inativo' : 'Ativo'),
    tooltip: t?.(config.tooltipKey) ?? '',
    Icon: config.Icon,
    color: config.color,
  };
};

const StatusDisplay = ({
  isOwner,
  statusColor,
  StatusIcon,
  statusLabel,
  statusTooltip,
  onEditStatus,
  experimentId,
  status,
}) => {
  if (isOwner) {
    return (
      <Tooltip title={statusTooltip}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEditStatus(experimentId, status);
          }}
          sx={{
            textTransform: 'none',
            color: statusColor,
            padding: '4px 8px',
            minWidth: 'auto',
            borderRadius: '6px',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        >
          <StatusIcon sx={{ fontSize: 20, marginRight: '8px' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {statusLabel}
          </Typography>
        </Button>
      </Tooltip>
    );
  }

  return (
    <Box className={styles.statusContainer} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <StatusIcon sx={{ fontSize: 20, color: statusColor }} />
      <Typography variant="body2" sx={{ color: '#424242', fontWeight: 500 }}>
        {statusLabel}
      </Typography>
      <Tooltip title={statusTooltip} arrow placement="top" enterDelay={200}>
        <InfoOutlinedIcon
          sx={{
            fontSize: 18,
            color: '#757575',
            cursor: 'pointer',
            ml: 0.5,
          }}
        />
      </Tooltip>
    </Box>
  );
};

const OwnerActions = ({
  experiment,
  hasActiveParticipants,
  onEdit,
  onEdituser,
  onAccess,
  onDelete,
  onViewStats,
  t,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const editTooltip = hasActiveParticipants
    ? (t?.('edit_experiment_with_participants_warning') ??
      'Há participantes que já iniciaram este experimento. Alterações podem afetar os dados coletados.')
    : (t?.('edit') ?? 'EDITAR');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {onViewStats && (
        <Tooltip title={t?.('view_stats') ?? 'VER DADOS'}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onViewStats(experiment._id, experiment.name)}
            sx={{
              border: '1px solid',
              borderColor: 'primary.light',
              backgroundColor: 'primary.50',
              '&:hover': { backgroundColor: 'primary.100' },
            }}
          >
            <AssessmentIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title={editTooltip}>
        <IconButton
          size="small"
          color="warning"
          onClick={() => onEdit(experiment._id)}
          sx={{
            border: '1px solid',
            borderColor: 'warning.light',
            backgroundColor: 'warning.50',
            '&:hover': { backgroundColor: 'warning.100' },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title={t?.('participants') ?? 'PARTICIPANTES'}>
        <IconButton
          size="small"
          color="success"
          onClick={() => onEdituser(experiment._id)}
          sx={{
            border: '1px solid',
            borderColor: 'success.light',
            backgroundColor: 'success.50',
            '&:hover': { backgroundColor: 'success.100' },
          }}
        >
          <PersonIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title={t?.('more_options') ?? 'MAIS OPÇÕES'}>
        <IconButton
          size="small"
          onClick={handleOpenMenu}
          sx={{ border: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onAccess(experiment._id);
          }}
        >
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText>{t?.('export') ?? 'EXPORTAR'}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onDelete(experiment._id);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t?.('delete') ?? 'EXCLUIR'}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

const ParticipantActions = ({
  experiment,
  userExperimentId,
  userExperimentStatus,
  onAccess,
  isInactive,
  t,
}) => (
  <Button
    variant="contained"
    color="primary"
    onClick={() => onAccess(experiment, userExperimentId, userExperimentStatus)}
    disabled={isInactive}
    startIcon={<MeetingRoomIcon />}
    sx={{
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: '8px',
      px: 2.5,
    }}
  >
    {t('Access')}
  </Button>
);

const ExperimentAccordion = ({
  experiment,
  userExperimentId,
  userExperimentStatus,
  status,
  expanded,
  onChange,
  onAccess,
  onEdit,
  onEditStatus,
  onDelete,
  onEdituser,
  onViewStats,
  isOwner,
  hasActiveParticipants,
  t,
}) => {
  const currentStatus = status ?? experiment?.status;
  const {
    isInactive,
    label: statusLabel,
    tooltip: statusTooltip,
    Icon: StatusIcon,
    color: statusColor,
  } = getStatusConfig(currentStatus, isOwner, t);

  return (
    <Accordion
      disableGutters
      elevation={expanded ? 2 : 0}
      expanded={expanded}
      onChange={onChange}
      sx={{
        borderRadius: '12px !important',
        border: '1px solid',
        borderColor: expanded ? '#0284c7' : '#e2e8f0',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease-in-out',
        '&:before': { display: 'none' }, // Remove linha divisória padrão do MUI Accordion
        '&:hover': {
          borderColor: expanded ? '#0284c7' : '#cbd5e1',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: expanded ? '#0284c7' : '#64748b' }} />}
        aria-controls={`${experiment._id}-content`}
        id={`${experiment._id}-header`}
        sx={{
          px: 2.5,
          py: 0.5,
          backgroundColor: expanded ? '#f8fafc' : 'transparent',
          borderRadius: expanded ? '12px 12px 0 0' : '12px',
          '&:hover': { backgroundColor: '#f8fafc' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: expanded ? '#e0f2fe' : '#f1f5f9',
              color: expanded ? '#0284c7' : '#64748b',
            }}
          >
            <ScienceIcon fontSize="small" />
          </Box>

          <Typography
            sx={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: expanded ? '#0f172a' : '#334155',
              letterSpacing: '-0.01em',
            }}
          >
            {experiment.name}
          </Typography>
        </Box>
      </AccordionSummary>

      {expanded && <Divider sx={{ borderColor: '#f1f5f9' }} />}

      <AccordionDetails sx={{ p: 2.5, backgroundColor: '#ffffff', borderRadius: '0 0 12px 12px' }}>
        <Typography
          variant="body2"
          component="div"
          className="rich-text-preview"
          sx={{
            marginBottom: '20px',
            color: '#475569',
            lineHeight: 1.6,
          }}
          style={{ wordBreak: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: experiment.summary }}
        />

        <Box className={styles.footerContainer}>
          <Box className={styles.statusWrapper}>
            <StatusDisplay
              isOwner={isOwner}
              isInactive={isInactive}
              statusColor={statusColor}
              StatusIcon={StatusIcon}
              statusLabel={statusLabel}
              statusTooltip={statusTooltip}
              onEditStatus={onEditStatus}
              experimentId={experiment._id}
              status={currentStatus}
            />
          </Box>

          <Box className={styles.buttonContainer}>
            {isOwner ? (
              <OwnerActions
                experiment={experiment}
                hasActiveParticipants={hasActiveParticipants}
                onEdit={onEdit}
                onEdituser={onEdituser}
                onAccess={onAccess}
                onDelete={onDelete}
                onViewStats={onViewStats}
                t={t}
              />
            ) : (
              <ParticipantActions
                experiment={experiment}
                userExperimentId={userExperimentId}
                userExperimentStatus={userExperimentStatus}
                onAccess={onAccess}
                isInactive={isInactive}
                t={t}
              />
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export { ExperimentAccordion };