import {
  Typography,
} from '@mui/material';

import { ExperimentStatus } from '../components/ExperimentStatus';

const mountSteps = (steps, stepsCompleted) => {
  //TODO Fiz aparecer os labels, mas precisa de mais correções 
  
  steps = {
    "icf": false,
    "pre": false,
    "task": false,
    "post": false
   
  }
  steps = Object.entries(steps);
  console.log("Step:", steps)
  steps = steps.sort((a, b) => a[1].order - b[1].order);
  console.log("Teste:", steps)
  const stepsToReturn = [];
  for (const [key, value] of steps) {
    console.log("Key: ", key)
    console.log("label: ", value)
    stepsToReturn.push({ label: key, completed: stepsCompleted[key], link: value["link"] || "" });
  }

  return stepsToReturn;
}

const ExperimentTemplate = ({ steps, headerTitle, children }) => {

  return (
    <>
      <ExperimentStatus steps={steps} />
      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.0rem', sm: '1.2rem' } }}>
        {headerTitle}
      </Typography>
      {children}
    </>
  );
}

export { ExperimentTemplate, mountSteps }