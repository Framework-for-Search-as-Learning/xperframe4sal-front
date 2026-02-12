/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import { Alert, AlertTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ErrorMessage = ({ style, message, messageType, onClose }) => {
  return (
    message && (
      <Alert style={style}
        severity={messageType === 'fail' ? "error" : (messageType || 'success')}
        action={onClose && <IconButton onClick={onClose}><CloseIcon /></IconButton>}>
        <AlertTitle>{messageType === 'fail' ? "Erro" : ""}</AlertTitle>
        {message}
      </Alert>
    )
  );
};

export { ErrorMessage };