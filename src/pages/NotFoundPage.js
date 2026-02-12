/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm">
      <Box mt={8} textAlign="center">
        <ErrorOutline color="error" style={{ fontSize: 100 }} />
        <Typography variant="h4" gutterBottom>
          {t('not_found_title')}
        </Typography>
        <Typography variant="body1">
          {t('not_found_message')}
        </Typography>
        <Link to="/">
          <Button variant="contained" color="primary">
            {t('back_home_button')}
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export { NotFoundPage };
