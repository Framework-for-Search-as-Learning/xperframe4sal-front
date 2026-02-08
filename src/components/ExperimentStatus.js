/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import Box from '@mui/material/Box';
import StepLabel from '@mui/material/StepLabel';
import DoneIcon from '@mui/icons-material/Done';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { t } from 'i18next';


const ExperimentStatus = (params) => {
  const { experimentId } = useParams();

  const steps = params.steps || [];
  const completeds = params.completeds || [];

  const isSmallerScreen = useMediaQuery('(max-width:600px)');

  return (
    <Box sx={{
      width: '100%',
      padding: '15px',
      display: { xs: 'flex', sm: 'block' },
      marginBottom: 2,
      justifyContent: 'center',
      backgroundColor: '#DDF4FF'
    }}>
      <Stepper
        activeStep={completeds.length - 1}
        orientation={isSmallerScreen ? 'vertical' : 'horizontal'}
      >
        {steps.map((step, index) => {
          const labelProps = {};
          if (step?.completed) {
            labelProps.StepIconComponent = () => { return (<DoneIcon />) };
            labelProps.sx = { color: "green" };
          } else {
            labelProps.error = true;
            labelProps.sx = { cursor: "pointer" }
          }
          labelProps.sx = Object.assign(labelProps.sx, { my: { xs: -2, sm: 'auto' } })
          return (

            <Step key={index}>
              {(!labelProps.error || (index !== completeds.length) || (!step.link)) && <StepLabel {...labelProps} ><Typography variant='h7' color={labelProps.error ? "red" : "green"}>{t(step.label)}</Typography></StepLabel>}
              {labelProps.error && (index === completeds.length) && step.link && (
                <Link to={step.link.replace("{experimentId}", experimentId)} style={{ textDecoration: 'none' }}>
                  <StepLabel {...labelProps} style={{ cursor: 'pointer' }}  ><Typography variant='h7' color={labelProps.error ? "red" : "green"}>{t(step.label)}</Typography></StepLabel>
                </Link>
              )}
            </Step>

          );
        })}
      </Stepper>
    </Box>
  );
};


export { ExperimentStatus };