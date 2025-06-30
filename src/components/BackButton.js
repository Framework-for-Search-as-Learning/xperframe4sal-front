import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Tooltip, IconButton } from '@mui/material';



const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const handleGoBack = () => {
    navigate(-1);
  };

  const show = location.pathname !== '/experiments'

  return show ? (

    <Tooltip title="Voltar">
      <IconButton onClick={handleGoBack}>
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  ) : null;
}

export { BackButton };