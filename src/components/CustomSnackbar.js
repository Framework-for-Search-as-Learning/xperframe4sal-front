/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */


import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import LinearProgress from '@mui/material/LinearProgress';

const CustomSnackbar = ({ open, handleClose, time, message, severity = "success", variant = "standard", slide = false, showLinear = false }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 10 : prevProgress + 10));
    }, time);
    return () => {
      clearInterval(timer);
    };
  }, [open, time]);

  const TransitionComponent = slide ? Slide : undefined;

  return (
    <Snackbar open={open} autoHideDuration={time} TransitionComponent={TransitionComponent} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity} variant={variant}>
        <div>
          {showLinear ? <LinearProgress variant="indeterminate" color="inherit" value={progress} /> : ""}
          {message ? <p>{message}</p> : <p>Seu questionário foi submetido com sucesso. Obrigado!</p>}
        </div>
      </Alert>
    </Snackbar>
  );
};

export { CustomSnackbar };