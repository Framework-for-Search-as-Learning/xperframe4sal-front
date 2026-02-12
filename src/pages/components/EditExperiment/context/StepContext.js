/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

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