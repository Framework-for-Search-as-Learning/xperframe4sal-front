/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { createContext } from 'react';
const StepContextCreate = createContext({
    step: 0,
    setStep: () => {},
    ExperimentTitle: '',
    setExperimentTitle: () => {},
    ExperimentType: '',
    setExperimentType: () => {},
    BtypeExperiment: '',
    setBtypeExperiment: () => {},
    ExperimentDesc: '',
    setExperimentDesc: () => {},
    ExperimentTasks: [],
    setExperimentTasks: () => {},
    ExperimentSurveys: [],
    setExperimentSurveys: () => {},
    ExperimentTitleICF: [],
    setExperimentTitleICF: () => {},
    ExperimentDescICF: [],
    setExperimentDescICF: () => {},
});


export default StepContextCreate;