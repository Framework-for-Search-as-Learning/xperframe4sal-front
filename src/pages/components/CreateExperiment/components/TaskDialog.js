import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import TaskForm from "./TaskForm";

/**
 * Reusable Task Dialog for Create/Edit
 */
const TaskDialog = ({
  open,
  onClose,
  mode,
  config,
  onSubmit,
  isLoading,
  experimentType,
  btypeExperiment,
  experimentSurveys,
  scoreType,
  setScoreType,
  t,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: 3,
          padding: 4,
        },
      }}
    >
      <DialogTitle>
        {mode === "create" ? t("task_creation") : t("task_edit")}
      </DialogTitle>
      <DialogContent>
        <TaskForm
          config={config}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          experimentType={experimentType}
          btypeExperiment={btypeExperiment}
          experimentSurveys={experimentSurveys}
          scoreType={scoreType}
          setScoreType={setScoreType}
          t={t}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
