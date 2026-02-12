/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {Box, Accordion, AccordionDetails, AccordionSummary, Button, Divider, Typography, Tooltip } from "@mui/material";
import React from 'react';
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
import styles from '../../style/experimentAccordion.module.css';

const EXPERIMENT_STATUS = Object.freeze({
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    FINISHED: 'FINISHED'
});

const STATUS_CONFIG_OWNER = {
    active: {
        color: '#2e7d32',
        Icon: ToggleOnIcon,
        labelKey: 'experiment_status_active_owner',
        tooltipKey: 'experiment_toggle_deactivate'
    },
    inactive: {
        color: '#757575',
        Icon: ToggleOffIcon,
        labelKey: 'experiment_status_inactive_owner',
        tooltipKey: 'experiment_toggle_activate'
    }
};

const STATUS_CONFIG_PARTICIPANT = {
    active: {
        color: '#2e7d32',
        Icon: CheckCircleIcon,
        labelKey: 'experiment_status_active',
        tooltipKey: 'experiment_status_active_tooltip'
    },
    inactive: {
        color: '#757575',
        Icon: CancelIcon,
        labelKey: 'experiment_status_inactive',
        tooltipKey: 'experiment_status_inactive_tooltip'
    }
};

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

const getStatusConfig = (status, isOwner, t) => {
    const inactive = isStatusInactive(status);
    const configSet = isOwner ? STATUS_CONFIG_OWNER : STATUS_CONFIG_PARTICIPANT;
    const config = inactive ? configSet.inactive : configSet.active;

    return {
        isInactive: inactive,
        label: t?.(config.labelKey) ?? (inactive ? 'Inativo' : 'Ativo'),
        tooltip: t?.(config.tooltipKey) ?? '',
        Icon: config.Icon,
        color: config.color
    };
};

const StatusDisplay = ({
                           isOwner,
                           isInactive,
                           statusColor,
                           StatusIcon,
                           statusLabel,
                           statusTooltip,
                           onEditStatus,
                           experimentId,
                           status
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
                        '&:hover': {backgroundColor: 'rgba(0,0,0,0.04)'}
                    }}
                >
                    <StatusIcon sx={{fontSize: 20, marginRight: '8px'}}/>
                    <Typography variant="body2" sx={{fontWeight: 500}}>
                        {statusLabel}
                    </Typography>
                </Button>
            </Tooltip>
        );
    }

    return (
        <Box className={styles.statusContainer} sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <StatusIcon sx={{fontSize: 20, color: statusColor}}/>
            <Typography variant="body2" sx={{color: '#424242'}}>
                {statusLabel}
            </Typography>
            <Tooltip title={statusTooltip} arrow placement="top" enterDelay={200}>
                <InfoOutlinedIcon
                    sx={{
                        fontSize: 18,
                        color: '#757575',
                        cursor: 'pointer',
                        ml: 0.5
                    }}
                />
            </Tooltip>
        </Box>
    );
};

const ActionButton = ({onClick, variant = 'outlined', color, desktopText, Icon, className, disabled, tooltip}) => {
    const button = (
        <Button
            variant={variant}
            size="small"
            color={color}
            className={className}
            onClick={onClick}
            disabled={disabled}
            sx={variant === 'contained' ? {boxShadow: 'none'} : undefined}
        >
            <span className={styles.desktopText}>{desktopText}</span>
            <span className={styles.mobileText}>
        <Icon fontSize="small"/>
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

const OwnerActions = ({experiment, status, hasActiveParticipants, onEdit, onEdituser, onAccess, onDelete, onViewStats, t}) => {
    const cannotEdit = hasActiveParticipants;
    const editTooltip = hasActiveParticipants
        ? (t?.('cannot_edit_experiment_with_participants') ?? 'Não é possível editar este experimento pois há participantes que já iniciaram.')
        : '';

    return (
        <>
            <ActionButton
                onClick={() => onEdit(experiment._id)}
                desktopText={t?.('edit') ?? 'EDITAR'}
                Icon={EditIcon}
                className={styles.actionButton}
                disabled={cannotEdit}
                tooltip={editTooltip}
            />
            <ActionButton
                onClick={() => onEdituser(experiment._id)}
                desktopText={t?.('edit_user') ?? 'USUÁRIOS'}
                Icon={PersonIcon}
                className={styles.actionButton}
            />
            <ActionButton
                onClick={() => onAccess(experiment._id)}
                desktopText={t?.('export') ?? 'EXPORTAR'}
                Icon={FileDownloadIcon}
                className={styles.actionButton}
            />
            {onViewStats && (
                <ActionButton
                    onClick={() => onViewStats(experiment._id, experiment.name)}
                    desktopText={t?.('view_stats') ?? 'VER DADOS'}
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

const ParticipantActions = ({experiment, userExperimentId, userExperimentStatus, onAccess, isInactive, t}) => (
    <Button
        variant="contained"
        color="primary"
        onClick={() => onAccess(experiment, userExperimentId, userExperimentStatus)}
        disabled={isInactive}
    >
        <span className={styles.desktopText}>{t?.('Access') ?? 'ACESSAR'}</span>
        <span className={styles.mobileText}>
      <MeetingRoomIcon/>
    </span>
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
                                 t
                             }) => {
    const currentStatus = status ?? experiment?.status;
    const {
        isInactive,
        label: statusLabel,
        tooltip: statusTooltip,
        Icon: StatusIcon,
        color: statusColor
    } = getStatusConfig(currentStatus, isOwner, t);

    return (
        <Accordion
            sx={{marginBottom: '5px', border: '1px solid #e0e0e0'}}
            elevation={0}
            expanded={expanded}
            onChange={onChange}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls={`${experiment._id}-content`}
                id={`${experiment._id}-header`}
                sx={{'&:hover': {backgroundColor: '#f5f5f5'}}}
            >
                <Typography sx={{fontSize: '1rem'}}>
                    {experiment.name}
                </Typography>
            </AccordionSummary>

            <Divider/>

            <AccordionDetails sx={{padding: '16px'}}>
                <Typography
                    variant="body2"
                    sx={{marginBottom: '16px', color: 'rgba(0, 0, 0, 0.87)'}}
                    style={{wordBreak: 'break-word'}}
                    dangerouslySetInnerHTML={{__html: experiment.summary}}
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
                                status={currentStatus}
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

export {ExperimentAccordion};