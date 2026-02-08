/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Skeleton } from "@mui/material";

const LoadingState = () => (
  <div>
    {[...Array(3)].map((_, index) => (
      <Skeleton key={index} variant="rectangular" height={80} style={{ marginBottom: '8px' }} />
    ))}
  </div>
);

export {LoadingState}