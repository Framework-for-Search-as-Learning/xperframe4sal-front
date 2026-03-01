import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
} from "@mui/material";

/**
 * Reusable Delete Confirmation Dialog
 */
const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  t,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          boxShadow: 5,
          padding: 4,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          color: "#111827",
          textAlign: "center",
          paddingBottom: "8px",
        }}
      >
        {title || t("confirm_delete")}
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", color: "#6b7280" }}>
        <Box sx={{ marginBottom: 3 }}>
          <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.5 }}>
            {message || t("delete_confirmation_message")}
          </p>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: "#d1d5db",
              color: "#374151",
              ":hover": { backgroundColor: "#f3f4f6" },
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onConfirm}
            sx={{ boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)" }}
          >
            {t("delete")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
