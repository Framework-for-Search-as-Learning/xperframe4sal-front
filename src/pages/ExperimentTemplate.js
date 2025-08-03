import {
  Typography,
} from '@mui/material';

import { ExperimentStatus } from '../components/ExperimentStatus';

const mountSteps = (steps, stepsCompleted) => {
    steps = {
    "icf": false,
    "pre": false,
    "post": false,
    "task": false
  }
  steps = Object.entries(steps);
  console.log("Step:", steps)
  steps = steps.sort((a, b) => a[1].order - b[1].order);

  const stepsToReturn = [];
  for (const [key, value] of steps) {
    stepsToReturn.push({ label: value["label"], completed: stepsCompleted[key], link: value["link"] || "" });
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