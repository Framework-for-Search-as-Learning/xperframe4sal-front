import { Skeleton } from "@mui/material";

const LoadingState = () => (
  <div>
    {[...Array(3)].map((_, index) => (
      <Skeleton key={index} variant="rectangular" height={80} style={{ marginBottom: '8px' }} />
    ))}
  </div>
);

export {LoadingState}