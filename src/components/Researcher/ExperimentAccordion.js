import { Accordion, AccordionDetails, AccordionSummary, Button, Divider, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from '../../style/text.module.css'

const ExperimentAccordion = ({ experiment, expanded, onChange, onAccess, onEdit, onDelete, onEdituser, isOwner, t }) => (
  <Accordion
    sx={{ marginBottom: '5px' }}
    elevation={3}
    expanded={expanded}
    onChange={onChange}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls={`${experiment._id}-content`}
      id={`${experiment._id}-header`}
      sx={{
        wordBreak: 'break-word',
        '&:hover': {
          backgroundColor: 'lightgray',
        },
      }}
    >
      <Typography>{experiment.name}</Typography>
    </AccordionSummary>
    <Divider />
    <AccordionDetails>
      <Typography
        style={{ wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: experiment.summary }}
      />
      <div className={styles.buttonContainer} >
        {isOwner ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onEdituser(experiment._id)}
            >
              <div className={styles.desktopText} >
                {t('edit_user')}
              </div>
              <div className={styles.mobileText} >
                <PersonIcon />
              </div>
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => onEdit(experiment._id)}
            >
              <div className={styles.desktopText} >
                {t('edit')}
              </div>
              <div className={styles.mobileText} >
                <EditIcon />
              </div>
            </Button>

            <Button
              variant="contained"
              color="primary"
              style={{ background: '#D32F2F' }}
              onClick={() => onDelete(experiment._id)}
            >
              <div className={styles.desktopText} >
                {t('delete')}
              </div>
              <div className={styles.mobileText} >
                <DeleteIcon />
              </div>
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onAccess(experiment._id)}
          >
            <div className={styles.desktopText} >
              {t('Access')}
            </div>
            <div className={styles.mobileText} >
              <MeetingRoomIcon />
            </div>
          </Button>
        )}
      </div>
    </AccordionDetails>
  </Accordion>
);

export { ExperimentAccordion }