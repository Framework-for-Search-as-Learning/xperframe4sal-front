/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { createContext } from 'react';
const StepContext = createContext({
  step: 0,
  setStep: () => {},
  isCurrentStepValid: true,
  setIsCurrentStepValid: () => {},
  isEditMode: false,
  handleSaveExperiment: () => {},
  handleCreateExperiment: () => {},
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

export default StepContext;
