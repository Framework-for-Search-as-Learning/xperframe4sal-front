import { Accordion, AccordionDetails, AccordionSummary, Button, Divider, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import textStyles from '../../style/text.module.css'
import customstyles from '../../style/experimentAccordion.module.css'
import { FileDownload } from "@mui/icons-material";

const styles = { ...textStyles, ...customstyles }

const ExperimentOverview = ({ experiment, expanded, onChange, onAccess, onEdit, onDelete, onEdituser, isOwner, t }) => (
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
      
    </AccordionDetails>
  </Accordion>
);

export { ExperimentOverview }