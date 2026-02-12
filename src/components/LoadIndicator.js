/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { CircularProgress, Box } from '@mui/material';

const LoadingIndicator = ({ size }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '30vh',
    }}
  >
    <CircularProgress size={size} />
  </Box>

);

export { LoadingIndicator };