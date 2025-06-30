let Experiment = (function() {
  let experiment = {};

  let setExperiment = function(experimentObject) {
    experiment = experimentObject
  }

  let getExperiment = function() {
    return experiment;
  }

  return {
    setExperiment: setExperiment,
    getExperiment: getExperiment
  }

})();

export default Experiment;