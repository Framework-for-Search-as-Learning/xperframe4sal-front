import React, { createContext } from 'react';
const StepContext = createContext({
    ExperimentTitle: '',
    setExperimentTitle: () => {},
    ExperimentType: '',
    setExperimentType: () => {},
    BtypeExperiment: '',
    setBtypeExperiment: () => {},
    ExperimentDesc: '',
    setExperimentDesc: () => {},
    ExperimentId: '',
    setExperimentId: () => {},
    ExperimentSurveys: '',
    setExperimentSurveys: () => {},
});


export default StepContext;