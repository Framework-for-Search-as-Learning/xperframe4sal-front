import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button, Divider, Typography, Tooltip } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BlockIcon from '@mui/icons-material/Block'; 
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'; 
import styles from '../../style/experimentAccordion.module.css';

const ExperimentAccordion = ({ 
  experiment, 
  status, 
  expanded, 
  onChange, 
  onAccess,  
  onEdit, 
  onEditStatus, 
  onDelete, 
  onEdituser, 
  isOwner, 
  t 
}) => {
  
  const translate = (key, fallback) => t ? t(key) : fallback;

  const resolveStatus = (s) => {
    const raw = (s ?? experiment?.status ?? '').toString().trim().toLowerCase();
    const inactiveValues = ['finished', 'finished', 'inactive', 'inativo', 'completed', 'done', 'false', '0'];
    const isInactive = inactiveValues.includes(raw);
    const label = isInactive ? (t ? t('inactive') : 'Inativo') : (t ? t('active') : 'Ativo');
    const Icon = isInactive ? BlockIcon : PlayCircleOutlineIcon;
    const color = isInactive ? '#757575' : '#2e7d32';
    return { isInactive, label, Icon, color };
  };

  const { isInactive, label: statusLabel, Icon: StatusIcon, color: statusColor } = resolveStatus(status);

  return (
    <Accordion
      sx={{ marginBottom: '10px', border: '1px solid #e0e0e0' }}
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

        <div className={styles.footerContainer}>
          
          <div className={styles.statusWrapper}>
             {isOwner ? (
                <Tooltip title={isInactive ? "Clique para Ativar" : "Clique para Desativar"}>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStatus(experiment._id, status);
                    }}
                    sx={{ 
                      textTransform: 'none', 
                      color: statusColor,
                      padding: '4px 8px',
                      minWidth: 'auto',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <StatusIcon sx={{ fontSize: 20, marginRight: '8px' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                       Status: {statusLabel}
                    </Typography>
                  </Button>
                </Tooltip>
             ) : (

                <div className={styles.statusContainer}>
                   <StatusIcon sx={{ fontSize: 18, color: statusColor }} />
                   <Typography variant="body2" sx={{ color: '#424242' }}>
                      Status: {statusLabel}
                   </Typography>
                </div>
             )}
          </div>

          <div className={styles.buttonContainer}>
            {isOwner ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  className={styles.actionButton}
                  onClick={() => onEdit(experiment._id)}
                >
                  <span className={styles.desktopText}>{translate('edit', 'EDITAR')}</span>
                  <span className={styles.mobileText}><EditIcon fontSize="small"/></span>
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  className={styles.actionButton}
                  onClick={() => onEdituser(experiment._id)}
                >
                  <span className={styles.desktopText}>{translate('edit_user', 'USUÁRIOS')}</span>
                  <span className={styles.mobileText}><PersonIcon fontSize="small"/></span>
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  className={styles.actionButton}
                  onClick={() => onAccess(experiment._id)}
                >
                  <span className={styles.desktopText}>{translate('export', 'EXPORTAR')}</span>
                  <span className={styles.mobileText}><FileDownloadIcon fontSize="small"/></span>
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => onDelete(experiment._id)}
                  sx={{ boxShadow: 'none' }}
                >
                  <span className={styles.desktopText}>{translate('delete', 'EXCLUIR')}</span>
                  <span className={styles.mobileText}><DeleteIcon fontSize="small"/></span>
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => onAccess(experiment._id)}
                disabled={isInactive}
              >
                <span className={styles.desktopText}>{translate('Access', 'ACESSAR')}</span>
                <span className={styles.mobileText}><MeetingRoomIcon /></span>
              </Button>
            )}
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export { ExperimentAccordion };