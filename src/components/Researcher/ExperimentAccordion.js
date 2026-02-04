import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  Typography,
  Tooltip,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import styles from '../../style/experimentAccordion.module.css';

// Constants
const EXPERIMENT_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED'
});

const STATUS_CONFIG = {
  active: {
    color: '#2e7d32',
    Icon: ToggleOnIcon,
    labelKey: 'Iniciado'
  },
  inactive: {
    color: '#757575',
    Icon: ToggleOffIcon,
    labelKey: 'Não iniciado'
  }
};

// Helper functions
const normalizeStatus = (status) => {
  return (status ?? '').toString().trim().toUpperCase();
};

const isStatusInactive = (status) => {
  const normalized = normalizeStatus(status);
  return normalized === EXPERIMENT_STATUS.FINISHED || normalized === EXPERIMENT_STATUS.NOT_STARTED;
};

const canEditExperiment = (status) => {
  const normalized = normalizeStatus(status);
  return normalized === EXPERIMENT_STATUS.FINISHED || normalized === EXPERIMENT_STATUS.NOT_STARTED;
};

const isStatusActive = (status) => {
  const normalized = normalizeStatus(status);
  return normalized === EXPERIMENT_STATUS.IN_PROGRESS;
};

const getStatusConfig = (status, t) => {
  const inactive = isStatusInactive(status);
  const config = inactive ? STATUS_CONFIG.inactive : STATUS_CONFIG.active;
  
  return {
    isInactive: inactive,
    label: t?.(config.labelKey) ?? (inactive ? 'Inativo' : 'Ativo'),
    Icon: config.Icon,
    color: config.color
  };
};

// Sub-components
const StatusDisplay = ({ isOwner, isInactive, statusColor, StatusIcon, statusLabel, onEditStatus, experimentId, status }) => {
  if (isOwner) {
    return (
      <Tooltip title={isInactive ? 'Clique para Ativar' : 'Clique para Desativar'}>
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
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <StatusIcon sx={{ fontSize: 25, marginRight: '8px' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Status: {statusLabel}
          </Typography>
        </Button>
      </Tooltip>
    );
  }

  return (
    <Box className={styles.statusContainer}>
      <StatusIcon sx={{ fontSize: 25, color: statusColor }} />
      <Typography variant="body2" sx={{ color: '#424242' }}>
        Status: {statusLabel}
      </Typography>
    </Box>
  );
};

const ActionButton = ({ onClick, variant = 'outlined', color, desktopText, Icon, className, disabled, tooltip }) => {
  const button = (
    <Button
      variant={variant}
      size="small"
      color={color}
      className={className}
      onClick={onClick}
      disabled={disabled}
      sx={variant === 'contained' ? { boxShadow: 'none' } : undefined}
    >
      <span className={styles.desktopText}>{desktopText}</span>
      <span className={styles.mobileText}>
        <Icon fontSize="small" />
      </span>
    </Button>
  );

  if (tooltip && disabled) {
    return (
      <Tooltip title={tooltip}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
};

const OwnerActions = ({ experiment, status, onEdit, onEdituser, onAccess, onDelete, onViewStats, t }) => {
  const isActive = isStatusActive(status);
  // const editTooltip = isActive 
  //   ? (t?.('cannot_edit_active_experiment') ?? 'Não é possível editar um experimento ativo. Desative-o primeiro.')
  //   : '';
   const editTooltip = isActive 
    ? ('Não é possível editar um experimento ativo. Desative-o primeiro.')
    : '';

  return (
    <>
      <ActionButton
        onClick={() => onEdit(experiment._id)}
        desktopText={t?.('edit') ?? 'EDITAR'}
        Icon={EditIcon}
        className={styles.actionButton}
        disabled={isActive}
        tooltip={editTooltip}
      />
      <ActionButton
        onClick={() => onEdituser(experiment._id)}
        desktopText={t?.('edit_user') ?? 'USUÁRIOS'}
        Icon={PersonIcon}
        className={styles.actionButton}
      />
      <ActionButton
        onClick={() => onAccess(experiment)}
        desktopText={t?.('export') ?? 'EXPORTAR'}
        Icon={FileDownloadIcon}
        className={styles.actionButton}
      />
      {onViewStats && (
        <ActionButton
          onClick={() => onViewStats(experiment._id, experiment.name)}
          desktopText={'VER DADOS'}
          Icon={AssessmentIcon}
          className={styles.actionButton}
        />
      )}
      <ActionButton
        onClick={() => onDelete(experiment._id)}
        variant="contained"
        color="error"
        desktopText={t?.('delete') ?? 'EXCLUIR'}
        Icon={DeleteIcon}
        className={`${styles.actionButton} ${styles.deleteButton}`}
      />
    </>
  );
};

const ParticipantActions = ({ experiment, userExperimentId, userExperimentStatus, onAccess, isInactive, t }) => (
  <Button
    variant="contained"
    color="primary"
    onClick={() => onAccess(experiment, userExperimentId, userExperimentStatus)}
    disabled={isInactive}
  >
    <span className={styles.desktopText}>{t?.('Access') ?? 'ACESSAR'}</span>
    <span className={styles.mobileText}>
      <MeetingRoomIcon />
    </span>
  </Button>
);

// Main component
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
  t
}) => {
  const currentStatus = status ?? experiment?.status;
  const { isInactive, label: statusLabel, Icon: StatusIcon, color: statusColor } = getStatusConfig(currentStatus, t);
  return (
    <Accordion
      sx={{ marginBottom: '5px', border: '1px solid #e0e0e0' }}
      elevation={0}
      expanded={expanded}
      onChange={onChange}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${experiment._id}-content`}
        id={`${experiment._id}-header`}
        sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
      >
        <Typography sx={{ fontSize: '1rem' }}>
          {experiment.name}
        </Typography>
      </AccordionSummary>

      <Divider />

      <AccordionDetails sx={{ padding: '16px' }}>
        <Typography
          variant="body2"
          sx={{ marginBottom: '16px', color: 'rgba(0, 0, 0, 0.87)' }}
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
              onEditStatus={onEditStatus}
              experimentId={experiment._id}
              status={currentStatus}
            />
          </Box>

          <Box className={styles.buttonContainer}>
            {isOwner ? (
              <OwnerActions
                experiment={experiment}
                status={currentStatus}
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